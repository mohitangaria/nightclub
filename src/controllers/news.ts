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
import { NewsInterface, NewsContentInterface } from "../config/interfaces/news";
type AttributeElement = string | [Literal, string] | [Fn, string];
const _ = require("lodash");

const newsAttributes: AttributeElement[] = [
    'id', 'slug', 'status', 'createdAt', 'updatedAt',
    [sequelize.literal('(case when `content`.title is not null then `content`.title else `defaultContent`.title END)'), 'title'],
    [sequelize.literal('convert((case when `content`.description is not null then `content`.description else `defaultContent`.description END) using utf8mb4)'), 'description'],
    [sequelize.literal('(case when `content`.excerpt is not null then `content`.excerpt else `defaultContent`.excerpt END)'), 'excerpt'],
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
    [sequelize.fn('IF', sequelize.literal('`newsImage`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`newsImage`.`unique_name`')), sequelize.literal('`newsImage`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`newsImage`.`data_key` is not null,1,0)'), 'isEncrypted']
]

const attachmentAttributes: AttributeElement[] = [
    "id",
    "extension",
    "size",
    "fileName",
    [sequelize.fn('IF', sequelize.literal('`newsAttachments`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`newsAttachments`.`unique_name`')), sequelize.literal('`newsAttachments`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`newsAttachments`.`data_key` is not null,1,0)'), 'isEncrypted']
]

const includes = (language: string) => {
    return [
        { attributes: createByAttributes, model: Models.User, as: 'createdBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        { attributes: updatedByAttributes, model: Models.User, as: 'updatedBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        {
            attributes: [], model: Models.NewsContent, as: 'content', include: [
                { attributes: [], model: Models.Language, where: { code: language } }
            ]
        },
        {
            attributes: [], model: Models.NewsContent, as: 'defaultContent', include: [
                { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUANGE_CODE } }
            ]
        },
        {
            attributes: imageAttributes,
            model: Models.Attachment, as: 'newsImage',
        },
        {
            attributes: attachmentAttributes,
            model: Models.Attachment, as: 'newsAttachments',
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
        let news = await Models.News.findOne({
            attributes: newsAttributes,
            where: where,
            include: includes(language),
            subQuery: false
        });
        if (news) {
            news = JSON.parse(JSON.stringify(news));
            console.log(news)
            return news;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }

}

const storeRevision = async (Object: NewsInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.slug = revisonObject.slug + '-' + Moment().toISOString();
        revisonObject.revisionId = revisionId;
        for (const key in revisonObject.NewsContents) {
            revisonObject.NewsContents[key] = _.omit(revisonObject.NewsContents[key], ['id', 'newsId'])
        }
        let revision = await Models.News.create(revisonObject, { include: [{ model: Models.NewsContent }], transaction: transaction });
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
        let { title, description, communityId, newsImage, newsAttachments, status,excerpt } = request.payload;
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: NewsContentInterface;
        let requestedLanguageObject: NewsContentInterface;
        let existingCase = await Models.News.findOne({ where: { slug: slug, communityId: communityId } });
        let NewsContents: NewsContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'NEWS_ALREADY_EXISTS', {});
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
                NewsContents.push(defaultLanguageObject, requestedLanguageObject)
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
            NewsContents.push(defaultLanguageObject)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        let newNews = await Models.News.create({
            communityId: communityId,
            slug: slug,
            userId: userId,
            newsFeaturedImage: newsImage,
            lastUpdatedBy: userId,
            status: status,
            NewsContents: NewsContents
        }, {
            include: [
                { model: Models.NewsContent }
            ],
            transaction: transaction
        }
        );
        if (newNews && newNews.id && requestedLanguage && requestedLanguage.id) {
            await newNews.setAttachments(newsAttachments, { transaction: transaction })
            await transaction.commit();
            let news = await fetch(newNews.id, language,false)
            return h.response({ message: request.i18n.__("NEWS_CREATED_SUCCESSFULLY"), responseData: news }).code(200)
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

export const getNews = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let news = await fetch(request.params.id, request.headers.language, false);
        if (news) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: news }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'NEWS_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getNewsBySlug = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let news = await fetch(request.params.slug, request.headers.language, true);
        if (news) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: news }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'NEWS_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { title, description, communityId, status,excerpt } = request.payload;
        let { id } = request.params
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: NewsContentInterface;
        let requestedLanguageObject: NewsContentInterface;
        let existingCase = await Models.News.findOne({ where: { slug: slug, id: { [Op.ne]: id }, communityId: communityId } });
        let NewsContents: NewsContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'COMMUNITY_ALREADY_EXISTS', {});
        }
        // create revision for existing entity
        let news = await Models.News.findOne({
            where: { id: id, isRevision: false, revisionId: null! },
            include: [
                {
                    model: Models.NewsContent
                }
            ]
        });
        let revisonObject = JSON.parse(JSON.stringify(news))
        await storeRevision(revisonObject, transaction);

        // update news for requested changes
        let updateStamp = await Models.News.update({ lastUpdatedBy: userId, slug: slug, status: status }, { where: { id: id }, transaction: transaction });
        const existingContent = news?.NewsContents!.find((content) => content.languageId == requestedLanguage?.id);
        if (existingContent && existingContent.id) {
            let updatedContent: NewsContentInterface = { title: title, description: description, descriptionText: descriptionText,excerpt:excerpt, languageId: existingContent.languageId };
            await Models.NewsContent.update(updatedContent, { where: { id: existingContent.id }, transaction: transaction });
        } else if (requestedLanguage?.id) {
            let updatedContent: NewsContentInterface = { title: title, description: description, descriptionText: descriptionText,excerpt:excerpt, languageId: requestedLanguage.id };
            await Models.NewsContent.create(updatedContent, { transaction: transaction });
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        await transaction.commit();

        // fetch back updated news from relations
        let updatedNews = await fetch(id, language, false)
        if (updatedNews) {
            return h.response({ message: request.i18n.__("NEWS_UPDATED_SUCCESSFULLY"), responseData: updatedNews }).code(200)
        } else {
            return Common.generateError(request, 400, 'UNABLE_TO_FETCH_PAGE', {});
        }
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const updateStatus = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let news = await fetch(request.params.id, request.headers.language, false);
        if (news) {
            let revisonObject = news;
            await storeRevision(revisonObject, transaction);
            let { status } = request.payload;
            await Models.Reply.update({ status: status }, { where: { id: request.params.id }, transaction: transaction })
            await transaction.commit();
            news.status = status;
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: news }).code(200);
        }
        else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'NEWS_NOT_FOUND', {});
        }
    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const destroy = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let news = await fetch(request.params.id, request.headers.language, false);
        if (news) {
            await Models.News.destroy({ where: { id: request.params.id }, transaction: transaction })
            await Models.NewsContent.destroy({ where: { newsId: request.params.id }, transaction: transaction })
            await transaction.commit();
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: news }).code(200);
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

export const listNews = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { page,communityId } = request.query;
        let perPage = +process.env.PAGINATION_LIMIT!;
        let offset = (page - 1) * perPage;
        let news = await Models.News.findAndCountAll({
            attributes: newsAttributes,
            where: { status: Constants.STATUS.ACTIVE, isRevision: false, revisionId: null,communityId:communityId },
            include: includes(language),
            offset: offset,
            limit: perPage,
            order:[['id','desc']],
            distinct: true,
            col: 'id',
            subQuery: false
        });
        const count = news.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        news = JSON.parse(JSON.stringify(news.rows));
        console.log(news)
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: news, perPage: perPage, totalPages: totalPages, totalRecords: count } }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }

}

export const listAllNews = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let {communityId}=request.query
        let language = request.headers.language;
        let news = await Models.News.findAll({
            attributes: newsAttributes,
            order:[['id','desc']],
            where: { status: Constants.STATUS.ACTIVE, isRevision: false, revisionId: null,communityId:communityId },
            include: includes(language)
        });
        news = JSON.parse(JSON.stringify(news));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: news }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}