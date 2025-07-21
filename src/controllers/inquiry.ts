import { Models, sequelize } from "../models";
import * as Common from './common';
import * as Constants from '../constants';
import Moment from "moment";
import _ from "lodash";
import { Sequelize, Op } from "../config/dbImporter";
import requestIp from 'request-ip';
import * as Hapi from "@hapi/hapi";
import { Literal, Fn } from "sequelize/types/utils";
import { Transaction, WhereOptions } from "sequelize";
import { LostAndFoundInterface} from "../config/interfaces/lostAndFound";

type AttributeElement = string | [Literal, string] | [Fn, string];

export const fetch = async (id: number) => {
    const record = await Models.Inquiry.findOne({ where: { id } });
    return record;
}
export const createInquiry = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
      const userId = request.auth.credentials.userData.id;
      const {
        name,
        date,
        // bookingId,
        // eventId,
        // slot,
        partySize,
        message,
        contactCountryCode,
        contactNumber
      } = request.payload;
  
      const inquiry = await Models.Inquiry.create({
        name,
        date,
        // bookingId,
        // eventId,
        // slot,
        partySize,
        message,
        inquiredBy: userId,
        contactCountryCode,
        contactNumber
      }, { transaction });
  
      await transaction.commit();
      return h.response({
        message: request.i18n.__("RECORD_CREATED_SUCCESSFULLY"),
        responseData: inquiry
      }).code(200);
    } catch (err) {
      await transaction.rollback();
      return Common.generateError(request, 500, 'FAILED_TO_CREATE_RECORD', err);
    }
  };

  
export const updateInquiry = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
      const userId = request.auth.credentials.userData.id;
      const hasAdminRole = await Common.checkRole(userId, 'admin');
      const { id } = request.params;
  
      const existing = await Models.Inquiry.findOne({ where: { id } });
      if (!existing) {
        await transaction.rollback();
        return Common.generateError(request, 404, 'RECORD_NOT_FOUND', {});
      }
  
      if (!hasAdminRole && existing.inquiredBy !== userId) {
        await transaction.rollback();
        return Common.generateError(request, 403, 'UNAUTHORIZED_TO_UPDATE', {});
      }
  
      const {
        name,
        date,
        // bookingId,
        // eventId,
        // slot,
        partySize,
        message,
        contactCountryCode,
        contactNumber
      } = request.payload;
  
      await Models.Inquiry.update({
        name,
        date,
        // bookingId,
        // eventId,
        // slot,
        partySize,
        message,
        contactCountryCode,
        contactNumber
      }, { where: { id }, transaction });
  
      await transaction.commit();
      const updated = await fetch(id);
      return h.response({
        message: request.i18n.__("RECORD_UPDATED_SUCCESSFULLY"),
        responseData: updated
      }).code(200);
    } catch (err) {
      await transaction.rollback();
      return Common.generateError(request, 500, 'FAILED_TO_UPDATE_RECORD', err);
    }
  };

  export const updateInquiryStatus = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
      const userId = request.auth.credentials.userData.id;
      const hasAdminRole = await Common.checkRole(userId, 'admin');
      const { id } = request.params;
      const { status } = request.payload;
  
      const existing = await Models.Inquiry.findOne({ where: { id } });
      if (!existing) {
        await transaction.rollback();
        return Common.generateError(request, 404, 'RECORD_NOT_FOUND', {});
      }
  
      if (!hasAdminRole && existing.inquiredBy !== userId) {
        await transaction.rollback();
        return Common.generateError(request, 403, 'UNAUTHORIZED_TO_UPDATE_STATUS', {});
      }
  
      await Models.Inquiry.update({ status }, { where: { id }, transaction });
      await transaction.commit();
  
      const updated = await Models.Inquiry.findByPk(id);
      return h.response({
        message: request.i18n.__("STATUS_UPDATED_SUCCESSFULLY"),
        responseData: updated
      }).code(200);
    } catch (err) {
      await transaction.rollback();
      return Common.generateError(request, 500, 'FAILED_TO_UPDATE_STATUS', err);
    }
  };

  
  export const deleteInquiry = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
      const userId = request.auth.credentials.userData.id;
      const hasAdminRole = await Common.checkRole(userId, 'admin');
      const { id } = request.params;
  
      const inquiry = await Models.Inquiry.findOne({ where: { id } });
      if (!inquiry) {
        await transaction.rollback();
        return Common.generateError(request, 404, 'RECORD_NOT_FOUND', {});
      }
  
      if (!hasAdminRole && inquiry.inquiredBy !== userId) {
        await transaction.rollback();
        return Common.generateError(request, 403, 'UNAUTHORIZED_TO_DELETE', {});
      }
  
      await Models.Inquiry.destroy({ where: { id }, transaction });
      await transaction.commit();
  
      return h.response({
        message: request.i18n.__("RECORD_DELETED_SUCCESSFULLY")
      }).code(200);
    } catch (err) {
      await transaction.rollback();
      return Common.generateError(request, 500, 'FAILED_TO_DELETE_RECORD', err);
    }
  };

  
  export const getInquiryById = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
      const { id } = request.params;
      const inquiry = await Models.Inquiry.findOne({ where: { id } });
  
      if (!inquiry) {
        return Common.generateError(request, 404, 'RECORD_NOT_FOUND', {});
      }
  
      return h.response({
        message: request.i18n.__("RECORD_FETCHED_SUCCESSFULLY"),
        responseData: inquiry
      }).code(200);
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_RECORD', err);
    }
  };

  
  export const listAllInquiriesForUser = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
      const userId = request.auth.credentials.userData.id;
      const inquiries = await Models.Inquiry.findAll({
        where: { inquiredBy: userId },
        order: [['createdAt', 'DESC']]
      });
  
      return h.response({
        message: request.i18n.__("RECORDS_FETCHED_SUCCESSFULLY"),
        responseData: inquiries
      }).code(200);
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_RECORDS', err);
    }
  };

  
  export const getAllInquiriesForAdmin = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
      let {perPage,page} = request.query;
      perPage = +process.env.PAGINATION_LIMIT!<perPage?+process.env.PAGINATION_LIMIT!:perPage
      let offset = (page - 1) * perPage;
      const userId = request.auth.credentials.userData.id;
      const hasAdminRole = await Common.checkRole(userId, 'admin');
  
      if (!hasAdminRole) {
        return Common.generateError(request, 403, 'UNAUTHORIZED', {});
      }
  
      const inquiries = await Models.Inquiry.findAndCountAll({
        order:[['id','desc']],
        offset:offset,
        limit: perPage,
        distinct:true,
      });
  
      const count = inquiries.count;
        let totalPages = await Common.getTotalPages(count,perPage);
        let rows = JSON.parse(JSON.stringify(inquiries.rows));
        return h.response({
            message:request.i18n.__("POST_LIST_REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData:{
                data:rows,
                perPage:perPage,
                page:page,
                totalPages:totalPages,
                totalRecords: count
            }
        }).code(200)
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_RECORDS', err);
    }
  };
  

  export const getAllInquiriesForUser = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
    let {perPage,page} = request.query;
    perPage = +process.env.PAGINATION_LIMIT!<perPage?+process.env.PAGINATION_LIMIT!:perPage
    let offset = (page - 1) * perPage;
      const userId = request.auth.credentials.userData.id;
      const inquiries = await Models.Inquiry.findAndCountAll({
        where: { inquiredBy: userId },
        order:[['id','desc']],
        offset:offset,
        limit: perPage,
        distinct:true,
      });
      const count = inquiries.count;
        let totalPages = await Common.getTotalPages(count,perPage);
        let rows = JSON.parse(JSON.stringify(inquiries.rows));
        return h.response({
            message:request.i18n.__("POST_LIST_REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData:{
                data:rows,
                perPage:perPage,
                page:page,
                totalPages:totalPages,
                totalRecords: count
            }
        }).code(200)
  
      
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_RECORDS', err);
    }
  };

  
  export const listAllInquiriesForAdmin = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
      const userId = request.auth.credentials.userData.id;
      const hasAdminRole = await Common.checkRole(userId, 'admin');
  
      if (!hasAdminRole) {
        return Common.generateError(request, 403, 'UNAUTHORIZED', {});
      }
  
      const inquiries = await Models.Inquiry.findAll({
        order: [['createdAt', 'DESC']]
      });
  
      return h.response({
        message: request.i18n.__("RECORDS_FETCHED_SUCCESSFULLY"),
        responseData: inquiries
      }).code(200);
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_RECORDS', err);
    }
  };
  