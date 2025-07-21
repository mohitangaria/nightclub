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
    const record = await Models.LostAndFound.findOne({ where: { id } });
    return record;
}
export const createRequest = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
      const userId = request.auth.credentials.userData.id;
      const hasAdminRole = await Common.checkRole(userId, 'admin');
  
      if (!hasAdminRole && !request.payload.bookingId) {
        await transaction.rollback();
        return Common.generateError(request, 400, 'BOOKING_ID_REQUIRED_FOR_USER', {});
      }
  
      const {
        type,
        itemName,
        itemDescription,
        lostOrFoundDate,
        eventId,
        bookingId,
        contactNumber,
        contactCountryCode,
        attachmentId
      } = request.payload;
  
      let slot = '';
      let finalEventId = eventId;
  
    //   if (bookingId) {
    //     const booking = await Models.Booking.findOne({ where: { id: bookingId } });
    //     if (booking) {
    //       finalEventId = booking.eventId;
    //       slot = booking.slots;
    //     }
    //   } else if (eventId) {
    //     const event = await Models.Event.findOne({ where: { id: eventId } });
    //     if (event && event.slots?.length > 0) {
    //       slot = event.slots[0];
    //     }
    //   }
  
      const data = {
        type,
        itemName,
        itemDescription,
        lostOrFoundDate,
        eventId: finalEventId,
        bookingId,
        contactNumber,
        contactCountryCode,
        reportedBy: userId,
        itemBelongsTo: !hasAdminRole ? userId : null,
        attachmentId,
        slot,
        state: 1, // Reported
        status: 1 // Active
      };
  
      const createRecord = await Models.LostAndFound.create(data, { transaction });
  
      if (!createRecord) {
        await transaction.rollback();
        return Common.generateError(request, 400, 'FAILED_TO_CREATE_RECORD', {});
      }
  
      await transaction.commit();
      return h.response({
        message: request.i18n.__('RECORD_CREATED_SUCCESSFULLY'),
        responseData: createRecord
      }).code(200);
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
  };

export const updateRequest = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
      const userId = request.auth.credentials.userData.id;
      const hasAdminRole = await Common.checkRole(userId, 'admin');
      const { id } = request.params;
  
      // Fetch the existing record
      const existingRecord = await Models.LostAndFound.findOne({ where: { id } });
  
      if (!existingRecord) {
        await transaction.rollback();
        return Common.generateError(request, 404, 'RECORD_NOT_FOUND',{});
      }
  
      // Check if the user has permission to update this record
      if (!hasAdminRole && existingRecord.reportedBy !== userId) {
        await transaction.rollback();
        return Common.generateError(request, 403, 'UNAUTHORIZED_ACTION',{});
      }
  
      const {
        type,
        itemName,
        itemDescription,
        lostOrFoundDate,
        eventId,
        bookingId,
        contactNumber,
        contactCountryCode,
        attachmentId,
        itemBelongsTo,
        ownerFound,
        proofOfOwner,
        comment
      } = request.payload;
  
      let slot = existingRecord.slot;
      let finalEventId = eventId || existingRecord.eventId;
  
      // if (bookingId) {
      //   const booking = await Models.Booking.findOne({ where: { id: bookingId } });
      //   if (booking) {
      //     finalEventId = booking.eventId;
      //     slot = booking.slots;
      //   }
      // } else if (eventId) {
      //   const event = await Models.Event.findOne({ where: { id: eventId } });
      //   if (event && event.slots?.length > 0) {
      //     slot = event.slots[0];
      //   }
      // }
  
      const updatedData:LostAndFoundInterface = {
        type,
        itemName,
        itemDescription,
        lostOrFoundDate,
        eventId: finalEventId,
        bookingId,
        contactNumber,
        contactCountryCode,
        attachmentId,
        itemBelongsTo: !hasAdminRole ? userId : itemBelongsTo ?? null,
        ownerFound,
        proofOfOwner,
        comment,
        slot
      };
  
      // Remove undefined fields (avoid overriding with undefined)
      (Object.keys(updatedData) as (keyof LostAndFoundInterface)[]).forEach(
        key => updatedData[key] === undefined && delete updatedData[key]
      );
      
  
      await Models.LostAndFound.update(updatedData, { where: { id }, transaction });
  
      await transaction.commit();
  
      const updatedRecord = await Models.LostAndFound.findOne({ where: { id } });
  
      return h.response({
        message: request.i18n.__('RECORD_UPDATED_SUCCESSFULLY'),
        responseData: updatedRecord
      }).code(200);
    } catch (err) {
      console.error(err);
      await transaction.rollback();
      return Common.generateError(request, 500, 'FAILED_TO_UPDATE_RECORD', err);
    }
  };
  
export const list = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
      let {perPage,page,postType} = request.query;
      perPage = +process.env.PAGINATION_LIMIT!<perPage?+process.env.PAGINATION_LIMIT!:perPage
      let offset = (page - 1) * perPage;
      const results = await Models.LostAndFound.findAndCountAll({
        order:[['id','desc']],
            offset:offset,
            limit: perPage,
            distinct:true,
            // subQuery:false
      });
      return h.response({ responseData: results }).code(200);
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_RECORDS', err);
    }
  };  

export const listForUser = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
    const userId = request.auth.credentials.userData.id;  
      let {perPage,page,postType} = request.query;
      perPage = +process.env.PAGINATION_LIMIT!<perPage?+process.env.PAGINATION_LIMIT!:perPage
      let offset = (page - 1) * perPage;
      const results = await Models.LostAndFound.findAndCountAll({
        where:{reportedBy: userId},
        order:[['id','desc']],
            offset:offset,
            limit: perPage,
            distinct:true,
            // subQuery:false
      });
      return h.response({ responseData: results }).code(200);
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_RECORDS', err);
    }
  };   
export const getAll = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
      const results = await Models.LostAndFound.findAll();
      return h.response({ responseData: results }).code(200);
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_RECORDS', err);
    }
  };
  
export const getAllByUser = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
      const userId = request.auth.credentials.userData.id;
      const results = await Models.LostAndFound.findAll({ where: { reportedBy: userId } });
      return h.response({ responseData: results }).code(200);
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_USER_RECORDS', err);
    }
  };
  
export const getById = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
      const id = request.params.id;
      const record = await fetch(id);
      if (!record) {
        return Common.generateError(request, 404, 'RECORD_NOT_FOUND', {});
      }
      return h.response({ responseData: record }).code(200);
    } catch (err) {
      return Common.generateError(request, 500, 'FAILED_TO_FETCH_RECORD', err);
    }
  };
  
export const deleteRecord = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
      const id = request.params.id;
      const deleted = await Models.LostAndFound.destroy({ where: { id }, transaction });
      if (!deleted) {
        await transaction.rollback();
        return Common.generateError(request, 404, 'RECORD_NOT_FOUND_OR_ALREADY_DELETED', {});
      }
      await transaction.commit();
      return h.response({ message: request.i18n.__('RECORD_DELETED_SUCCESSFULLY') }).code(200);
    } catch (err) {
      await transaction.rollback();
      return Common.generateError(request, 500, 'FAILED_TO_DELETE_RECORD', err);
    }
  };
  
export const updateStatus = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
      const { id } = request.params;
      const {
        state,
        status,
        ownerFound,
        itemBelongsTo,
        proofOfOwner,
        comment
      } = request.payload;
  
      const userId = request.auth.credentials.userData.id;
      const hasAdminRole = await Common.checkRole(userId, 'admin');
  
      // Fetch the existing record
      const record = await Models.LostAndFound.findOne({ where: { id } });
  
      if (!record) {
        await transaction.rollback();
        return Common.generateError(request, 404, 'RECORD_NOT_FOUND',{});
      }
  
      // If not admin and not the owner, deny access
      if (!hasAdminRole && record.reportedBy !== userId) {
        await transaction.rollback();
        return Common.generateError(request, 403, 'UNAUTHORIZED_ACTION',{});
      }
  
      await Models.LostAndFound.update(
        { state, status, ownerFound, itemBelongsTo, proofOfOwner, comment },
        { where: { id }, transaction }
      );
  
      await transaction.commit();
  
      const fetchUpdatedResult = await Models.LostAndFound.findOne({ where: { id } });
  
      return h
        .response({
          message: request.i18n.__('RECORD_UPDATED_SUCCESSFULLY'),
          responseData: fetchUpdatedResult,
        })
        .code(200);
  
    } catch (err) {
      await transaction.rollback();
      return Common.generateError(request, 500, 'FAILED_TO_UPDATE_RECORD', err);
    }
  };
  

  
  