import Hapi from "@hapi/hapi";
import { Models, sequelize } from '../models';
import { Sequelize, Op } from "../config/dbImporter";
import * as Common from "./common"

const getAppVersion = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let appVersion = await Models.AppVersion.findOne({
            attributes: [
                'ios_soft_update', 'ios_critical_update', 'android_soft_update', 'android_critical_update'
            ],
            where: { id: { [Op.gt]: 0 } }
        });
        let responseObject = JSON.parse(JSON.stringify(appVersion));
        return h.response({ message: request.i18n.__("APP_VERSION_INFORMATION"), responseData: responseObject }).code(200)
    } catch (err: unknown) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

const setAppVersion = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let { ios_soft_update, ios_critical_update, android_soft_update, android_critical_update } = request.payload;
        let versionData = {
            ios_soft_update: ios_soft_update, ios_critical_update: ios_critical_update, android_soft_update: android_soft_update, android_critical_update: android_critical_update
        }
        const existingRecord = await Models.AppVersion.findOne({ where: { id: { [Op.gt]: 0 } } });
        if (existingRecord) {
            await existingRecord.update(versionData, { transaction: transaction });
        } else {
            await Models.AppVersion.create({ ...versionData }, { transaction: transaction });
        }
        let appVersion = await Models.AppVersion.findOne({
            attributes: [
                'ios_soft_update', 'ios_critical_update', 'android_soft_update', 'android_critical_update'
            ],
            where: { id: { [Op.gt]: 0 } }, transaction
        });
        let responseObject;
        if (appVersion) {
            responseObject = JSON.parse(JSON.stringify(appVersion));
        } else {
            responseObject = null;
        }
        if (responseObject) {
            await transaction.commit();
            return h.response({ message: request.i18n.__("APP_VERSION_INFORMATION_UPDATED"), responseData: responseObject }).code(200)
        }
        else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'ERROR_IN_UPDATING_DATA', {});
        }
    } catch (err: unknown) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}
export {
    getAppVersion,
    setAppVersion
}