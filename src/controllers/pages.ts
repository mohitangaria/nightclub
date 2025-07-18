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
import { PageInterface, PageContentInterface } from "../config/interfaces/page";
type AttributeElement = string | [Literal, string] | [Fn, string];
const _ = require("lodash");

const pageAttributes: AttributeElement[] = [
    'id', 'slug', 'status','createdAt','updatedAt',
    [sequelize.literal('(case when `content`.title is not null then `content`.title else `defaultContent`.title END)'), 'title'],
    [sequelize.literal('convert((case when `content`.description is not null then `content`.description else `defaultContent`.description END) using utf8mb4)'), 'description'],
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

const imageAttributes: AttributeElement[] = [
    "id",
    "extension",
    "size",
    "fileName",
    [sequelize.fn('IF', sequelize.literal('`pageImage`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`pageImage`.`unique_name`')), sequelize.literal('`pageImage`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`pageImage`.`data_key` is not null,1,0)'), 'isEncrypted']
]

const attachmentAttributes: AttributeElement[] = [
    "id",
    "extension",
    "size",
    "fileName",
    [sequelize.fn('IF', sequelize.literal('`pageAttachments`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`pageAttachments`.`unique_name`')), sequelize.literal('`pageAttachments`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`pageAttachments`.`data_key` is not null,1,0)'), 'isEncrypted']
]

const includes = (language: string) => {
    return [
        { attributes: createByAttributes, model: Models.User, as: 'createdBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        { attributes: updatedByAttributes, model: Models.User, as: 'updatedBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        {
            attributes: [], model: Models.PageContent, as: 'content', include: [
                { attributes: [], model: Models.Language, where: { code: language } }
            ]
        },
        {
            attributes: [], model: Models.PageContent, as: 'defaultContent', include: [
                { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUANGE_CODE } }
            ]
        },
        {
            attributes: imageAttributes,
            model: Models.Attachment, as: 'pageImage',
        },
        {
            attributes: attachmentAttributes,
            model: Models.Attachment, as: 'pageAttachments',
            through: {
                attributes: []
            }
        }
    ]
}

const fetch = async (id: number, language: string, usingSlug: boolean) => {
    try {
        let where = usingSlug ? { slug: id } : { id: id }
        where = { ...where, ...{ isRevision: false, revisionId: null } }
        let page = await Models.Page.findOne({
            attributes: pageAttributes,
            where: where,
            include: includes(language)
        });
        if (page) {
            page = JSON.parse(JSON.stringify(page));
            return page;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }

}

const storeRevision = async (Object: PageInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.slug = revisonObject.slug + '-' + Moment().toISOString();
        revisonObject.revisionId = revisionId;
        for (const key in revisonObject.PageContents) {
            revisonObject.PageContents[key] = _.omit(revisonObject.PageContents[key], ['id', 'pageId'])
        }
        let revision = await Models.Page.create(revisonObject, { include: [{ model: Models.PageContent }], transaction: transaction });
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
        let { title, description, communityId, pageImage, pageAttachments,excerpt } = request.payload;
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: PageContentInterface;
        let requestedLanguageObject: PageContentInterface;
        let existingCase = await Models.Page.findOne({ where: { slug: slug, communityId: communityId } });
        let PageContents: PageContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'PAGE_ALREADY_EXISTS', {});
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
                PageContents.push(defaultLanguageObject, requestedLanguageObject)
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
            PageContents.push(defaultLanguageObject)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        let newPage = await Models.Page.create({
            communityId: communityId,
            slug: slug,
            userId: userId,
            pageFeaturedImage: pageImage,
            lastUpdatedBy: userId,
            status: Constants.STATUS.ACTIVE,
            PageContents: PageContents
        }, {
            include: [
                { model: Models.PageContent }
            ],
            transaction: transaction
        }
        );
        if (newPage && newPage.id && requestedLanguage && requestedLanguage.id) {
            await newPage.setAttachments(pageAttachments, { transaction: transaction })
            await transaction.commit();
            let page = await fetch(newPage.id, language, false)
            return h.response({ message: request.i18n.__("PAGE_CREATED_SUCCESSFULLY"), responseData: page }).code(200)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_CREATE_PAGE', {});
        }
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getPage = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let page = await fetch(request.params.id, request.headers.language, false);
        if (page) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: page }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'PAGE_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getPageBySlug = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let topic = await fetch(request.params.slug, request.headers.language, true);
        if (topic) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: topic }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'TOPIC_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { title, description, communityId,excerpt } = request.payload;
        let { id } = request.params
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: PageContentInterface;
        let requestedLanguageObject: PageContentInterface;
        let existingCase = await Models.Page.findOne({ where: { slug: slug, id: { [Op.ne]: id }, communityId: communityId } });
        let PageContents: PageContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'COMMUNITY_ALREADY_EXISTS', {});
        }
        // create revision for existing entity
        let page = await Models.Page.findOne({
            where: { id: id, isRevision: false, revisionId: null! },
            include: [
                {
                    model: Models.PageContent
                }
            ]
        });
        let revisonObject = JSON.parse(JSON.stringify(page))
        await storeRevision(revisonObject, transaction);

        // update page for requested changes
        let updateStamp = await Models.Page.update({ lastUpdatedBy: userId, slug: slug }, { where: { id: id }, transaction: transaction });
        const existingContent = page?.PageContents!.find((content) => content.languageId == requestedLanguage?.id);
        if (existingContent && existingContent.id) {
            let updatedContent: PageContentInterface = { title: title, description: description, descriptionText: descriptionText,excerpt:excerpt, languageId: existingContent.languageId };
            await Models.PageContent.update(updatedContent, { where: { id: existingContent.id }, transaction: transaction });
        } else if (requestedLanguage?.id) {
            let updatedContent: PageContentInterface = { title: title, description: description, descriptionText: descriptionText,excerpt:excerpt, languageId: requestedLanguage.id };
            await Models.PageContent.create(updatedContent, { transaction: transaction });
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        await transaction.commit();

        // fetch back updated page from relations
        let updatedPage = await fetch(id, language, false)
        if (updatedPage) {
            return h.response({ message: request.i18n.__("PAGE_UPDATED_SUCCESSFULLY"), responseData: updatedPage }).code(200)
        } else {
            return Common.generateError(request, 400, 'UNABLE_TO_FETCH_PAGE', {});
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
        let page = await fetch(request.params.id, request.headers.language, false);
        if (page) {
            await Models.Page.destroy({ where: { id: request.params.id }, transaction: transaction })
            await Models.PageContent.destroy({ where: { pageId: request.params.id }, transaction: transaction })
            await transaction.commit();
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: page }).code(200);
        }
        else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'COMMUNITY_NOT_FOUND', {});
        }
    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const listPages = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { page } = request.query;
        let perPage = +process.env.PAGINATION_LIMIT!;
        let offset = (page - 1) * perPage;
        console.log({
            attributes: pageAttributes,
            where: { status: Constants.STATUS.ACTIVE, isRevision: false, revisionId: null },
            include: includes(language),
            offset: offset,
            limit: perPage,
        })
        let pages = await Models.Page.findAndCountAll({
            attributes: pageAttributes,
            where: { status: Constants.STATUS.ACTIVE, isRevision: false, revisionId: null },
            include: includes(language),
            offset: offset,
            limit: perPage,
            distinct: true,
            col: 'id',
            subQuery: false
        });
        const count = pages.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        pages = JSON.parse(JSON.stringify(pages.rows));
        console.log({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: pages, perPage: perPage, totalPages: totalPages, totalRecords: count } })
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: pages, perPage: perPage, totalPages: totalPages, totalRecords: count } }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }

}

export const listAllPages = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let pages = await Models.Page.findAll({
            attributes: pageAttributes,
            where: { status: Constants.STATUS.ACTIVE, isRevision: false, revisionId: null },
            include: includes(language)
        });
        pages = JSON.parse(JSON.stringify(pages));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: pages }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}