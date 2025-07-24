import * as Hapi from "@hapi/hapi";
import  {Models, sequelize} from "../models";
import * as Common from "./common";
import Moment from "moment";
import * as Constants from "../constants";
import * as _ from "lodash";
import { Sequelize, Op } from "../config/dbImporter";
import { Literal } from "sequelize/types/utils";
import { request } from "http";
import {hapi} from "hapi-i18n"
import { Schema } from "joi";
// import { emailTemplate } from "../validators/emails";

type AttributeElement = string | [Literal, string];
import { EmailTemplate,EmailTemplateContent } from "../config/interfaces/emailTemplates";
import { Template } from "aws-sdk/clients/appsync";


const attributes: AttributeElement[] = [
    'id', 'code', 'status', 'userId', 'isRevision', 'revisionId', 'createdAt', 'updatedAt', 'replacements',
    [sequelize.literal('(case when `content`.title is not null then `content`.title else `defaultContent`.title END)'), 'title'],
    [sequelize.literal('(case when `content`.subject is not null then `content`.subject else `defaultContent`.subject END)'), 'subject'],
    [sequelize.literal('(case when `content`.`message` is not null then `content`.`message` else `defaultContent`.`message` END)'), 'message']
];

const authorAttributes: AttributeElement[] = [
    'id',
    [sequelize.literal('`author->userProfile`.`name`'), 'name'],
    [sequelize.literal('`author->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
];

const updatedByAttributes: AttributeElement[] = [
    'id',
    [sequelize.literal('`updatedBy->userProfile`.`name`'), 'name'],
    [sequelize.literal('`updatedBy->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
];

const storeRevision = async (templateObject:EmailTemplate , userId: number, transaction: Sequelize.Transaction) => {
    try {
        console.log(templateObject)
        let revisionObject: EmailTemplate = { ...templateObject};
        delete revisionObject.id;
        revisionObject.isRevision = true;
        revisionObject.code = revisionObject.code + '-' + Moment().toISOString();
        revisionObject.revisionId = templateObject.id as number || 0;
        revisionObject.userId = userId;
        let contentLength = revisionObject?.EmailTemplateContents?.length??0
        revisionObject.EmailTemplateContents = revisionObject?.EmailTemplateContents?.filter(function (props) {
            delete props.id;
            delete props.EmailTemplateId;
            return props;
        });
        console.log(revisionObject, "================= obj")
        let revision = await Models.EmailTemplate.create(revisionObject, { include: [{ model: Models.EmailTemplateContent }], transaction: transaction });
        console.log(revision, " ================ rev")
        if (revision)
            return revision;
        else
            return false;
    } catch (err) {
        console.log(err)
        return false;
    }
};

const fetch = async (id: number, language: string) => {
    let emailTemplate = await Models.EmailTemplate.findOne({
        attributes: attributes,
        include: [
            {
                attributes: [],
                model: Models.EmailTemplateContent, as: 'content',
                include: [
                    { attributes: [], model: Models.Language, where: { code: language } }
                ]
            },
            {
                attributes: [],
                model: Models.EmailTemplateContent, as: 'defaultContent',
                include: [
                    { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                ]
            },
            {
                model: Models.User,
                as: 'updatedBy',
                attributes: updatedByAttributes,
                include: [
                    {
                        model: Models.UserProfile,
                        as: "userProfile",
                        attributes: [],
                        include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }]
                    }
                ]
            },
            {
                model: Models.User,
                as: 'author',
                attributes: authorAttributes,
                include: [
                    {
                        model: Models.UserProfile,
                        as: "userProfile",
                        attributes: [],
                        include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }]
                    }
                ]
            }
        ],
        where: { id: id },
        subQuery: false,
    });
    return emailTemplate;
};

const fetchByCode = async (code: string, language: string) => {
    let emailTemplate = await Models.EmailTemplate.findOne({
        attributes: attributes,
        include: [
            {
                attributes: [],
                model: Models.EmailTemplateContent, as: 'content',
                include: [
                    { attributes: [], model: Models.Language, where: { code: language } }
                ]
            },
            {
                attributes: [],
                model: Models.EmailTemplateContent, as: 'defaultContent',
                include: [
                    { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                ]
            }
        ],
        where: { code: code },
        subQuery: false,
    });

    if(emailTemplate) {
        emailTemplate = JSON.parse(JSON.stringify(emailTemplate))
    }

    return emailTemplate;
};

export const create = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction()
    try {
       
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let { code, title, subject, message, replacements } = request.payload;
        let messageText = await Common.convertHtmlToText(message);
        let language = request.headers.language;
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUAGE_CODE } });
        let defaultLanguageObject: any = {};
        let requestedLanguageObject: any = {};
        let EmailTemplateContents :any[] = [];
        if (language != process.env.DEFAULT_LANGUAGE_CODE) {
            // create content in default language as user language is not default
            let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
            if (defaultLanguage && requestedLanguage) {
                // create Email template in default in requested language
                defaultLanguageObject = {
                    title: title,
                    subject: subject,
                    message: message,
                    mesageText: messageText,
                    languageId: defaultLanguage.id
                };
                requestedLanguageObject = {
                    title: title,
                    subject: subject,
                    message: message,
                    mesageText: messageText,
                    languageId: requestedLanguage.id
                }
                EmailTemplateContents.push(defaultLanguageObject, requestedLanguageObject)
            } else {
          
                await transaction?.rollback()
                return Common.generateError(request, 400, 'ERROR_WHILE_FETCHING_REQUIRED_LANGUAGE_FOR_CONTENT_CREATION', {});
            }
        } else {
            defaultLanguageObject = {
                title: title,
                subject: subject,
                message: message,
                messageText: messageText,
                languageId: defaultLanguage?.id
            }
            EmailTemplateContents.push(defaultLanguageObject)
        }
        let emailTemplate = await Models.EmailTemplate.create(
            {
                code: code,
                replacements: replacements,
                userId: userId,
                accountId: accountId,
                status: Constants.STATUS.ACTIVE,
                EmailTemplateContents: EmailTemplateContents
            },
            {
                include: [{model:Models.EmailTemplateContent}],
                transaction: transaction
            }
        );
        if (emailTemplate) {
            await transaction?.commit();
            let returnOBj = JSON.parse(JSON.stringify(emailTemplate));
            returnOBj['title'] = returnOBj.EmailTemplateContents[0].title;
            returnOBj['subject'] = returnOBj.EmailTemplateContents[0].subject;
            returnOBj['message'] = returnOBj.EmailTemplateContents[0].message;
            returnOBj['messageText'] = returnOBj.EmailTemplateContents[0].messageText;
            returnOBj = _.omit(returnOBj, ['EmailTemplateContents']);

            return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: returnOBj }).code(200);
        } else {
            await transaction?.rollback();
            return Common.generateError(request, 400, 'ERROR_WHILE_CREATING_THE_EMAIL_TEMPLATE', {});
        }
    } catch (err) {
        console.log(err)
        await transaction?.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction()
    try {
        let { id } = request.params;
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let { code, title, subject, message, replacements } = request.payload;
        let emailTemplate = await Models.EmailTemplate.findOne({
            where: { id: id, isRevision: false, revisionId: null },
            include: [
                {
                    model: Models.EmailTemplateContent
                }
            ]
        });
        if (emailTemplate) {    
            emailTemplate = JSON.parse(JSON.stringify(emailTemplate))
            let revisonObject:EmailTemplate = JSON.parse(JSON.stringify(emailTemplate));
            let revision = await storeRevision(revisonObject, userId, transaction);
            if (revision) {
                await Models.EmailTemplate.update({ code: code, replacements: replacements }, { where: { id: emailTemplate?.id } });
                let requestedLanguageId = await Models.Language.findOne({ where: { code: request.headers.language } })
                if (requestedLanguageId) {
                    const existingContent = emailTemplate?.EmailTemplateContents?.find((content: any) => content.languageId == requestedLanguageId?.id);
                    if (existingContent) {
                        let updatedContent: any = {};
                        updatedContent['title'] = title;
                        updatedContent['subject'] = subject;
                        updatedContent['message'] = message
                        updatedContent['messageText'] = await Common.convertHtmlToText(message)
                        await Models.EmailTemplateContent.update(updatedContent, { where: { id: existingContent.id }, transaction: transaction });
                    } else {
                        let newContent: any = {};
                        newContent.title = title;
                        newContent.subject = subject;
                        newContent.message = message;
                        newContent.messageText = await Common.convertHtmlToText(message);
                        newContent.languageId = requestedLanguageId.id;
                        await Models.EmailTemplateContent.create(newContent, { transaction: transaction });
                    }
                    await transaction?.commit();
                    let responseObject = await fetch(id, request.headers.language);
                    responseObject = JSON.parse(JSON.stringify(responseObject));
                    return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseObject }).code(200);
                } else {
                    await transaction?.rollback();
                    return Common.generateError(request, 400, 'ERROR_WHILE_FETCHING_REQUIRED_LANGUAGE_FOR_CONTENT_UPDATION', {});
                }
            } else {
                await transaction?.rollback();
                return Common.generateError(request, 400, 'ERROR_WHILE_CREATING_REVISION', {});
            }
        }
    } catch (err) {
        await transaction?.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const deleteTemplate = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let userId = request.auth.credentials.userData.id;
        let { id } = request.params;
        let emailTemplate = await Models.EmailTemplate.findOne({ where: { id: id }, include: [{ model: Models.EmailTemplateContent }] });
        if (emailTemplate) {
            let revisonObject = JSON.parse(JSON.stringify(emailTemplate));
            let revision = await storeRevision(revisonObject, userId, transaction);
            if (revision) {
                emailTemplate.update({ code: emailTemplate.code + '-' + Moment().toISOString() })
                await emailTemplate.destroy({ transaction: transaction });
                await transaction?.commit();
                return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: revisonObject }).code(200);
            } else {
                await transaction?.rollback();
                return Common.generateError(request, 400, 'ERROR_WHILE_CREATING_REVISION', {});
            }
        } else {
            await transaction?.rollback();
            return Common.generateError(request, 400, 'EMAIL_TEMPLATE_DOES_NOT_EXISTS', {});
        }
    } catch (err) {
        await transaction?.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const list = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    try {
        let { perPage, page } = request.query;

        perPage = +process.env.PAGINATION_LIMIT! < perPage ? +process.env.PAGINATION_LIMIT! : perPage
        // perPage = (process.env.PAGINATION_LIMIT ?? 10) < perPage ? (process.env.PAGINATION_LIMIT ?? 10) : perPage
        let offset = (page - 1) * perPage;
        let requestedLanguage = await Models.Language.findOne({ where: { code: request.headers.language } });
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUAGE_CODE } });
        if (requestedLanguage && defaultLanguage) {
            let emailTemplates = await Models.EmailTemplate.findAndCountAll({
                attributes: attributes,
                include: [
                    {
                        attributes: [],
                        model: Models.EmailTemplateContent, as: 'content',
                        include: [
                            { attributes: [], model: Models.Language, where: { code: request.headers.language } }
                        ]
                    },
                    {
                        attributes: [],
                        model: Models.EmailTemplateContent, as: 'defaultContent',
                        include: [
                            { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                        ]
                    },
                    {
                        model: Models.User,
                        as: 'updatedBy',
                        attributes: updatedByAttributes,
                        include: [
                            {
                                model: Models.UserProfile,
                                as: "userProfile",
                                attributes: [],
                                include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }]
                            }
                        ]
                    },
                    {
                        model: Models.User,
                        as: 'author',
                        attributes: authorAttributes,
                        include: [
                            {
                                model: Models.UserProfile,
                                as: "userProfile",
                                attributes: [],
                                include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }]
                            }
                        ]
                    }
                ],
                where: { isRevision: false },
                offset: offset,
                limit: perPage,
                distinct: true,
                subQuery: false
            });
            return h.response({ responseData: { data: emailTemplates.rows, perPage: perPage, totalRecords: emailTemplates.count, page: page, totalPages: emailTemplates.count > 0 ? Math.ceil(emailTemplates.count / perPage) : 0 } }).code(200);
        } else {
            return Common.generateError(request, 400, 'ERROR_WHILE_FETCHING_REQUIRED_LANGUAGE_FOR_CONTENT_UPDATION', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const get = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let { id } = request.params
        let emailTemplate = await fetch(id, request.headers.language);
        if (emailTemplate) {
            return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: JSON.parse(JSON.stringify(emailTemplate)) }).code(200);
        } else {
            return Common.generateError(request, 400, 'EMAIL_TEMPLATE_DOES_NOT_EXISTS', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getByCode = async (code: string, language: string) => {
    try {
        let verifyCode = await Models.EmailTemplate.findOne({ where: { code: code } });
        let verifyCodeId = verifyCode?.id;
        if (verifyCodeId) {
            let emailTemplate = await fetch(verifyCodeId, language);
            if (emailTemplate) {
                return JSON.parse(JSON.stringify(emailTemplate));
            } else {
                return Common.generateError(request, 400, 'EMAIL_TEMPLATE_DOES_NOT_EXISTS', {});
            }
        } else {
            return false;
        }
    } catch (err) {
        return false;
    }
}

export const updateStatus = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { id } = request.params;
        let {userId} = request.auth.credentials.userData.id;
        let { status } = request.payload;
        let emailTemplate = await Models.EmailTemplate.findOne({
            where: { id: id, isRevision: false, revisionId: null },
            include: [
                {
                    model: Models.EmailTemplateContent
                }
            ]
        });
        if (emailTemplate) {
            // Create a revision of the existing entity in DB
            let revisonObject = JSON.parse(JSON.stringify(emailTemplate))
            let revision = await storeRevision(revisonObject,userId, transaction);
            let updateStamp = await Models.EmailTemplate.update({ lastUpdatedById: userId, status: status }, { where: { id: emailTemplate.id }, transaction: transaction });
            await transaction?.commit();
            let responseObject = await fetch(id, request.headers.language);
            responseObject = JSON.parse(JSON.stringify(responseObject));
            return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseObject }).code(200);
        } else {
            await transaction?.rollback();
            return Common.generateError(request, 400, 'EMAIL_TEMPLATE_DOES_NOT_EXISTS', {});
        }

    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const sendMail = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    return true
}

export const sendEmail = async(code: string, replacements: any, emails: any, language: string) => {
    try {
        if(process.env.NODE_ENV === "TEST") {
            return {success: true, message: "REQUEST_SUCCESSFULL", data: null};
        }
        // const data = await Common.sendEmail(emails, process.env.SES_SMTP_EMAIL!, [], [], code, replacements, [], language, 'email', 'signup');
        const data = await Common.sendEmail(emails, 'mohitangaria77@gmail.com', [], [], code, replacements, [], language, 'email', 'signup');
        return {success: true, message: "REQUEST_SUCCESSFULL", data: null};
    } catch (error) {
        return {success: false, message: "ERROR_WHILE_SENDING_EMAIL", data: null};
    }
}