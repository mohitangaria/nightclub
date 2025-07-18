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
import * as Diary from "./diaries";
type AttributeElement = string | [Literal, string] | [Fn, string];
const _ = require("lodash");

const diaryEntryAttributes: AttributeElement[] = ['id', 'status', 'createdAt', 'updatedAt','entry'];

const createByAttributes: AttributeElement[] = ['id', 'email', 'countryCode', 'mobile', 'status',
    [sequelize.literal('`createdBy->userProfile`.`name`'), 'name'],
    [sequelize.literal('`createdBy->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
]

const updatedByAttributes: AttributeElement[] = [
    'id', 'email', 'countryCode', 'mobile', 'status',
    [sequelize.literal('`updatedBy->userProfile`.`name`'), 'name'],
    [sequelize.literal('`updatedBy->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
]

const imageAttributes: AttributeElement[] = [
    "id",
    "extension",
    "size",
    "fileName",
    [sequelize.fn('IF', sequelize.literal('`diaryEntryImage`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`diaryEntryImage`.`unique_name`')), sequelize.literal('`diaryEntryImage`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`diaryEntryImage`.`data_key` is not null,1,0)'), 'isEncrypted']
]

const attachmentAttributes: AttributeElement[] = [
    "id",
    "extension",
    "size",
    "fileName",
    [sequelize.fn('IF', sequelize.literal('`diaryEntryAttachments`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`diaryEntryAttachments`.`unique_name`')), sequelize.literal('`diaryEntryAttachments`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`diaryEntryAttachments`.`data_key` is not null,1,0)'), 'isEncrypted']
]


const includes = (language: string) => {
    return [
        { attributes: createByAttributes, model: Models.User, as: 'createdBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        { attributes: updatedByAttributes, model: Models.User, as: 'updatedBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        {
            attributes: imageAttributes,
            model: Models.Attachment, as: 'diaryEntryImage',
        },
        {
            attributes: attachmentAttributes,
            model: Models.Attachment, as: 'diaryEntryAttachments',
            through: {
                attributes: []
            }
        }
    ]
}
const fetch = async (id: number | string) => {
    try {
        console.log(id);
        let where = { id: id }
        let diaryEntry = await Models.DiaryEntry.findOne({
            attributes: diaryEntryAttributes,
            where: where,
        });
        if (diaryEntry) {
            diaryEntry = JSON.parse(JSON.stringify(diaryEntry));
            return diaryEntry;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }

}

export const create = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { diaryId,entry, diaryEntryImage, diaryEntryAttachments } = request.payload;
        let userId = request.auth.credentials.userData.id;
        let newDiaryEntry = await Models.DiaryEntry.create({
            diaryId: diaryId,
            userId: userId,
            entry: entry,
            entryFeaturedImage: diaryEntryImage,
            lastUpdatedBy: userId,
            status: Constants.STATUS.ACTIVE
        }, {
            transaction: transaction
        }
        );
        if (newDiaryEntry && newDiaryEntry.id) {
            if(diaryEntryAttachments && diaryEntryAttachments.length > 0){
                await newDiaryEntry.setAttachments(diaryEntryAttachments, { transaction: transaction })
            }
            await transaction.commit();
            let diary = await fetch(newDiaryEntry.id)
            return h.response({ message: request.i18n.__("DIARY_ENTRY_CREATED_SUCCESSFULLY"), responseData: diary }).code(200)
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
        let diary = await fetch(request.params.id);
        if (diary) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: diary }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'DIARY_ENTRY_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { diaryId,entry, diaryEntryImage, diaryEntryAttachments   } = request.payload;
        let { id } = request.params
        let userId = request.auth.credentials.userData.id;
        let existingCase = await Models.DiaryEntry.findOne({ where: {id: { [Op.ne]: id }, diaryId: diaryId } });
        let DiaryContents: DiaryContentInterface[] = [];
        let diary = await Models.Diary.findOne({
            where: { id: id, isRevision: false, revisionId: null! },
            include: [
                {
                    model: Models.DiaryContent
                }
            ]
        });
        let revisonObject = JSON.parse(JSON.stringify(diary))

        // update diary for requested changes
        let updateStamp = await Models.DiaryEntry.update({ lastUpdatedBy: userId, entry: entry,entryFeaturedImage:diaryEntryImage }, { where: { id: id }, transaction: transaction });
        await diary?.setAttachments(diaryEntryAttachments, { transaction: transaction })
        
        await transaction.commit();

        // fetch back updated diary from relations
        let updatedDiary = await fetch(id)
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
        let diary = await fetch(request.params.id);
        if (diary) {
            let { status } = request.payload;
            await Models.DiaryEntry.update({ status: status }, { where: { id: request.params.id }, transaction: transaction })
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
        let diary = await fetch(request.params.id);
        if (diary) {
            await Models.DiaryEntry.destroy({ where: { id: request.params.id }, transaction: transaction })
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

export const listDiaryEntries = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
       
        let language = request.headers.language;
        let { page, status, diaryId } = request.query;
        let perPage = +process.env.PAGINATION_LIMIT!;
        console.log(diaryId);
        let diary = await Diary.getDiaryDetails(diaryId,language)
        let offset = (page - 1) * perPage;
        let where = {diaryId:diaryId}
        if (status != null && status >= 0) {
            where = { ...where, ...{ status: status } }
        }
        let diaryEntries = await Models.DiaryEntry.findAndCountAll({
            attributes: diaryEntryAttributes,
            where: where,
            include: includes(language),
            offset: offset,
            order:[['id','desc']],
            limit: perPage,
            distinct: true,
            col: 'id',
            subQuery: false
        });
        const count = diaryEntries.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        diaryEntries = JSON.parse(JSON.stringify(diaryEntries.rows));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: diaryEntries,diary:diary, perPage: perPage, totalPages: totalPages, totalRecords: count } }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }

}