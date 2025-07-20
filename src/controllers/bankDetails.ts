import { Models, sequelize } from "../models";
import { Sequelize, Op } from "../config/dbImporter";
import * as Common from "./common";
import * as Hapi from "@hapi/hapi";
import { BankDetailInterface } from "../config/interfaces/bankDetails";
import { _ } from "../config/routeImporter";

const storeRevision = async (Object: BankDetailInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.revisionId = revisionId;
        
        let revision = await Models.BankDetail.create(revisonObject, { transaction: transaction });
        if (revision) return revision;
        else return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

export const create = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = request.auth.credentials.userData.id;
        const details = request.payload;

        const detailsExists = await Models.BankDetail.findOne({ where: { userId: userId, 'details.accountNumber': details.accountNumber, isRevision: false } });

        if(detailsExists) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'BANK_DETAILS_ALREADY_EXISTS', {});
        }

        const createdAccount = await Models.BankDetail.create({ userId, details }, { transaction });

        await transaction.commit();
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: createdAccount }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = request.auth.credentials.userData.id;
        const details = request.payload;
        const id = request.params.id;

        const detailsExists = await Models.BankDetail.findOne({ where: { id: id } });
        if(!detailsExists) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_ID_PROVIDED', {});
        }

        await storeRevision(detailsExists, transaction);
        const updatedAccount = await detailsExists.update({ details }, { transaction });

        await transaction.commit();
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: updatedAccount }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const get = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        const userId = request.auth.credentials.userData.id;
        const id = request.params.id;

        const detailsExists = await Models.BankDetail.findOne({ where: { id: id } });

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: detailsExists }).code(200);
    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const list = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        const userId = request.auth.credentials.userData.id;

        const listBankDetails = await Models.BankDetail.findAll({ 
            where: {
                userId: userId, 
                isRevision: false 
            } 
        });

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: listBankDetails }).code(200);
    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const remove = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = request.auth.credentials.userData.id;
        const details = request.payload;
        const id = request.params.id;

        const detailsExists = await Models.BankDetail.findOne({ where: { id: id } });
        if(!detailsExists) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_ID_PROVIDED', {});
        }

        await storeRevision(detailsExists, transaction);
        const updatedAccount = await detailsExists.destroy({ transaction });

        await transaction.commit();
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: updatedAccount }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}