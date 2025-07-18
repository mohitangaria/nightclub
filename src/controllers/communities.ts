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
import { CommunityInterface, CommunityContentInterface } from "../config/interfaces/community";
type AttributeElement = string | [Literal, string] | [Fn, string];
const _ = require("lodash");


const communityAttributes: AttributeElement[] = [
    'id', 'slug', 'status', 'createdAt', 'updatedAt',
    [sequelize.literal('(case when `content`.name is not null then `content`.name else `defaultContent`.name END)'), 'name'],
    [sequelize.literal('convert((case when `content`.description is not null then `content`.description else `defaultContent`.description END) using utf8mb4)'), 'description']
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

const logoAttributes: AttributeElement[] = [
    "id",
    "extension",
    "size",
    "fileName",
    [sequelize.fn('IF', sequelize.literal('`logo`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`logo`.`unique_name`')), sequelize.literal('`logo`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`logo`.`data_key` is not null,1,0)'), 'isEncrypted']
]

const attachmentAttributes: AttributeElement[] = [
    "id",
    "extension",
    "size",
    "fileName",
    [sequelize.fn('IF', sequelize.literal('`communityAttachments`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`communityAttachments`.`unique_name`')), sequelize.literal('`communityAttachments`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`communityAttachments`.`data_key` is not null,1,0)'), 'isEncrypted']
]

const includes = (language: string) => {
    return [
        { attributes: createByAttributes, model: Models.User, as: 'createdBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        { attributes: updatedByAttributes, model: Models.User, as: 'updatedBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        {
            attributes: [], model: Models.CommunityContent, as: 'content', include: [
                { attributes: [], model: Models.Language, where: { code: language } }
            ]
        },
        {
            attributes: [], model: Models.CommunityContent, as: 'defaultContent', include: [
                { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUANGE_CODE } }
            ]
        },
        {
            attributes: logoAttributes,
            model: Models.Attachment, as: 'logo',
        },
        {
            attributes: attachmentAttributes,
            model: Models.Attachment, as: 'communityAttachments',
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
        let community = await Models.Community.findOne({
            attributes: communityAttributes,
            where: where,
            include: includes(language),
            subQuery:false
        });
        if (community) {
            community = JSON.parse(JSON.stringify(community));
            return community;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }

}

const storeRevision = async (Object: CommunityInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.code = revisonObject.code + '-' + Moment().toISOString();
        revisonObject.revisionId = revisionId;
        for (const key in revisonObject.CommunityContents) {
            revisonObject.CommunityContents[key] = _.omit(revisonObject.CommunityContents[key], ['id', 'communityId'])
        }
        let revision = await Models.Community.create(revisonObject, { include: [{ model: Models.CommunityContent }], transaction: transaction });
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
        let { name, description, logo, communityAttachments, status } = request.payload;
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(name);
        let defaultLanguageObject: CommunityContentInterface;
        let requestedLanguageObject: CommunityContentInterface;
        let existingCase = await Models.Community.findOne({ where: { slug: slug } });
        let communityContents: CommunityContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'COMMUNITY_ALREADY_EXISTS', {});
        }
        if (language != process.env.DEFAULT_LANGUANGE_CODE) {
            if (requestedLanguage && defaultLanguage) {
                defaultLanguageObject = {
                    name: name,
                    description: description,
                    descriptionText: descriptionText,
                    languageId: defaultLanguage.id
                };
                requestedLanguageObject = {
                    name: name,
                    description: description,
                    descriptionText: descriptionText,
                    languageId: requestedLanguage.id
                }
                communityContents.push(defaultLanguageObject, requestedLanguageObject)
            } else {
                await transaction.rollback();
                return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
            }
        } else if (defaultLanguage) {
            defaultLanguageObject = {
                name: name,
                description: description,
                descriptionText: descriptionText,
                languageId: defaultLanguage.id
            };
            communityContents.push(defaultLanguageObject)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        let newCommunity = await Models.Community.create({
            slug: slug,
            status: status,
            userId: userId,
            communityLogo: logo,
            lastUpdatedBy: userId,
            CommunityContents: communityContents
        }, {
            include: [
                { model: Models.CommunityContent },
                { model: Models.Attachment, as: 'logo' },
            ],
            transaction: transaction
        }
        );
        if (newCommunity && newCommunity.id && requestedLanguage && requestedLanguage.id) {
            await newCommunity.setAttachments(communityAttachments, { transaction: transaction })
            let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
            if(defaultLanguage){
                let newCommunityPage = await Models.Page.create({
                    communityId: newCommunity.id,
                    slug: 'welcome',
                    userId: userId,
                    lastUpdatedBy: userId,
                    status: Constants.STATUS.ACTIVE,
                    PageContents: [
                        {
                            title: "welcome Page",
                            excerpt:"welcome Page content",
                            description: "Welcome page description",
                            descriptionText: "Welcome page description",
                            languageId: defaultLanguage.id
                        }
                    ]
                })
            }
            await transaction.commit();
            let community = await fetch(newCommunity.id, language, false)
            console.log(community);
            return h.response({ message: request.i18n.__("COMMUNITY_CREATED_SUCCESSFULLY"), responseData: community }).code(200)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_CREATE_COMMUNITY', {});
        }
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getCommunity = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let community = await fetch(request.params.id, request.headers.language, false);
        if (community) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: community }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'COMMUNITY_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getCommunityBySlug = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let community = await fetch(request.params.slug, request.headers.language, true);
        if (community) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: community }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'COMMUNITY_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { name, description, logo, communityAttachments, status } = request.payload;
        let { id } = request.params
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(name);
        let defaultLanguageObject: CommunityContentInterface;
        let requestedLanguageObject: CommunityContentInterface;
        let existingCase = await Models.Community.findOne({ where: { slug: slug, id: { [Op.ne]: id } } });
        let CommunityContents: CommunityContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'COMMUNITY_ALREADY_EXISTS', {});
        }
        // create revision for existing entity
        let community = await Models.Community.findOne({
            where: { id: id, isRevision: false, revisionId: null! },
            include: [
                {
                    model: Models.CommunityContent
                }
            ]
        });
        if (community) {
            let revisonObject = JSON.parse(JSON.stringify(community))
            await storeRevision(revisonObject, transaction);
            // update community for requested changes
            let updateStamp = await Models.Community.update({ lastUpdatedBy: userId, slug: slug, communityLogo: logo, status: status }, { where: { id: id }, transaction: transaction });
            const existingContent = community?.CommunityContents!.find((content) => content.languageId == requestedLanguage?.id);
            if (existingContent && existingContent.id) {
                let updatedContent: CommunityContentInterface = { name: name, description: description, descriptionText: descriptionText, languageId: existingContent.languageId };
                await Models.CommunityContent.update(updatedContent, { where: { id: existingContent.id }, transaction: transaction });
            } else if (requestedLanguage?.id) {
                let updatedContent: CommunityContentInterface = { name: name, description: description, descriptionText: descriptionText, languageId: requestedLanguage.id };
                await Models.CommunityContent.create(updatedContent, { transaction: transaction });
            } else {
                await transaction.rollback();
                return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
            }
            await community.setAttachments(communityAttachments, { transaction: transaction })
            await transaction.commit();

            // fetch back updated community from relations
            let updatedCommunity = await fetch(id, language, false)
            if (updatedCommunity) {
                return h.response({ message: request.i18n.__("COMMUNITY_CREATED_SUCCESSFULLY"), responseData: updatedCommunity }).code(200)
            } else {
                return Common.generateError(request, 400, 'ERROR_WHILE_FETCHING_COMMUNITY', {});
            }
        } else {
            return Common.generateError(request, 400, 'UNABLE_TO_FETCH_COMMUNITY', {});
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
        let community = await fetch(request.params.id, request.headers.language, false);
        if (community) {
            let revisonObject = community;
            await storeRevision(revisonObject, transaction);
            let { status } = request.payload;
            await Models.Community.update({ status: status }, { where: { id: request.params.id }, transaction: transaction })
            await transaction.commit();
            community.status = status;
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: community }).code(200);
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

export const destroy = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let community = await fetch(request.params.id, request.headers.language, false);
        if (community) {
            await Models.Community.destroy({ where: { id: request.params.id }, transaction: transaction })
            await Models.CommunityContent.destroy({ where: { communityId: request.params.id }, transaction: transaction })
            await transaction.commit();
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: community }).code(200);
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

export const listCommunities = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { page, status } = request.query;
        let perPage = +process.env.PAGINATION_LIMIT!;
        let offset = (page - 1) * perPage;
        let where = { isRevision: false, revisionId: null }
        if (status != null && status >= 0) {
            where = { ...where, ...{ status: status } }
        }
        let communities = await Models.Community.findAndCountAll({
            attributes: communityAttributes,
            where: where,
            include: includes(language),
            offset: offset,
            limit: perPage,
            distinct: true,
            col: 'id',
            subQuery: false
        });
        const count = communities.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        communities = JSON.parse(JSON.stringify(communities.rows));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: communities, perPage: perPage, totalPages: totalPages, totalRecords: count } }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }

}

export const listAllCommunities = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { status } = request.query;
        let where = { isRevision: false, revisionId: null }
        if (status != null && status >= 0) {
            where = { ...where, ...{ status: status } }
        }
        let communities = await Models.Community.findAll({
            attributes: communityAttributes,
            where: where,
            include: includes(language)
        });
        communities = JSON.parse(JSON.stringify(communities));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: communities }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}