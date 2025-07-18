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
import { PollInterface, PollContentInterface } from "../config/interfaces/poll";
type AttributeElement = string | [Literal, string] | [Fn, string];
const _ = require("lodash");

const pollAttributes: AttributeElement[] = [
    'id', 'slug', 'status','pollUrl',
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

const imageAttributes: AttributeElement[]=[
    "id",
    "extension",
    "size", 
    "fileName",
    [sequelize.fn('IF',sequelize.literal('`pollImage`.`type`=1'),sequelize.fn('CONCAT',process.env.PROTOCOL,'://',process.env.HOST_SERVER,"/attachment/",sequelize.literal('`pollImage`.`unique_name`')),sequelize.literal('`pollImage`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`pollImage`.`data_key` is not null,1,0)'),'isEncrypted']
]




const includes = (language: string) => {
    return [
        { attributes: createByAttributes, model: Models.User, as: 'createdBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        { attributes: updatedByAttributes, model: Models.User, as: 'updatedBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        {
            attributes: [], model: Models.PollContent, as: 'content', include: [
                { attributes: [], model: Models.Language, where: { code: language } }
            ]
        },
        {
            attributes: [], model: Models.PollContent, as: 'defaultContent', include: [
                { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUANGE_CODE } }
            ]
        },
        {
            attributes:imageAttributes,
            model:Models.Attachment,as:'pollImage',
        }
    ]
}
const fetch = async (id: number, language: string) => {
    try {
        let poll = await Models.Poll.findOne({
            attributes: pollAttributes,
            where: { id: id },
            include: includes(language)
        });
        if (poll) {
            poll = JSON.parse(JSON.stringify(poll));
            return poll;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }

}

const storeRevision = async (Object: PollInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.slug = revisonObject.slug + '-' + Moment().toISOString();
        revisonObject.revisionId = revisionId;
        for (const key in revisonObject.PollContents) {
            revisonObject.PollContents[key] = _.omit(revisonObject.PollContents[key], ['id', 'pollId'])
        }
        let revision = await Models.Poll.create(revisonObject, { include: [{ model: Models.PollContent }], transaction: transaction });
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
        let { title, description, communityId,pollImage,pollUrl } = request.payload;
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: PollContentInterface;
        let requestedLanguageObject: PollContentInterface;
        let existingCase = await Models.Poll.findOne({ where: { slug: slug, communityId: communityId } });
        let PollContents: PollContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'POLL_ALREADY_EXISTS', {});
        }
        if (language != process.env.DEFAULT_LANGUANGE_CODE) {
            if (requestedLanguage && defaultLanguage) {
                defaultLanguageObject = {
                    title: title,
                    description: description,
                    descriptionText: descriptionText,
                    languageId: defaultLanguage.id
                };
                requestedLanguageObject = {
                    title: title,
                    description: description,
                    descriptionText: descriptionText,
                    languageId: requestedLanguage.id
                }
                PollContents.push(defaultLanguageObject, requestedLanguageObject)
            } else {
                await transaction.rollback();
                return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
            }
        } else if (defaultLanguage) {
            defaultLanguageObject = {
                title: title,
                description: description,
                descriptionText: descriptionText,
                languageId: defaultLanguage.id
            };
            PollContents.push(defaultLanguageObject)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        let newPoll = await Models.Poll.create({
            communityId: communityId,
            pollUrl:pollUrl,
            slug: slug,
            userId: userId,
            pollFeaturedImage:pollImage,
            lastUpdatedBy: userId,
            status: Constants.STATUS.ACTIVE,
            PollContents: PollContents
        }, {
            include: [
                { model: Models.PollContent }
            ],
            transaction: transaction
        }
        );
        if (newPoll && newPoll.id && requestedLanguage && requestedLanguage.id) {
            await transaction.commit();
            let poll = await fetch(newPoll.id, language)
            return h.response({ message: request.i18n.__("POLL_CREATED_SUCCESSFULLY"), responseData: poll }).code(200)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_CREATE_POLL', {});
        }
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getPoll = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let poll = await fetch(request.params.id, request.headers.language);
        console.log(poll);
        if (poll) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: poll }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'POLL_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { title, description, communityId,pollImage,pollUrl  } = request.payload;
        let { id } = request.params
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: PollContentInterface;
        let requestedLanguageObject: PollContentInterface;
        let existingCase = await Models.Poll.findOne({ where: { slug: slug, id: { [Op.ne]: id }, communityId: communityId } });
        let PollContents: PollContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'COMMUNITY_ALREADY_EXISTS', {});
        }
        // create revision for existing entity
        let poll = await Models.Poll.findOne({
            where: { id: id, isRevision: false, revisionId: null! },
            include: [
                {
                    model: Models.PollContent
                }
            ]
        });
        let revisonObject = JSON.parse(JSON.stringify(poll))
        await storeRevision(revisonObject, transaction);

        // update poll for requested changes
        let updateStamp = await Models.Poll.update({ lastUpdatedBy: userId, slug: slug,pollFeaturedImage:pollImage,pollUrl:pollUrl }, { where: { id: id }, transaction: transaction });
        const existingContent = poll?.PollContents!.find((content) => content.languageId == requestedLanguage?.id);
        if (existingContent && existingContent.id) {
            let updatedContent: PollContentInterface = { title: title, description: description, descriptionText: descriptionText, languageId: existingContent.languageId };
            await Models.PollContent.update(updatedContent, { where: { id: existingContent.id }, transaction: transaction });
        } else if (requestedLanguage?.id) {
            let updatedContent: PollContentInterface = { title: title, description: description, descriptionText: descriptionText, languageId: requestedLanguage.id };
            await Models.PollContent.create(updatedContent, { transaction: transaction });
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        await transaction.commit();

        // fetch back updated poll from relations
        let updatedPoll = await fetch(id, language)
        if (updatedPoll) {
            return h.response({ message: request.i18n.__("POLL_UPDATED_SUCCESSFULLY"), responseData: updatedPoll }).code(200)
        } else {
            return Common.generateError(request, 400, 'UNABLE_TO_FETCH_POLL', {});
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
        let poll = await fetch(request.params.id, request.headers.language);
        if (poll) {
            await Models.Poll.destroy({ where: { id: request.params.id }, transaction: transaction })
            await Models.PollContent.destroy({ where: { pollId: request.params.id }, transaction: transaction })
            await transaction.commit();
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: poll }).code(200);
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

export const listPolls = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { page,communityId } = request.query;
        let perPage = +process.env.PAGINATION_LIMIT!;
        let offset = (page - 1) * perPage;
        let polls = await Models.Poll.findAndCountAll({
            attributes: pollAttributes,
            where: { status: Constants.STATUS.ACTIVE, isRevision: false, revisionId: null,communityId:communityId },
            include: includes(language),
            offset: offset,
            limit: perPage,
            distinct:true,
            col:'id',
            subQuery:false
        });
        const count = polls.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        polls = JSON.parse(JSON.stringify(polls.rows));
        console.log({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: polls, perPage: perPage, totalPages: totalPages, totalRecords: count } })
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: polls, perPage: perPage, totalPages: totalPages, totalRecords: count } }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }

}

export const listAllPolls = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let {communityId}=request.query;
        let polls = await Models.Poll.findAll({
            attributes: pollAttributes,
            where: { status: Constants.STATUS.ACTIVE, isRevision: false, revisionId: null,communityId:communityId },
            include: includes(language)
        });
        polls = JSON.parse(JSON.stringify(polls));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: polls }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}