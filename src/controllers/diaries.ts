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
import { DiaryInterface, DiaryContentInterface } from "../config/interfaces/diary";
type AttributeElement = string | [Literal, string] | [Fn, string];
const _ = require("lodash");

const diaryAttributes: AttributeElement[] = [
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
    [sequelize.fn('IF', sequelize.literal('`diaryImage`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`diaryImage`.`unique_name`')), sequelize.literal('`diaryImage`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`diaryImage`.`data_key` is not null,1,0)'), 'isEncrypted']
]

const attachmentAttributes: AttributeElement[] = [
    "id",
    "extension",
    "size",
    "fileName",
    [sequelize.fn('IF', sequelize.literal('`diaryAttachments`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`diaryAttachments`.`unique_name`')), sequelize.literal('`diaryAttachments`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`diaryAttachments`.`data_key` is not null,1,0)'), 'isEncrypted']
]


const includes = (language: string) => {
    return [
        { attributes: createByAttributes, model: Models.User, as: 'createdBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        { attributes: updatedByAttributes, model: Models.User, as: 'updatedBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        {
            attributes: [], model: Models.DiaryContent, as: 'content', include: [
                { attributes: [], model: Models.Language, where: { code: language } }
            ]
        },
        {
            attributes: [], model: Models.DiaryContent, as: 'defaultContent', include: [
                { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUANGE_CODE } }
            ]
        },
        {
            attributes: imageAttributes,
            model: Models.Attachment, as: 'diaryImage',
        },
        {
            attributes: attachmentAttributes,
            model: Models.Attachment, as: 'diaryAttachments',
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
        let diary = await Models.Diary.findOne({
            attributes: diaryAttributes,
            where: where,
            include: includes(language),
            subQuery:false
        });
        if (diary) {
            diary = JSON.parse(JSON.stringify(diary));
            return diary;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }

}

export const getDiaryDetails=async(id:number,language:string)=>{
    try{
        let diary = await fetch(id,language,false);
        if(diary)
            return diary;
        else
            return false;
    }catch(err){
        console.log(err);
        return false;
    }
}

const storeRevision = async (Object: DiaryInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.slug = revisonObject.slug + '-' + Moment().toISOString();
        revisonObject.revisionId = revisionId;
        for (const key in revisonObject.DiaryContents) {
            revisonObject.DiaryContents[key] = _.omit(revisonObject.DiaryContents[key], ['id', 'diaryId'])
        }
        let revision = await Models.Diary.create(revisonObject, { include: [{ model: Models.DiaryContent }], transaction: transaction });
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
        let { title, description, communityId, diaryImage, diaryAttachments,excerpt } = request.payload;
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: DiaryContentInterface;
        let requestedLanguageObject: DiaryContentInterface;
        let existingCase = await Models.Diary.findOne({ where: { slug: slug, communityId: communityId } });
        let DiaryContents: DiaryContentInterface[] = [];
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
                DiaryContents.push(defaultLanguageObject, requestedLanguageObject)
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
            DiaryContents.push(defaultLanguageObject)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        let newDiary = await Models.Diary.create({
            communityId: communityId,
            slug: slug,
            userId: userId,
            diaryFeaturedImage: diaryImage,
            lastUpdatedBy: userId,
            status: Constants.STATUS.ACTIVE,
            DiaryContents: DiaryContents
        }, {
            include: [
                { model: Models.DiaryContent }
            ],
            transaction: transaction
        }
        );
        if (newDiary && newDiary.id && requestedLanguage && requestedLanguage.id) {
            await newDiary.setAttachments(diaryAttachments, { transaction: transaction })
            await transaction.commit();
            let diary = await fetch(newDiary.id, language, false)
            return h.response({ message: request.i18n.__("TOPIC_CREATED_SUCCESSFULLY"), responseData: diary }).code(200)
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

export const getDiary = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let diary = await fetch(request.params.id, request.headers.language, false);
        if (diary) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: diary }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'TOPIC_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getDiaryBySlug = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let diary = await fetch(request.params.slug, request.headers.language, true);
        if (diary) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: diary }).code(200);
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
        let { title, description, communityId,diaryImage, diaryAttachments,excerpt  } = request.payload;
        let { id } = request.params
        let descriptionText = await Common.convertHtmlToText(description);
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUANGE_CODE } });
        let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
        let language = request.headers.language;
        let userId = request.auth.credentials.userData.id;
        let slug = Common.slugify(title);
        let defaultLanguageObject: DiaryContentInterface;
        let requestedLanguageObject: DiaryContentInterface;
        let existingCase = await Models.Diary.findOne({ where: { slug: slug, id: { [Op.ne]: id }, communityId: communityId } });
        let DiaryContents: DiaryContentInterface[] = [];
        if (existingCase) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'TOPIC_ALREADY_EXISTS', {});
        }
        // create revision for existing entity
        let diary = await Models.Diary.findOne({
            where: { id: id, isRevision: false, revisionId: null! },
            include: [
                {
                    model: Models.DiaryContent
                }
            ]
        });
        let revisonObject = JSON.parse(JSON.stringify(diary))
        await storeRevision(revisonObject, transaction);

        // update diary for requested changes
        let updateStamp = await Models.Diary.update({ lastUpdatedBy: userId, slug: slug,diaryFeaturedImage:diaryImage }, { where: { id: id }, transaction: transaction });
        await diary?.setAttachments(diaryAttachments, { transaction: transaction })
        const existingContent = diary?.DiaryContents!.find((content) => content.languageId == requestedLanguage?.id);
        if (existingContent && existingContent.id) {
            let updatedContent: DiaryContentInterface = { title: title, description: description, descriptionText: descriptionText,excerpt:excerpt, languageId: existingContent.languageId };
            await Models.DiaryContent.update(updatedContent, { where: { id: existingContent.id }, transaction: transaction });
        } else if (requestedLanguage?.id) {
            let updatedContent: DiaryContentInterface = { title: title, description: description, descriptionText: descriptionText,excerpt:excerpt, languageId: requestedLanguage.id };
            await Models.DiaryContent.create(updatedContent, { transaction: transaction });
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_VERIFY_LANGUAGES', {});
        }
        await transaction.commit();

        // fetch back updated diary from relations
        let updatedDiary = await fetch(id, language, false)
        if (updatedDiary) {
            return h.response({ message: request.i18n.__("TOPIC_UPDATED_SUCCESSFULLY"), responseData: updatedDiary }).code(200)
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
        let diary = await fetch(request.params.id, request.headers.language, false);
        if (diary) {
            let revisonObject = diary;
            await storeRevision(revisonObject, transaction);
            let { status } = request.payload;
            await Models.Diary.update({ status: status }, { where: { id: request.params.id }, transaction: transaction })
            await transaction.commit();
            diary.status = status;
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: diary }).code(200);
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
        let diary = await fetch(request.params.id, request.headers.language, false);
        if (diary) {
            await Models.Diary.destroy({ where: { id: request.params.id }, transaction: transaction })
            await Models.DiaryContent.destroy({ where: { diaryId: request.params.id }, transaction: transaction })
            await transaction.commit();
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: diary }).code(200);
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

export const listDiaries = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { page, status,communityId } = request.query;
        let perPage = +process.env.PAGINATION_LIMIT!;
        let offset = (page - 1) * perPage;
        let where = { isRevision: false, revisionId: null,communityId:communityId }
        if (status != null && status >= 0) {
            where = { ...where, ...{ status: status } }
        }
        let diaries = await Models.Diary.findAndCountAll({
            attributes: diaryAttributes,
            where: where,
            include: includes(language),
            offset: offset,
            order:[['id','desc']],
            limit: perPage,
            distinct: true,
            col: 'id',
            subQuery: false
        });
        const count = diaries.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        diaries = JSON.parse(JSON.stringify(diaries.rows));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: diaries, perPage: perPage, totalPages: totalPages, totalRecords: count } }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }

}

export const listAllDiaries = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { status,communityId } = request.query;
        let where = { isRevision: false, revisionId: null,communityId:communityId }
        if (status != null && status >= 0) {
            where = { ...where, ...{ status: status } }
        }
        let diaries = await Models.Diary.findAll({
            attributes: diaryAttributes,
            where: where,
            order:[['id','desc']],
            include: includes(language)
        });
        diaries = JSON.parse(JSON.stringify(diaries));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: diaries }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}