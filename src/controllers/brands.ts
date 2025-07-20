import { Models, sequelize } from "../models";
import * as Common from './common';
import * as Constants from '../constants';
import Moment from "moment";
import _ from "lodash";
import { Sequelize, Op } from "../config/dbImporter";
import requestIp from 'request-ip';
import * as Hapi from "@hapi/hapi";
import { Literal, Fn } from "sequelize/types/utils";
import { WhereOptions } from "sequelize";
import { BrandContentInterface } from "../config/interfaces/brand";

type AttributeElement = string | [Literal, string] | [Fn, string];

const brandAttributes: AttributeElement[] = [
    'id', 'code','status', 'createdAt', 'updatedAt',
    [sequelize.literal('(case when `content`.name is not null then `content`.name else `defaultContent`.name END)'), 'name'],
];

const brandImageAttributes: AttributeElement[] = [
    "id",
    [sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.API_SERVER_HOST, "/attachment/", sequelize.literal('`brandImage`.`unique_name`')), 'filePath']
]

// fetch brand details by id
const fetch = async (id: number, accountId: number, language: string) => {
    let brand = await Models.Brand.findOne({
        attributes: brandAttributes,
        include: [
            {
                attributes: [],
                model: Models.BrandContent, as: 'content',
                include: [
                    { attributes: [], model: Models.Language, where: { code: language } }
                ]
            },
            {
                attributes: [],
                model: Models.BrandContent, as: 'defaultContent',
                include: [
                    { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                ]
            },
            {
                attributes: brandImageAttributes,
                model: Models.Attachment,
                as: "brandImage"
            },
            
            
        ],
        where: { id: id, accountId: accountId },
        subQuery: false,
    });
    return brand;
}

export const create = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let { name, attachmentId } = request.payload;
        
        let slug = await Common.slugify(name);
        
        
        let BrandContents: BrandContentInterface[] = [];
        
        
        let existingCase = await Models.Attribute.findOne({ where: {code: slug} });
        
        let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUAGE_CODE } });


        let language = request.headers.language;
        let defaultLanguageObject: BrandContentInterface;
        let requestedLanguageObject: BrandContentInterface;

        if (defaultLanguage) {
            let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
            if (language != process.env.DEFAULT_LANGUAGE_CODE) {
                if (defaultLanguage && requestedLanguage) {
                    defaultLanguageObject = {
                        name: name,
                        languageId: defaultLanguage.id
                    };
                    requestedLanguageObject = {
                        name: name,
                        languageId: requestedLanguage.id
                    }
                    BrandContents.push(defaultLanguageObject, requestedLanguageObject)
                } else {
                    await transaction.rollback();
                    return Common.generateError(request, 400, 'ERROR_WHILE_FETCHING_REQUIRED_LANGUAGE_FOR_CONTENT_CREATION', {});
                }
            } else {
                defaultLanguageObject = {
                    name: name,
                    languageId: defaultLanguage?.id
                }
                BrandContents.push(defaultLanguageObject)
            }
            if (!existingCase) {
                let brand = await Models.Brand.create({
                    code: slug,
                    userId: userId,
                    attachmentId: attachmentId || null,
                    accountId: accountId,
                    lastUpdatedBy: null,
                    BrandContents: BrandContents
                }, {
                    include: [
                        { model: Models.BrandContent }
                    ],
                    transaction: transaction
                });
                if(brand && brand.id){
                    await transaction.commit();
                    let brandData = fetch(brand?.id, accountId, language);
                    brandData = JSON.parse(JSON.stringify(brandData));
                    return h.response({ message: request.i18n.__("BRAND_CREATED_SUCCESSFULLY"), responseData: brandData }).code(200)
                }else{
                    await transaction.rollback();
                    return Common.generateError(request, 400, 'ERROR_WHILE_CREATING_THE_BRAND', {});
                }
                
            } else {
                await transaction.rollback();
                return Common.generateError(request, 400, 'BRAND_ALREADY_EXISTS', {});
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

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let brandId = request.params.id;
        let { name, attachmentId } = request.payload;
        
        let slug = await Common.slugify(name);
        let language = request.headers.language;
        
        let existingCase = await Models.Brand.findOne({ where: {code: slug, id: {[Op.ne]: brandId}} });
        if (!existingCase) {
            let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
            if(requestedLanguage){
                let data = {
                    code: slug,
                    attachmentId: attachmentId || null,
                    lastUpdatedBy: userId
                }
                await Models.Brand.update(data, {
                    where: {
                        id: brandId
                    },
                    transaction
                });
                let dataForLang = {
                    name: name,
                    languageId: requestedLanguage?.id,
                    brandId: brandId
                }
                //check if data exists in requested lang
                let langData = await Models.BrandContent.findOne({
                    where: {
                        languageId: requestedLanguage?.id,
                        brandId: brandId
                    }
                })
                if(langData){
                    await Models.BrandContent.update(dataForLang, {where: {brandId: brandId, languageId: requestedLanguage?.id}, transaction})
                }else{
                    await Models.BrandContent.create(dataForLang,{transaction}) 
                }
                await transaction.commit();
                let brandData = fetch(brandId, accountId, language);
                brandData = JSON.parse(JSON.stringify(brandData));
                return h.response({ message: request.i18n.__("BRAND_UPDATED_SUCCESSFULLY"), responseData: brandData }).code(200) 
            }else{
                await transaction.rollback();
                return Common.generateError(request, 400, 'REQUESTED_LANGUAGE_NOT_FOUND', {});
            }
        }else{
            await transaction.rollback();
            return Common.generateError(request, 400, 'BRAND_ALREADY_EXISTS', {});
        }
        
        

       
    } catch (err) {
        console.log(err)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// List category attributes with pagination 
export const list = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    
    try {
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let language = request.headers.language;
        let { perPage, page, parentId, type, searchText } = request.query;
        perPage = +process.env.PAGINATION_LIMIT! < perPage ? +process.env.PAGINATION_LIMIT! : perPage;
        let offset = (page - 1) * perPage;

        let where: WhereOptions = {}
        if(searchText) {
            where = { ...where, [Op.or]: [
                sequelize.literal('MATCH(`defaultContent`.name) AGAINST(:searchText IN BOOLEAN MODE)'),
                sequelize.literal('MATCH(`content`.name) AGAINST(:searchText IN BOOLEAN MODE)'),
              ] }
        }   
       

        let records = await Models.Brand.findAndCountAll({
            attributes: brandAttributes,
            include: [
                
                {
                    attributes: [],
                    model: Models.BrandContent, as: 'content',
                    include: [
                        { attributes: [], model: Models.Language, where: { code: language } }
                    ]
                },
                {
                    attributes: [],
                    model: Models.BrandContent, as: 'defaultContent',
                    include: [
                        { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                    ]
                },
                {
                    attributes: brandImageAttributes,
                    model: Models.Attachment,
                    as: "brandImage"
                }
                
                
            ],
            order: [['id', 'desc']],
            where: where,
            offset: offset,
            limit: perPage,
            subQuery: false,
            replacements: { searchText }
        });
        const count = records.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        let rows = JSON.parse(JSON.stringify(records.rows));
        return h.response({
            message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData: {
                data: rows,
                perPage: perPage,
                page: page,
                totalRecords:count,
                totalPages: totalPages,
            }
        }).code(200)
        
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// get a brand by id
export const getBrand = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let { id } = request.params
        let accountId = request.auth.credentials.userData.accountId;
        let brand = await fetch(id, accountId, request.headers.language);
        if (brand) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: JSON.parse(JSON.stringify(brand)) }).code(200)
        } else {
            return Common.generateError(request, 400, 'BRAND_DOES_NOT_EXIST', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// update status of brand
export const updateStatus = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { id } = request.params;
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let { status } = request.payload;
        let brand = await Models.Brand.findOne({
            where: { id: id },
            include: [
                {
                    model: Models.BrandContent
                }
            ]
        });
        if (brand && brand?.id) {
           
                await Models.Brand.update({ lastUpdatedBy: userId, status: status }, { where: { id: brand.id }, transaction: transaction });
                await transaction.commit();
                let responseObject = await fetch(id, accountId, request.headers.language);
                responseObject = JSON.parse(JSON.stringify(responseObject));
                return h.response({ message: request.i18n.__("BRAND_STATUS_HAS_BEEN_UPDATED_SUCCESSFULLY"), responseData: responseObject }).code(200)
           

        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'BRAND_NOT_FOUND', {});
        }

    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

//delete brand
export const deleteBrand = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { id } = request.params;
        let accountId = request.auth.credentials.userData.accountId;
        let brand = await Models.Brand.findOne({
            where: { id: id},
            include: [
                {
                    model: Models.BrandContent
                }
            ]

        });

        if (brand) {
            let newSlug = brand.code + "_" + Moment().toISOString();
            await Models.Brand.update({code: newSlug}, {where: {id: id}});
            await Models.Brand.destroy({where: {id: id}});
            await transaction.commit();
            return h.response({ message: request.i18n.__("BRAND_HAS_BEEN_DELETED_SUCCESSFULLY"), responseData: null }).code(200)
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'BRAND_NOT_FOUND', {});
        }

    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}