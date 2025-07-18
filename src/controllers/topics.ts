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
import { TopicInterface, TopicContentInterface } from "../config/interfaces/topic";
type AttributeElement = string | [Literal, string] | [Fn, string];
const _ = require("lodash");

const topicAttributes: AttributeElement[] = [
    'id', 'slug', 'status', 'createdAt', 'updatedAt',
    [sequelize.literal('(case when `content`.title is not null then `content`.title else `defaultContent`.title END)'), 'title'],
    [sequelize.literal('convert((case when `content`.description is not null then `content`.description else `defaultContent`.description END) using utf8mb4)'), 'description'],
    [sequelize.literal('(case when `content`.excerpt is not null then `content`.excerpt else `defaultContent`.excerpt END)'), 'excerpt'],
    [sequelize.literal('(select count(id) from communities_topics_replies as replies where replies.topic_id = `Topic`.`id` and replies.deleted_at is null)'), 'totalReplies']
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
    [sequelize.fn('IF', sequelize.literal('`topicImage`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`topicImage`.`unique_name`')), sequelize.literal('`topicImage`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`topicImage`.`data_key` is not null,1,0)'), 'isEncrypted']
]

const attachmentAttributes: AttributeElement[] = [
    "id",
    "extension",
    "size",
    "fileName",
    [sequelize.fn('IF', sequelize.literal('`topicAttachments`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`topicAttachments`.`unique_name`')), sequelize.literal('`topicAttachments`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`topicAttachments`.`data_key` is not null,1,0)'), 'isEncrypted']
]


const includes = (language: string) => {
    return [
        { attributes: createByAttributes, model: Models.User, as: 'createdBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        { attributes: updatedByAttributes, model: Models.User, as: 'updatedBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        {
            attributes: [], model: Models.TopicContent, as: 'content', include: [
                { attributes: [], model: Models.Language, where: { code: language } }
            ]
        },
        {
            attributes: [], model: Models.TopicContent, as: 'defaultContent', include: [
                { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUANGE_CODE } }
            ]
        },
        {
            attributes: imageAttributes,
            model: Models.Attachment, as: 'topicImage',
        },
        {
            attributes: attachmentAttributes,
            model: Models.Attachment, as: 'topicAttachments',
            through: {
                attributes: []
            }
        }
    ]
}
const fetch = async (id: number | string, language: string, usingSlug: boolean) => {
    try {
        let where = usingSlug ? { slug: id } : { id: id }
        where = { ...where, ...{ isRevision: false, revisionId: null } }
        let topic = await Models.Topic.findOne({
            attributes: topicAttributes,
            where: where,
            include: includes(language),
            subQuery:false
        });
        if (topic) {
            topic = JSON.parse(JSON.stringify(topic));
            return topic;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }

}

const storeRevision = async (Object: TopicInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.slug = revisonObject.slug + '-' + Moment().toISOString();
        revisonObject.revisionId = revisionId;
        for (const key in revisonObject.TopicContents) {
            revisonObject.TopicContents[key] = _.omit(revisonObject.TopicContents[key], ['id', 'topicId'])
        }
        let revision = await Models.Topic.create(revisonObject, { include: [{ model: Models.TopicContent }], transaction: transaction });
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
        let { title, description, communityId, topicImage, topicAttachments,excerpt } = request.payload;
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: TopicContentInterface;
        let requestedLanguageObject: TopicContentInterface;
        let existingCase = await Models.Topic.findOne({ where: { slug: slug, communityId: communityId } });
        let TopicContents: TopicContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'TOPIC_ALREADY_EXISTS', {});
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
                TopicContents.push(defaultLanguageObject, requestedLanguageObject)
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
            TopicContents.push(defaultLanguageObject)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        let newTopic = await Models.Topic.create({
            communityId: communityId,
            slug: slug,
            userId: userId,
            topicFeaturedImage: topicImage,
            lastUpdatedBy: userId,
            status: Constants.STATUS.ACTIVE,
            TopicContents: TopicContents
        }, {
            include: [
                { model: Models.TopicContent }
            ],
            transaction: transaction
        }
        );
        if (newTopic && newTopic.id && requestedLanguage && requestedLanguage.id) {
            await newTopic.setAttachments(topicAttachments, { transaction: transaction })
            await transaction.commit();
            let topic = await fetch(newTopic.id, language, false)
            return h.response({ message: request.i18n.__("TOPIC_CREATED_SUCCESSFULLY"), responseData: topic }).code(200)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_CREATE_TOPIC', {});
        }
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getTopic = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let topic = await fetch(request.params.id, request.headers.language, false);
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

export const getTopicBySlug = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
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
        let { title, description, communityId,topicImage, topicAttachments,excerpt  } = request.payload;
        let { id } = request.params
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: TopicContentInterface;
        let requestedLanguageObject: TopicContentInterface;
        let existingCase = await Models.Topic.findOne({ where: { slug: slug, id: { [Op.ne]: id }, communityId: communityId } });
        let TopicContents: TopicContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'TOPIC_ALREADY_EXISTS', {});
        }
        // create revision for existing entity
        let topic = await Models.Topic.findOne({
            where: { id: id, isRevision: false, revisionId: null! },
            include: [
                {
                    model: Models.TopicContent
                }
            ]
        });
        let revisonObject = JSON.parse(JSON.stringify(topic))
        await storeRevision(revisonObject, transaction);

        // update topic for requested changes
        let updateStamp = await Models.Topic.update({ lastUpdatedBy: userId, slug: slug,topicFeaturedImage:topicImage }, { where: { id: id }, transaction: transaction });
        await topic?.setAttachments(topicAttachments, { transaction: transaction })
        const existingContent = topic?.TopicContents!.find((content) => content.languageId == requestedLanguage?.id);
        if (existingContent && existingContent.id) {
            let updatedContent: TopicContentInterface = { title: title, description: description, descriptionText: descriptionText,excerpt:excerpt, languageId: existingContent.languageId };
            await Models.TopicContent.update(updatedContent, { where: { id: existingContent.id }, transaction: transaction });
        } else if (requestedLanguage?.id) {
            let updatedContent: TopicContentInterface = { title: title, description: description, descriptionText: descriptionText,excerpt:excerpt, languageId: requestedLanguage.id };
            await Models.TopicContent.create(updatedContent, { transaction: transaction });
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        await transaction.commit();

        // fetch back updated topic from relations
        let updatedTopic = await fetch(id, language, false)
        if (updatedTopic) {
            return h.response({ message: request.i18n.__("TOPIC_UPDATED_SUCCESSFULLY"), responseData: updatedTopic }).code(200)
        } else {
            return Common.generateError(request, 400, 'UNABLE_TO_FETCH_TOPIC', {});
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
        let topic = await fetch(request.params.id, request.headers.language, false);
        if (topic) {
            let revisonObject = topic;
            await storeRevision(revisonObject, transaction);
            let { status } = request.payload;
            await Models.Topic.update({ status: status }, { where: { id: request.params.id }, transaction: transaction })
            await transaction.commit();
            topic.status = status;
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: topic }).code(200);
        }
        else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'TOPIC_NOT_FOUND', {});
        }
    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const destroy = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let topic = await fetch(request.params.id, request.headers.language, false);
        if (topic) {
            await Models.Topic.destroy({ where: { id: request.params.id }, transaction: transaction })
            await Models.TopicContent.destroy({ where: { topicId: request.params.id }, transaction: transaction })
            await transaction.commit();
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: topic }).code(200);
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

export const listTopics = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { page, status,communityId } = request.query;
        let perPage = +process.env.PAGINATION_LIMIT!;
        let offset = (page - 1) * perPage;
        let where = { isRevision: false, revisionId: null,communityId:communityId }
        if (status != null && status >= 0) {
            where = { ...where, ...{ status: status } }
        }
        let topics = await Models.Topic.findAndCountAll({
            attributes: topicAttributes,
            where: where,
            include: includes(language),
            offset: offset,
            order:[['id','desc']],
            limit: perPage,
            distinct: true,
            col: 'id',
            subQuery: false
        });
        const count = topics.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        topics = JSON.parse(JSON.stringify(topics.rows));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: topics, perPage: perPage, totalPages: totalPages, totalRecords: count } }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }

}

export const listAllTopics = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { status,communityId } = request.query;
        let where = { isRevision: false, revisionId: null,communityId:communityId }
        if (status != null && status >= 0) {
            where = { ...where, ...{ status: status } }
        }
        let topics = await Models.Topic.findAll({
            attributes: topicAttributes,
            where: where,
            order:[['id','desc']],
            include: includes(language)
        });
        topics = JSON.parse(JSON.stringify(topics));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: topics }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}