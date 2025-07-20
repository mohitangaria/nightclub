import {Models,sequelize} from "../models";
import * as Common from "./common";
import * as Constants from "../constants";
import _ from "lodash";
import * as Hapi from "@hapi/hapi";
import { WhereOptions } from "sequelize";

export const addAddress = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const authUser = request.auth.credentials.userData.id;
        const accountId = request.auth.credentials.userData.accountId;
        const { name, mapAddress, address, city, state, zipCode, country, landmark, latitude, longitude, addressLine1, addressLine2, phone, countryCode, shopId, entityType, addressType, geoLocation } = request.payload;

        const createdAddress = await Models.Address.create({
            mapAddress, address, city, state, zipCode, country, landmark, latitude, longitude, addressLine1, addressLine2, userId: authUser, name, phone, countryCode, shopId, entityType, addressType, accountId, geoLocation
        }, { transaction: transaction });

        await transaction.commit();
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: createdAddress }).code(200);
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const updateAddress = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const authUser = request.auth.credentials.userData.id;
        const { mapAddress, address, city, state, zipCode, country, landmark, latitude, longitude, addressLine1, addressLine2, name, phone, countryCode, shopId, entityType, addressType, geoLocation } = request.payload;
        const id = request.params.id;

        const addressInfo = await Models.Address.findOne({ where: { id } });
        if(!addressInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_ADDRESS_ID_PROVIDED', {});
        }

        let updatedObject:any = {}

        if(mapAddress !== null) updatedObject["mapAddress"] = mapAddress === "" ? null : mapAddress;
        if(address !== null) updatedObject["address"] = address === "" ? null : address;
        if(city !== null) updatedObject["city"] = city === "" ? null : city;
        if(state !== null) updatedObject["state"] = state === "" ? null : state;
        if(zipCode !== null) updatedObject["zipCode"] = zipCode === "" ? null : zipCode;
        if(country !== null) updatedObject["country"] = country === "" ? null : country;
        if(landmark !== null) updatedObject["landmark"] = landmark === "" ? null : landmark;
        if(latitude !== null) updatedObject["latitude"] = latitude === "" ? null : latitude;
        if(longitude !== null) updatedObject["longitude"] = longitude === "" ? null : longitude;
        if(addressLine1 !== null) updatedObject["addressLine1"] = addressLine1 === "" ? null : addressLine1;
        if(addressLine2 !== null) updatedObject["addressLine2"] = addressLine2 === "" ? null : addressLine2;
        if(name !== null) updatedObject["name"] = name === "" ? null : name;
        if(phone !== null) updatedObject["phone"] = phone === "" ? null : phone;
        if(countryCode !== null) updatedObject["countryCode"] = countryCode === "" ? null : countryCode;
        if(shopId !== null) updatedObject["shopId"] = shopId === "" ? null : shopId;
        if(entityType !== null) updatedObject["entityType"] = entityType === "" ? null : entityType;
        if(addressType !== null) updatedObject["addressType"] = addressType === "" ? null : addressType;
        if(geoLocation !== null) updatedObject["geoLocation"] = geoLocation === "" ? null : geoLocation;

        const updatedAddress = await addressInfo.update(updatedObject, { transaction });

        await transaction.commit();
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: updatedAddress }).code(200);
    }
    catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const fetchAddress = async(request:Hapi.RequestQuery,h:Hapi.ResponseToolkit)=>{
    try {
        const authUser = request.auth.credentials.userData.id;
        const id = request.params.id;
        const addressInfo = await Models.Address.findOne({where:{id}});

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: addressInfo }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const fetchUserAddress = async(request:Hapi.RequestQuery,h:Hapi.ResponseToolkit)=>{
    try {
        const authUser = request.auth.credentials.userData.id;
        let id = request.params.id;
        const { addressType, entityType, shopId } = request.query;
        if(id == null || id == undefined) {
            id = authUser;
        }

        let where: WhereOptions = { userId: id };
        if(addressType !== null) where = { ...where, addressType }
        if(entityType !== null) where = { ...where, entityType }
        if(shopId !== null) where = { ...where, shopId }

        const addressInfo = await Models.Address.findAll({where: where, order: [["id", "DESC"]]});

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: addressInfo }).code(200);
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const deleteAddress = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const authUser = request.auth.credentials.userData.id;
        const id = request.params.id;
        const addressInfo = await Models.Address.findOne({ where: { id } });
        if(!addressInfo) {
            transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_ADDRESS_ID_PROVIDED', {});
        }

        const deletedAddress = await addressInfo.destroy({transaction});

        transaction.commit();
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: deletedAddress }).code(200);
    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}