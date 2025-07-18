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
import { ReplyInterface } from "../config/interfaces/reply";
type AttributeElement = string | [Literal, string] | [Fn, string];
const _ = require("lodash");

const replyAttributes: AttributeElement[] = [
    'id', 'reply', 'status','createdAt','updatedAt',
    [sequelize.literal('(select count(id) from communities_topics_replies as replies where replies.deleted_at is null and replies.in_response_to = `Reply`.`id`)'), 'totalReplies']
];

const createByAttributes: AttributeElement[] = [
    'id', 'email', 'countryCode', 'mobile', 'status',
    [sequelize.literal('`createdBy->userProfile`.`name`'), 'name'],
    [sequelize.literal('`createdBy->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
]

const attachmentAttributes: AttributeElement[] = [
    "id",
    "extension",
    "size",
    "fileName",
    [sequelize.fn('IF', sequelize.literal('`replyAttachments`.`type`=1'), sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`replyAttachments`.`unique_name`')), sequelize.literal('`replyAttachments`.`unique_name`')), 'filePath'],
    [sequelize.literal('IF(`replyAttachments`.`data_key` is not null,1,0)'), 'isEncrypted']
]

const includes = () => {
    return [
        { attributes: createByAttributes, model: Models.User, as: 'createdBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        {
            attributes: attachmentAttributes,
            model: Models.Attachment, as: 'replyAttachments',
            through: {
                attributes: []
            }
        }
    ]
}

const fetch = async (id: number) => {
    try {
        let reply = await Models.Reply.findOne({
            attributes: replyAttributes,
            where: { id: id },
            include: includes()
        });
        if (reply) {
            reply = JSON.parse(JSON.stringify(reply));
            return reply;
        } else {
            return false;
        }
    } catch (err) {
        console.log(err);
        return false;
    }

}

const storeRevision = async (Object: ReplyInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.revisionId = revisionId;
        for (const key in revisonObject.TopicContents) {
            revisonObject.TopicContents[key] = _.omit(revisonObject.TopicContents[key], ['id'])
        }
        let revision = await Models.Reply.create(revisonObject, { transaction: transaction });
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
        let { reply, topicId, inResponseTo, replyAttachments } = request.payload;
        let userId = request.auth.credentials.userData.id;
        let newReply = await Models.Reply.create({
            topicId: topicId,
            inResponseTo: inResponseTo,
            userId: userId,
            reply: reply,
            status: Constants.STATUS.ACTIVE
        }, {
            transaction: transaction
        }
        );
        if (newReply && newReply.id) {
            await newReply.setAttachments(replyAttachments, { transaction: transaction })
            await transaction.commit();
            let replyResponse = await fetch(newReply.id)
            return h.response({ message: request.i18n.__("REPLY_CREATED_SUCCESSFULLY"), responseData: replyResponse }).code(200)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'UNABLE_TO_CREATE_REPLY_OR_POST', {});
        }
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getReply = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let reply = await fetch(request.params.id);
        if (reply) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: reply }).code(200);
        }
        else {
            return Common.generateError(request, 400, 'POST_OR_REPLY_NOT_FOUND', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { reply, topicId, inResponseTo, replyAttachments } = request.payload;
        let { id } = request.params
        let userId = request.auth.credentials.userData.id;
        // create revision for existing entity
        let existingReply = await Models.Reply.findOne({
            where: { id: id, topicId: topicId, inResponseTo: inResponseTo, isRevision: false, revisionId: null! },
        });
        if (existingReply) {
            let revisonObject = JSON.parse(JSON.stringify(existingReply))
            await storeRevision(revisonObject, transaction);
            // update topic for requested changes
            await Models.Reply.update({ reply: reply, userId: userId }, { where: { id: id }, transaction: transaction });
            await existingReply.setAttachments(replyAttachments, { transaction: transaction })
            await transaction.commit();

            // fetch back updated topic from relations
            let updatedTopic = await fetch(id)
            if (updatedTopic) {
                return h.response({ message: request.i18n.__("POST_OR_REPLY_UPDATED_SUCCESSFULLY"), responseData: updatedTopic }).code(200)
            } else {
                return Common.generateError(request, 400, 'UNABLE_TO_FETCH_REPLY', {});
            }
        } else {
            return Common.generateError(request, 400, 'UNABLE_TO_FETCH_REPLY', {});
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
        let reply = await fetch(request.params.id);
        if (reply) {
            let revisonObject = reply;
            await storeRevision(revisonObject, transaction);
            let { status } = request.payload;
            await Models.Reply.update({ status: status }, { where: { id: request.params.id }, transaction: transaction })
            await transaction.commit();
            reply.status = status;
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: reply }).code(200);
        }
        else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'REPLY_NOT_FOUND', {});
        }
    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const destroy = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let reply = await fetch(request.params.id);
        if (reply) {
            await Models.Reply.destroy({ where: { id: request.params.id }, transaction: transaction })
            await transaction.commit();
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: reply }).code(200);
        }
        else {
            await await transaction.rollback();
            return Common.generateError(request, 400, 'REPLY_NOT_FOUND', {});
        }
    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const listReplies = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { page,status,topicId,replyId} = request.query;
        let perPage = +process.env.PAGINATION_LIMIT!;
        let offset = (page - 1) * perPage;
        let where = { isRevision: false, revisionId: null,topicId:topicId }
        if (replyId) {
            where = { ...where, ...{ inResponseTo: replyId } }
        }else{
            where = { ...where, ...{ inResponseTo:{[Op.eq]:null} } }
        }
        if (status != null && status >= 0) {
            where = { ...where, ...{ status: status } }
        }
        let replies = await Models.Reply.findAndCountAll({
            attributes: replyAttributes,
            where: where,
            include: includes(),
            order:[['id','desc']],
            offset: offset,
            limit: perPage,
            distinct: true,
            col: 'id',
            subQuery: false
        });
        const count = replies.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        replies = JSON.parse(JSON.stringify(replies.rows));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: { data: replies, perPage: perPage, totalPages: totalPages, totalRecords: count } }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }

}

export const listAllReplies = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let language = request.headers.language;
        let { status,topicId,replyId } = request.query;
        let where = { isRevision: false, revisionId: null,topicId:topicId }
        if (status != null && status >= 0) {
            where = { ...where, ...{ status: status } }
        }
        if (replyId) {
            where = { ...where, ...{ inResponseTo: replyId } }
        }
        let replies = await Models.Reply.findAll({
            attributes: replyAttributes,
            where: where,
            order:[['id','desc']],
            include: includes()
        });
        replies = JSON.parse(JSON.stringify(replies));
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: replies }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}