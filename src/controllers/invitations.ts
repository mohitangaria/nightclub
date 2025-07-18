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
import { InvitationInterface, InvitedMemberInterface } from "../config/interfaces/invitations";
type AttributeElement = string | [Literal, string] | [Fn, string];
const _ = require("lodash");

const invitationAttributes: AttributeElement[] = [
    'id', 'subject', 'description'
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

const includes = () => {
    return [
        { attributes: createByAttributes, model: Models.User, as: 'createdBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
        { attributes: updatedByAttributes, model: Models.User, as: 'updatedBy', include: [{ attributes: [], model: Models.UserProfile, as: 'userProfile', include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }] }] },
    ]
}

const fetch = async (id: number) => {
    try {
        let where =  { id: id }
        let invitation = await Models.Invitation.findOne({
            attributes: invitationAttributes,
            where: where,
            include: includes(),
            subQuery: false
        });
        if (invitation) {
            invitation = JSON.parse(JSON.stringify(invitation));
            return invitation;
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
        let {subject,description,communityId } = request.payload;
        let descriptionText = await Common.convertHtmlToText(description);
        let userId = request.auth.credentials.userData.id;
        let InvitedMembers: InvitedMemberInterface[] = [];
        // let newNews = await Models.News.create({
        //     communityId: communityId,
        //     userId: userId,
        //     last: newsImage,
        //     lastUpdatedBy: userId,
        //     status: status,
        //     NewsContents: NewsContents
        // }, {
        //     include: [
        //         { model: Models.NewsContent }
        //     ],
        //     transaction: transaction
        // }
        // );
        // if (newNews && newNews.id && requestedLanguage && requestedLanguage.id) {
        //     await newNews.setAttachments(newsAttachments, { transaction: transaction })
        //     await transaction.commit();
        //     let news = await fetch(newNews.id, language,false)
        //     return h.response({ message: request.i18n.__("NEWS_CREATED_SUCCESSFULLY"), responseData: news }).code(200)
        // } else {
        //     await transaction.rollback();
        //     return Common.generateError(request, 400, 'UNABLE_TO_CREATE_PAGE', {});
        // }
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const getNews = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let news = await fetch(request.params.id);
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
