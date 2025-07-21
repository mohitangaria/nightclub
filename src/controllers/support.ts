import { Models, sequelize } from "../models";
import * as Common from "./common";
import * as Constants from "../constants";
import Moment from "moment";
import _ from "lodash";
import { Sequelize, Op } from "../config/dbImporter";
import requestIp from "request-ip";
import * as Hapi from "@hapi/hapi";
import { Literal, Fn } from "sequelize/types/utils";
import { Transaction, WhereOptions } from "sequelize";
import { sendEmail } from "./email";

export const createSupportTicket = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = request.auth?.credentials?.userData?.id || null;
    const userName = request.auth?.credentials?.userData?.name || 'User';
    const accountId = request.auth?.credentials?.userData?.accountId || null;
    const { subject, message } = request.payload as { subject: string; message: string };

    const ticket = await Models.SupportTicket.create(
      {
        userId,
        accountId,
        subject,
        message,
        status: 0, // Open
      },
      { transaction }
    );

    await Models.SupportMessage.create({
      supportTicketId: ticket.id!,
      senderType: 2, // user
      message,
    }, { transaction });
    await transaction.commit();
    let replacements = { name: userName, subject, message }
    // await sendEmail("signup_verification", replacements, ['mohitangaria77@gmail.com'], request.headers.language);
    return h.response({ message: request.i18n.__("TICKET_CREATED_SUCCESSFULLY"), responseData: ticket }).code(201)

  } catch (error) {
    await transaction.rollback();
    return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WHILE_CREATE_SUPPORT_TICKET', error);
}
};

export const getUserTickets = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
  try {
    const userId = request.auth?.credentials?.userData?.id || null;

    const tickets = await Models.SupportTicket.findAll({
      where: { userId: userId },
      include: [
        {
          model: Models.SupportMessage,
          as: "messages",
          order: [["createdAt", "ASC"]],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return h.response({  message: request.i18n.__("TICKETS_FETCHED_SUCCESSFULLY"),  responseData: tickets,}).code(200);
  } catch (err) {
    return Common.generateError(request, 500, "SOMETHING_WENT_WRONG_WITH_EXCEPTION_WHILE_FETCH_SUPPORT_TICKET", err);
  }
};

export const getAllSupportTickets = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
  try {
      // let { page = 1, perPage = 10, searchText, status, sortParameter = 'createdAt', sortValue = 'DESC' } = request.query;
      let { page = 1, perPage = process.env.PAGINATION_LIMIT, searchText, status, sortParameter = 'createdAt', sortValue = 'DESC' } = request.query;

      const offset = (page - 1) * perPage;

      let where: any = {};
      const order: any = [];

      // Filter by status if provided
      if (status !== undefined && status !== null) {
          where.status = status;
      }

      // Search in subject or message (fulltext or LIKE)
      if (searchText) {
          where[Op.or] = [
              { subject: { [Op.like]: `%${searchText}%` } },
              { message: { [Op.like]: `%${searchText}%` } }
          ];
      }

      // Sorting
      order.push([sortParameter, sortValue]);

      const tickets = await Models.SupportTicket.findAndCountAll({
          where,
          offset,
          limit: perPage,
          order,
          // distinct: true,
          // col: 'id',
          attributes: ['id', 'subject', 'message', 'status', 'createdAt', 'updatedAt'],
          include: [
              {
                  model: Models.SupportMessage,
                  as: 'messages',
                  attributes: ['id', 'senderType', 'message', 'createdAt'],
                  order: [['createdAt', 'ASC']]
              },
              // {
              //     model: Models.User,
              //     as: 'user',
              //     attributes: ['id', 'username', 'email']
              // }
          ]
      });

      const totalPages = await Common.getTotalPages(tickets.count, perPage);

      return h.response({
          message: request.i18n.__("TICKETS_FETCHED_SUCCESSFULLY"),
          responseData: {
              responseData: tickets.rows,
              perPage,
              page,
              totalRecords: tickets.count,
              totalPages,
              // meta: {}
          }
      }).code(200);

  } catch (error) {
      return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
  }
};

export const getTicketById = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
  try {
    const userId = request.auth?.credentials?.userData?.id || null;
    const accountId = request.auth?.credentials?.userData?.accountId || null;
    const { id } = request.params;

    const ticket = await Models.SupportTicket.findOne({
      where: { id },
      include: [
        {
          model: Models.SupportMessage,
          as: "messages",
          order: [["createdAt", "ASC"]],
        },
      ],
    });

    if (!ticket) {
      return Common.generateError(request, 404, "TICKET_NOT_FOUND", {});
    }

    return h.response({message: request.i18n.__("TICKET_FETCHED_SUCCESSFULLY"),responseData: ticket,}).code(200);
  } catch (err) {
    return Common.generateError(request, 500, "SOMETHING_WENT_WRONG_WITH_EXCEPTION", err);
  }
};

export const adminReplyToTicket = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = request.params;
    const { adminReply, status } = request.payload as { adminReply: string; status: 1 | 2 };

    const ticket = await Models.SupportTicket.findByPk(id, { transaction });

    if (!ticket) {
      await transaction.rollback();
      return Common.generateError(request, 404, "TICKET_NOT_FOUND", {});
    }

    await Models.SupportMessage.create({
      supportTicketId: ticket.id!,
      senderType: 1,
      message: adminReply,
    }, { transaction });

    await ticket.update({ status }, { transaction });

    await transaction.commit();

    return h.response({
      message: request.i18n.__("TICKET_UPDATED_SUCCESSFULLY"),
    }).code(200);

  } catch (err) {
    await transaction.rollback();
    return Common.generateError(request, 500, "SOMETHING_WENT_WRONG_WITH_EXCEPTION_WHILE_REPLY_ON_TICKET", err);
  }
};

export const deleteSupportTicket = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = request.auth.credentials.userData.id;
    const { id } = request.params;

    const isAdmin = Common.checkRole(userId, 'admin');
    if(!isAdmin) {
      await transaction.rollback();
      return Common.generateError(request, 404, "NOT_AUTHORIZE_TO_TAKE_ACTION", {});
    }

    const ticket = await Models.SupportTicket.findOne({
      where: { id, userId },
      transaction 
    });

    if (!ticket) {
      await transaction.rollback();
      return Common.generateError(request, 404, "TICKET_NOT_FOUND", {});
    }

    await ticket.destroy({ transaction });

    await transaction.commit();

    return h.response({
      message: request.i18n.__("TICKET_DELETED_SUCCESSFULLY"),
    }).code(200);

  } catch (err) {
    await transaction.rollback();
    return Common.generateError(request, 500, "SOMETHING_WENT_WRONG_WITH_EXCEPTION", err);
  }
};

