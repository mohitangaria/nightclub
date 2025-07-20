import { Models, sequelize } from "../models";
import * as Common from './common';
import * as Constants from '../constants';
import Moment from "moment";
import _ from "lodash";
import { Sequelize, Op } from "../config/dbImporter";
import requestIp from 'request-ip';
import * as Hapi from "@hapi/hapi";
import { Literal, Fn } from "sequelize/types/utils";
import { string } from "joi";
import { NumBatchResults } from "aws-sdk/clients/personalize";
import { WhereOptions } from "sequelize";
import { AttributeContentInterface, AttributeOptionContentInterface } from "../config/interfaces/attribute";
type AttributeElement = string | [Literal, string] | [Fn, string];

const attributeAttributes: AttributeElement[] = [
    'id', 'code', 'type', 'isVariant', 'status', 'createdAt', 'updatedAt',
    [sequelize.literal('(case when `content`.name is not null then `content`.name else `defaultContent`.name END)'), 'name'],
];

const attributeOptionAttributes: AttributeElement[] = [
    'id', 'code', 'attributeId',
    [sequelize.literal('(case when `AttributeOptions->content`.name is not null then `AttributeOptions->content`.name else `AttributeOptions->defaultContent`.name END)'), 'name'],
];


const getAttributeOrderSequence = async (Id: number, transaction: Sequelize.Transaction) => {
    let orderSequence = '';
    let attributeId:number|null;
    attributeId=Id;
    let categoryAttributeCode = '';
    try {
        let loopcounter = 0;
        let attributeData;
        orderSequence = '';
        while (attributeId != null) {
            if (loopcounter != 0)
                orderSequence = orderSequence != '' ? categoryAttributeCode + '|' + orderSequence : categoryAttributeCode;
            attributeData = await Models.Attribute.findOne({ attributes: ['id', 'code'], where: { id: attributeId }, transaction: transaction });
            categoryAttributeCode = attributeData?.code!;
            attributeId = null;
            loopcounter += 1;
        }
        if (orderSequence != '')
            orderSequence = attributeData?.code + "|" + orderSequence;
        else
            orderSequence = attributeData?.code!;
        return orderSequence;
    } catch (err) {
        return orderSequence;
    }
}

// fetch attribute details by id
const fetchAttribute = async (id: number, accountId: number, language: string) => {
    let attributeData = await Models.Attribute.findOne({
        attributes: attributeAttributes,
        include: [
            
            {
                attributes: [],
                model: Models.AttributeContent, as: 'content',
                include: [
                    { attributes: [], model: Models.Language, where: { code: language } }
                ]
            },
            {
                attributes: [],
                model: Models.AttributeContent, as: 'defaultContent',
                include: [
                    { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                ]
            },
            {
                attributes: attributeOptionAttributes,
                model: Models.AttributeOption,
                include:[
                    {
                        attributes: [],
                        model: Models.AttributeOptionContent, as: 'content',
                        include: [
                            { attributes: [], model: Models.Language, where: { code: language } }
                        ]
                    },
                    {
                        attributes: [],
                        model: Models.AttributeOptionContent, as: 'defaultContent',
                        include: [
                            { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                        ]
                    },
                ]
            }
            
        ],
        where: { id: id, accountId: accountId },
        subQuery: false,
    });
    return attributeData;
}

export const createAttribute = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let { name, type, isVariant, options } = request.payload;
        
        let slug = await Common.slugify(name);
        
        
        let AttributeContents: AttributeContentInterface[] = [];
        
        
        let attributeWhere = {accountId: accountId, code: slug };
        
        let existingCase = await Models.Attribute.findOne({ where: attributeWhere });
        
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUAGE_CODE } });


        console.log(defaultLanguage, " =================== defaultLanguage")


        let language = request.headers.language;
        let defaultLanguageObject: AttributeContentInterface;
        let requestedLanguageObject: AttributeContentInterface;

        if (defaultLanguage) {
            let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
            if (language != process.env.DEFAULT_LANGUAGE_CODE) {
                // create content in default language as user language is not default
                

                if (defaultLanguage && requestedLanguage) {
                    //create attribute in default in requested language
                    defaultLanguageObject = {
                        name: name,
                        languageId: defaultLanguage.id
                    };
                    requestedLanguageObject = {
                        name: name,
                        languageId: requestedLanguage.id
                    }
                    AttributeContents.push(defaultLanguageObject, requestedLanguageObject)
                } else {
                    await transaction.rollback();
                    return Common.generateError(request, 400, 'ERROR_WHILE_FETCHING_REQUIRED_LANGUAGE_FOR_CONTENT_CREATION', {});
                }
            } else {
                defaultLanguageObject = {
                    name: name,
                    languageId: defaultLanguage?.id
                }
                AttributeContents.push(defaultLanguageObject)
            }
            if (!existingCase) {
                let attributeData = await Models.Attribute.create({
                    code: slug,
                    userId: userId,
                    accountId: accountId,
                    lastUpdatedBy: null,
                    isVariant: isVariant,
                    type: type,
                    AttributeContents: AttributeContents
                }, {
                    include: [
                        { model: Models.AttributeContent }
                    ],
                    transaction: transaction
                }
                );
                if (attributeData) {
                    let attributeId = attributeData?.id;
                    if(type == Constants.ATTRIBUTE_TYPE.DROPDOWN && options && options.length > 0){
                        for(let [index, obj] of options.entries()){
                            console.log(obj, 'kkkkkkkkk--');
                            let slug = Common.slugify(obj.name);
                            let record = await Models.AttributeOption.findOne({where: {attributeId: attributeId, code: slug}});
                            let defaultLanguageObject: AttributeOptionContentInterface;
                            let requestedLanguageObject: AttributeOptionContentInterface;
                            let AttributeOptionContents: AttributeOptionContentInterface[] = [];
                            if(!record){
                                if (language != process.env.DEFAULT_LANGUAGE_CODE) {
                                    // create content in default language as user language is not default
                                    if (defaultLanguage && requestedLanguage) {
                                        //create attribute in default in requested language
                                        defaultLanguageObject = {
                                            name: obj.name,
                                            languageId: defaultLanguage.id
                                        };
                                        requestedLanguageObject = {
                                            name: obj.name,
                                            languageId: requestedLanguage.id
                                        }
                                        AttributeOptionContents.push(defaultLanguageObject, requestedLanguageObject)
                                    } else {
                                        await transaction.rollback();
                                        return Common.generateError(request, 400, 'ERROR_WHILE_FETCHING_REQUIRED_LANGUAGE_FOR_CONTENT_CREATION', {});
                                    }
                                } else {
                                    defaultLanguageObject = {
                                        name: obj.name,
                                        languageId: defaultLanguage?.id
                                    }
                                    AttributeOptionContents.push(defaultLanguageObject)
                                }

                                let categoryAttributeOption = await Models.AttributeOption.create({
                                    code: slug,
                                    attributeId: attributeId,
                                    AttributeOptionContents: AttributeOptionContents
                                }, {
                                    include: [
                                        { model: Models.AttributeOptionContent }
                                    ],
                                    transaction: transaction
                                });
                            }
                        }
                    }
                    let orderSequence = await getAttributeOrderSequence(attributeData.id!, transaction);
                    await Models.Attribute.update({ orderSequence: orderSequence }, { where: { id: attributeData.id }, transaction: transaction })
                    await transaction.commit();
                    let returnObject = await fetchAttribute(attributeData.id!, accountId, request.headers.language);
                    returnObject = JSON.parse(JSON.stringify(returnObject));
                    return h.response({ message: request.i18n.__("ATTRIBUTE_CREATED_SUCCESSFULLY"), responseData: returnObject }).code(200)
                } else {
                    await transaction.rollback();
                    return Common.generateError(request, 400, 'ERROR_WHILE_CREATING_THE_ATTRIBUTE', {});
                }
            } else {
                await transaction.rollback();
                return Common.generateError(request, 400, 'ATTRIBUTE_ALREADY_EXISTS', {});
            }
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'DEFAULT_LANGUAGE_NOT_FOUND', {});
        }
    } catch (err) {
        console.log(err)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// get a attribute by id
export const getAttribute = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let { id } = request.params
        let attributeId = id;
        let accountId = request.auth.credentials.userData.accountId;
        let attributeData = await fetchAttribute(attributeId, accountId, request.headers.language);
        if (attributeData) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: JSON.parse(JSON.stringify(attributeData)) }).code(200)
        } else {
            return Common.generateError(request, 400, 'ATTRIBUTE_DOES_NOT_EXIST', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// List attributes without pagination 
export const attributeList = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let language = request.headers.language;
        
        let records = await Models.Attribute.findAll({
            attributes: attributeAttributes,
            include: [
                {
                    attributes: [],
                    model: Models.AttributeContent, as: 'content',
                    include: [
                        { attributes: [], model: Models.Language, where: { code: language } }
                    ]
                },
                {
                    attributes: [],
                    model: Models.AttributeContent, as: 'defaultContent',
                    include: [
                        { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                    ]
                },
                {
                    attributes: attributeOptionAttributes,
                    model: Models.AttributeOption,
                    include:[
                        {
                            attributes: [],
                            model: Models.AttributeOptionContent, as: 'content',
                            include: [
                                { attributes: [], model: Models.Language, where: { code: language } }
                            ]
                        },
                        {
                            attributes: [],
                            model: Models.AttributeOptionContent, as: 'defaultContent',
                            include: [
                                { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                            ]
                        },
                    ]
                }
            ],
            where: { accountId: accountId },
            subQuery: false,
        });
        return h.response({
            message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData: records
        }).code(200)
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

//update attribute
export const updateAttribute = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { id } = request.params;
        let attributeId = id;
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let { name, type, isVariant, options } = request.payload;
        let language = request.headers.language;
        let slug = await Common.slugify(name);
        let attributeDetails = await fetchAttribute(attributeId, accountId, language );
        if (!attributeDetails) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'VALID_ATTRIBUTE_IS_REQUIRED', {});
        }
        
        let attributeWhere = { accountId: accountId, code: slug, id : {[Op.ne]: attributeId} };
        
        let existingCase = await Models.Attribute.findOne({ where: attributeWhere });
        
        if (attributeDetails && !existingCase) {
            
            await Models.Attribute.update({
                type: type,
                isVariant: isVariant,
                code: slug
            }, {where: {id: attributeId}, transaction});

            //Check if request language content exists
            let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });

            if(requestedLanguage){
                let requestLangContent = await Models.AttributeContent.findOne({
                    where:{
                        attributeId: attributeId,
                        languageId: requestedLanguage?.id
                    }
                });
                let updatedAttributeContentObj = {
                    attributeId: attributeId,
                    languageId: requestedLanguage?.id,
                    name: name
                }
                if(requestLangContent){
                    await Models.AttributeContent.update(updatedAttributeContentObj, {
                        where: {
                            id: requestLangContent?.id,
                            languageId: requestedLanguage?.id
                        },
                        transaction
                    })
                }else{
                    await Models.AttributeContent.create(updatedAttributeContentObj, {
                        transaction
                    })
                }

                if(type == Constants.ATTRIBUTE_TYPE.DROPDOWN){
                    if(options.length > 0){
                        for(let [index, obj] of options.entries()){
                            if(obj.id && obj.isDeleted){
                                let optionInitialData = await Models.AttributeOption.findOne({where: {id: obj.id}});
                                if(optionInitialData){
                                    let newSlug = optionInitialData?.code +"_"+Moment().toISOString();
                                    await Models.AttributeOption.update({code: newSlug},{where: {id: obj.id}, transaction});
                                    await Models.AttributeOption.destroy({where: {id: obj.id}, transaction});
                                }
                                
                            }else{
                                let optionId: number|null = null;
                                let slug = Common.slugify(obj.name);
                                if(obj.id){
                                    optionId = obj.id;
                                    //check if its not in use already 
                                    let optionRecord = await Models.AttributeOption.findOne({where:{attributeId: attributeId, code: slug, id: {[Op.ne]: obj.id}}});
                                    if(!optionRecord){
                                        await Models.AttributeOption.update({
                                            code: slug,

                                        }, {where: {id: obj.id}, transaction})
                                    }
                                }else{
                                    let optionRecord = await Models.AttributeOption.findOne({where:{attributeId: attributeId, code: slug}});
                                    if(!optionRecord){
                                        let optionData = await Models.AttributeOption.create({
                                            code: slug,
                                            attributeId: attributeId

                                        }, {transaction});
                                        
                                        if(optionData && optionData?.id){
                                            optionId = optionData?.id
                                        }
                                        
                                    }
                                }
                                if(optionId){
                                    let requestLangContent = await Models.AttributeOptionContent.findOne({
                                        where:{
                                            attributeOptionId: optionId,
                                            languageId: requestedLanguage?.id
                                        }
                                    });
                                    let updatedAttributeContentObj = {
                                        attributeOptionId: optionId,
                                        languageId: requestedLanguage?.id,
                                        name: obj.name
                                    }
                                    if(requestLangContent){
                                        await Models.AttributeOptionContent.update(updatedAttributeContentObj, {
                                            where: {
                                                id: optionId,
                                                languageId: requestedLanguage?.id
                                            },
                                            transaction
                                        })
                                    }else{
                                        await Models.AttributeOptionContent.create(updatedAttributeContentObj, {
                                            transaction
                                        })
                                    }
                                }
                            }
                        }
                    }
                }
            }
            await transaction.commit()
            let responseObject = await fetchAttribute(attributeId, accountId, request.headers.language);
            responseObject = JSON.parse(JSON.stringify(responseObject));
            return h.response({ message: request.i18n.__("ATTRIBUTE_HAS_BEEN_UPDATED_SUCCESSFULLY"), responseData: responseObject }).code(200)

        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'ATTRIBUTE_NOT_FOUND', {});
        }
    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// update status of attribute status
export const updateAttributeStatus = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { id } = request.params;
        let attributeId = id;
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let { status } = request.payload;
        let attributeData = await Models.Attribute.findOne({
            where: { id: attributeId},
            include: [
                {
                    model: Models.AttributeContent
                }
            ]
        });
        if (attributeData && attributeData?.id) {
           
                await Models.Attribute.update({ lastUpdatedBy: userId, status: status }, { where: { id: attributeData.id }, transaction: transaction });
                await transaction.commit();
                let responseObject = await fetchAttribute(attributeData.id, accountId, request.headers.language);
                responseObject = JSON.parse(JSON.stringify(responseObject));
                return h.response({ message: request.i18n.__("ATTRIBUTE_STATUS_HAS_BEEN_UPDATED_SUCCESSFULLY"), responseData: responseObject }).code(200)
           

        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'ATTRIBUTE_NOT_FOUND', {});
        }

    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

//delete attribute
export const deleteAttribute = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { id } = request.params;
        let attributeId = id;
        let accountId = request.auth.credentials.userData.accountId;
        let attributeData = await Models.Attribute.findOne({
            where: { id: attributeId },
            include: [
                {
                    model: Models.AttributeContent
                }
            ]

        });

        if (attributeData) {
            let newSlug = attributeData.code + "_" + Moment().toISOString();
            await Models.Attribute.update({code: newSlug}, {where: {id: attributeId}});
            await Models.Attribute.destroy({where: {id: attributeId}});
            await transaction.commit();
            return h.response({ message: request.i18n.__("ATTRIBUTE_HAS_BEEN_DELETED_SUCCESSFULLY"), responseData: null }).code(200)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'ATTRIBUTE_NOT_FOUND', {});
        }

    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}