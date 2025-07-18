import { Models, sequelize } from "../models";
import { Sequelize, Op } from "../config/dbImporter";
import * as Common from "./common";
import Moment from "moment";
import * as Email from "./emails";
import * as Constants from "../constants";
import { request } from "http";
import * as Hapi from "@hapi/hapi";
import { hapi } from "hapi-i18n"
import { Literal, Fn, Col } from "sequelize/types/utils";
import { WhereOptions } from 'sequelize';
import { integer } from "aws-sdk/clients/cloudfront";
import { SurveyInterface, SurveyContentInterface } from "../config/interfaces/survey";
type AttributeElement = string | [Literal, string] | [Fn, string];
const _ = require("lodash");

const surveyAttributes: AttributeElement[] = [
    'id', 'slug', 'status','surveyUrl',
    [sequelize.literal('(case when `content`.title is not null then `content`.title else `defaultContent`.title END)'), 'title'],
    [sequelize.literal('convert((case when `content`.description is not null then `content`.description else `defaultContent`.description END) using utf8mb4)'), 'description'],
    [sequelize.literal('(case when `content`.excerpt is not null then `content`.excerpt else `defaultContent`.excerpt END)'), 'excerpt']
];

const createByAttributes: AttributeElement[] = [
    'id', 'email', 'countryCode', 'mobile', 'status',
    [sequelize.literal('`createdBy->userProfile`.`name`'), 'name'],
    [sequelize.literal('`createdBy->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
]

const updatedByAttributes: AttributeElement[] = [
    'id', 'email', 'countryCode', 'mobile', 'status',
    [sequelize.literal('`createdBy->userProfile`.`name`'), 'name'],
    [sequelize.literal('`createdBy->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
]

const imageAttributes: AttributeElement[]=[
    "id",
    "extension",
    "size", 
    "fileName",
    [sequelize.fn('IF',sequelize.literal('`surveyImage`.`type`=1'),sequelize.fn('CONCAT',process.env.PROTOCOL,'://',process.env.HOST_SERVER,"/attachment/",sequelize.literal('`surveyImage`.`unique_name`')),sequelize.literal('`surveyImage`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`surveyImage`.`data_key` is not null,1,0)'),'isEncrypted']
]




const includes = (language: string) => {
    return [
        { attributes: createByAttributes, model: Models.User, as: 'createdBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        { attributes: updatedByAttributes, model: Models.User, as: 'updatedBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        {
            attributes: [], model: Models.SurveyContent, as: 'content', include: [
                { attributes: [], model: Models.Language, where: { code: language } }
            ]
        },
        {
            attributes: [], model: Models.SurveyContent, as: 'defaultContent', include: [
                { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUANGE_CODE } }
            ]
        },
        {
            attributes:imageAttributes,
            model:Models.Attachment,as:'surveyImage',
        }
    ]
}
const fetch = async (id: number, language: string) => {
    try {
        let survey = await Models.Survey.findOne({
            attributes: surveyAttributes,
            where: { id: id },
            include: includes(language)
        });
        if (survey) {
            survey = JSON.parse(JSON.stringify(survey));
            return survey;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }

}

const storeRevision = async (Object: SurveyInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.slug = revisonObject.slug + '-' + Moment().toISOString();
        revisonObject.revisionId = revisionId;
        for (const key in revisonObject.SurveyContents) {
            revisonObject.SurveyContents[key] = _.omit(revisonObject.SurveyContents[key], ['id', 'surveyId'])
        }
        let revision = await Models.Survey.create(revisonObject, { include: [{ model: Models.SurveyContent }], transaction: transaction });
        if (revision)
            return revision;
        else
            return false;
    } catch (err) {
        return false;
    }
}

export const create = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { title, description, communityId,surveyImage,surveyUrl,surveyType,excerpt } = request.payload;
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: SurveyContentInterface;
        let requestedLanguageObject: SurveyContentInterface;
        let existingCase = await Models.Survey.findOne({ where: { slug: slug, communityId: communityId } });
        let SurveyContents: SurveyContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'SURVEY_ALREADY_EXISTS', {});
        }
        if (language != process.env.DEFAULT_LANGUANGE_CODE) {
            if (requestedLanguage && defaultLanguage) {
                defaultLanguageObject = {
                    title: title,
                    excerpt:excerpt,
                    description: description,
                    descriptionText: descriptionText,
                    languageId: defaultLanguage.id
                };
                requestedLanguageObject = {
                    title: title,
                    excerpt:excerpt,
                    description: description,
                    descriptionText: descriptionText,
                    languageId: requestedLanguage.id
                }
                SurveyContents.push(defaultLanguageObject, requestedLanguageObject)
            } else {
                await transaction.rollback();
                return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
            }
        } else if (defaultLanguage) {
            defaultLanguageObject = {
                title: title,
                excerpt:excerpt,
                description: description,
                descriptionText: descriptionText,
                languageId: defaultLanguage.id
            };
            SurveyContents.push(defaultLanguageObject)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        let newSurvey = await Models.Survey.create({
            communityId: communityId,
            surveyType:surveyType,
            surveyUrl:surveyUrl,
            slug: slug,
            userId: userId,
            surveyFeaturedImage:surveyImage,
            lastUpdatedBy: userId,
            status: Constants.STATUS.ACTIVE,
            SurveyContents: SurveyContents
        }, {
            include: [
                { model: Models.SurveyContent }
            ],
            transaction: transaction
        }
        );
        if (newSurvey && newSurvey.id && requestedLanguage && requestedLanguage.id) {
            await transaction.commit();
            let survey = await fetch(newSurvey.id, language)
            return h.response({ message: request.i18n.__("SURVEY_CREATED_SUCCESSFULLY"), responseData: survey }).code(200)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_CREATE_SURVEY', {});
        }
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getSurvey = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let survey = await fetch(request.params.id, request.headers.language);
        if (survey) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: survey }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'SURVEY_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { title, description, communityId,surveyType,surveyUrl,excerpt } = request.payload;
        let { id } = request.params
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: SurveyContentInterface;
        let requestedLanguageObject: SurveyContentInterface;
        let existingCase = await Models.Survey.findOne({ where: { slug: slug, id: { [Op.ne]: id }, communityId: communityId } });
        let SurveyContents: SurveyContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'COMMUNITY_ALREADY_EXISTS', {});
        }
        // create revision for existing entity
        let survey = await Models.Survey.findOne({
            where: { id: id, isRevision: false, revisionId: null! },
            include: [
                {
                    model: Models.SurveyContent
                }
            ]
        });
        let revisonObject = JSON.parse(JSON.stringify(survey))
        await storeRevision(revisonObject, transaction);

        // update survey for requested changes
        let updateStamp = await Models.Survey.update({ lastUpdatedBy: userId, slug: slug,surveyType:surveyType,surveyUrl:surveyUrl }, { where: { id: id }, transaction: transaction });
        const existingContent = survey?.SurveyContents!.find((content) => content.languageId == requestedLanguage?.id);
        if (existingContent && existingContent.id) {
            let updatedContent: SurveyContentInterface = { title: title, description: description, descriptionText: descriptionText,excerpt:excerpt,languageId: existingContent.languageId };
            await Models.SurveyContent.update(updatedContent, { where: { id: existingContent.id }, transaction: transaction });
        } else if (requestedLanguage?.id) {
            let updatedContent: SurveyContentInterface = { title: title, description: description, descriptionText: descriptionText,excerpt:excerpt, languageId: requestedLanguage.id };
            await Models.SurveyContent.create(updatedContent, { transaction: transaction });
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        await transaction.commit();

        // fetch back updated survey from relations
        let updatedSurvey = await fetch(id, language)
        if (updatedSurvey) {
            return h.response({ message: request.i18n.__("SURVEY_UPDATED_SUCCESSFULLY"), responseData: updatedSurvey }).code(200)
        } else {
            return Common.generateError(request, 400, 'UNABLE_TO_FETCH_SURVEY', {});
        }
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const destroy = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let survey = await fetch(request.params.id, request.headers.language);
        if (survey) {
            await Models.Survey.destroy({ where: { id: request.params.id }, transaction: transaction })
            await Models.SurveyContent.destroy({ where: { surveyId: request.params.id }, transaction: transaction })
            await transaction.commit();
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: survey }).code(200);
        }
        else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'SURVEY_NOT_FOUND', {});
        }
    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const listSurveys = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { page,surveyType,communityId } = request.query;
        let perPage = +process.env.PAGINATION_LIMIT!;
        let offset = (page - 1) * perPage;
        let surveys = await Models.Survey.findAndCountAll({
            attributes: surveyAttributes,
            where: { status: Constants.STATUS.ACTIVE, isRevision: false, revisionId: null,surveyType:surveyType },
            include: includes(language),
            offset: offset,
            limit: perPage,
            distinct:true,
            col:'id',
            subQuery:false
        });
        const count = surveys.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        surveys = JSON.parse(JSON.stringify(surveys.rows));
        console.log({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: surveys, perPage: perPage, totalPages: totalPages, totalRecords: count } })
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: surveys, perPage: perPage, totalPages: totalPages, totalRecords: count } }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }

}

export const listAllSurveys = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let { page,surveyType,communityId } = request.query;
        let language = request.headers.language;
        let surveys = await Models.Survey.findAll({
            attributes: surveyAttributes,
            where: { status: Constants.STATUS.ACTIVE, isRevision: false, revisionId: null,surveyType:surveyType,communityId:communityId },
            include: includes(language)
        });
        surveys = JSON.parse(JSON.stringify(surveys));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: surveys }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}