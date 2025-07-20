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
import { ProductAttributeContentInterface, ProductContentInterface } from "../config/interfaces/product";

type AttributeElement = string | [Literal, string] | [Fn, string];


const productAttributes: AttributeElement[] = [
    'id', 'storeId', 'categoryId', 'parentProductId', 'basePrice', 'sku', 'code','status', 'approvalStatus', 'createdAt', 'updatedAt',
    //[sequelize.fn('SUM', sequelize.literal('CASE WHEN `Product`.id != `Product`.parent_product_id THEN 1 ELSE 0 END')), 'variants'],
    [sequelize.literal('(case when `content`.name is not null then `content`.name else `defaultContent`.name END)'), 'name'],
    [sequelize.literal('(case when `content`.description is not null then `content`.description else `defaultContent`.description END)'), 'description'],
];

const productAttributeAttributes: AttributeElement[] = [
    'id', 'productId', 'attributeId', 'code', 
    //[sequelize.fn('SUM', sequelize.literal('CASE WHEN `Product`.id != `Product`.parent_product_id THEN 1 ELSE 0 END')), 'variants'],
    [sequelize.literal('(case when `ProductAttributes->content`.value is not null then `ProductAttributes->content`.value else `ProductAttributes->defaultContent`.value END)'), 'value'],
];

const productImageAttributes: AttributeElement[] = [
    "id",
    [sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.API_SERVER_HOST, "/attachment/", sequelize.literal('`productImage`.`unique_name`')), 'filePath']
]

interface ProductAttributeInterface {
    attributeId: number;
    values: string[] | string;
}


//Fetch product
export const fetch = async (id: number, accountId: number, language: string) => {
    let product = await Models.Product.findOne({
        attributes: productAttributes,
        include: [
            {
                attributes: [],
                model: Models.ProductContent, as: 'content',
                include: [
                    { attributes: [], model: Models.Language, where: { code: language } }
                ]
            },
            {
                attributes: [],
                model: Models.ProductContent, as: 'defaultContent',
                include: [
                    { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                ]
            },
            {
                attributes: productImageAttributes,
                model: Models.Attachment,
                as: "productImage"
            },
            {
                attributes: productAttributeAttributes,
                model: Models.ProductAttribute,
                include:[
                    {
                        attributes: [],
                        model: Models.ProductAttributeContent, as: 'content',
                        include: [
                            { attributes: [], model: Models.Language, where: { code: language } }
                        ]
                    },
                    {
                        attributes: [],
                        model: Models.ProductAttributeContent, as: 'defaultContent',
                        include: [
                            { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                        ]
                    },
                    {
                        model: Models.Attribute
                    }
                ]
            }
        ],
        //where: { id: id, accountId: accountId },
        where: {id: id},
        subQuery: false,
    });
    return product;
}

// Function to generate Cartesian product of attribute values
function generateCartesianProduct(data: ProductAttributeInterface[]): { [key: number]: string }[] {
    const attributes = data;
    function helper(index: number, currentCombination: { [key: number]: string }): { [key: number]: string }[] {
        if (index === attributes.length) {
            return [{ ...currentCombination }];
        }
        const { attributeId, values } = attributes[index];
        const combinations: { [key: number]: string }[] = [];
        for (const value of values) {
            currentCombination[attributeId] = value;
            const nextCombinations = helper(index + 1, currentCombination);
            combinations.push(...nextCombinations);
        }
        return combinations;
    }
    return helper(0, {});
}

//Create product
export const create = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let language = request.headers.language;
        // let userId = request.auth.credentials.userData.id;
        // let accountId = request.auth.credentials.userData.accountId;
        let { 
            storeId, 
            categoryId, 
            name, 
            basePrice, 
            sku, 
            description, 
            attachmentId, 
            brandId, 
            attributes, 
            rent=false, 
            buy=false, 
            preLoved=false ,
            rentalDurationType=0,
            rentalDuration=0,
            rentalPrice=0,
            securityDeposit=0,
            prepDays=0,
            preLovedPrice=0,
            keywords=null
        } = request.payload;
        //separate the attributes into variant and non-variant attributes
        let variantAttributes = [];
        let normalAttributes = [];
        if(attributes && attributes.length > 0){
            for(const [index, obj] of attributes.entries()){
                let result = await Models.Attribute.findOne({where: {id: obj.attributeId}});
                if(result){
                    if(result.isVariant == 1){
                        variantAttributes.push(obj);
                    }else{
                        normalAttributes.push(obj);
                    }
                    
                }

            }
        }
        let combinations = generateCartesianProduct(variantAttributes);
        
        let slug:string = "";
        
        let descriptionText = await Common.convertHtmlToText(description);
        let productsArrayData = [];
        if(combinations && combinations.length > 0){
            
            let product_name_slug = await Common.slugify(name);
            let slug_str =  product_name_slug;
            
            for(const [index, obj] of combinations.entries()){
                let variationName = "";
                let productName = name;
                let count = 0;
                let aa = [];
                for(const [key, value] of Object.entries(obj)){
                    slug_str += "-"+ await Common.slugify(value);
                    if(count == 0){
                        variationName  += value;
                    }else{
                        variationName  += ", " +value;
                    }
                    aa.push({attributeId:key, value: value});
                    count++;
                }
                
                productName = productName + " ("+variationName+")"
                slug = slug_str;
                slug_str = product_name_slug;

                productsArrayData.push({
                    storeId, 
                    code: slug,
                    categoryId, 
                    name: productName, 
                    originalName: name,
                    basePrice, 
                    sku, 
                    description, 
                    descriptionText: descriptionText,
                    keywords: keywords,
                    attachmentId, 
                    brandId,
                    attributes: aa
                });
                
            }

            
        }else{
            productsArrayData.push({
                storeId, 
                code: await Common.slugify(name),
                categoryId, 
                name: name, 
                originalName: name,
                basePrice, 
                sku, 
                description, 
                descriptionText: descriptionText,
                keywords: keywords,
                attachmentId, 
                brandId,
                attributes: []
            });
        }

        if(normalAttributes && normalAttributes.length > 0){
            if(productsArrayData && productsArrayData.length > 0){
                for(const [index, obj] of productsArrayData.entries()){
                    let aa = obj.attributes;
                    for(const [i, o] of normalAttributes.entries()){
                        aa.push({
                            attributeId: o.attributeId,
                            value: o.values
                        });
                    }
                    productsArrayData[index] = Object.assign(productsArrayData[index], {attributes: aa});
                }
            }
        }

        let productArray1 = [];
        let productArray2 = [];
        let productArray3 = [];
        let productsArray:any = [];
        if(productsArrayData){
            if(rent){
                for(let [index, obj] of productsArrayData.entries()){
                    obj = Object.assign(obj, {productType: Constants.PRODUCT_TYPE.RENT})
                    productArray1.push({
                        ...obj, 
                        productType: Constants.PRODUCT_TYPE.RENT,
                    }) 
                }
            }
            if(buy){
                for(const [index, obj] of productsArrayData.entries()){
                    productArray2.push({...obj, productType: Constants.PRODUCT_TYPE.BUY}) 
                }
            }
            if(preLoved){
                for(const [index, obj] of productsArrayData.entries()){
                    productArray3.push({
                        ...obj, productType: Constants.PRODUCT_TYPE.PRE_LOVED
                        
                    }) 
                }
            }
            productsArray = productArray1.concat(productArray2, productArray3);
            let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUAGE_CODE } });
            let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.headers.language } });
            if (defaultLanguage) {
                let productParentId: number = 0;
                for(const [index, obj] of productsArray.entries()){
                    let ProductContents: ProductContentInterface[] = [];
                    let language = request.headers.language;
                    let defaultLanguageObject: ProductContentInterface;
                    let requestedLanguageObject: ProductContentInterface;
                    if (language != process.env.DEFAULT_LANGUAGE_CODE) {
                        if (defaultLanguage && requestedLanguage) {
                            defaultLanguageObject = {
                                originalName: obj.originalName,
                                languageId: defaultLanguage.id,
                                name: obj.name,
                                description: obj.description,
                                descriptionText: obj.descriptionText, 
                                keywords: obj.keywords
                            };
                            requestedLanguageObject = {
                                originalName: obj.originalName,
                                languageId: requestedLanguage.id,
                                name: obj.name,
                                description: obj.description,
                                descriptionText: obj.descriptionText,
                                keywords: obj.keywords
                            }
                            ProductContents.push(defaultLanguageObject, requestedLanguageObject);
                            
                        }
                    }else{
                        defaultLanguageObject = {
                            originalName: obj.originalName,
                            languageId: defaultLanguage.id,
                            name: obj.name,
                            description: obj.description,
                            descriptionText: obj.descriptionText,
                            keywords: obj.keywords
                        };
                        ProductContents.push(defaultLanguageObject);
                    }
                    let product = await Models.Product.create({
                        storeId: storeId,
                        categoryId: categoryId,
                        brandId: brandId,
                        code: obj.code,
                        productType: obj.productType,
                        attachmentId: attachmentId,
                        basePrice: basePrice,
                        sku: sku,
                        userId: 2,
                        accountId: 3,
                        rentalDurationType: obj.productType == Constants.PRODUCT_TYPE.RENT ? rentalDurationType : 0,
                        rentalDuration: obj.productType == Constants.PRODUCT_TYPE.RENT ? rentalDuration : 0,
                        rentalPrice: obj.productType == Constants.PRODUCT_TYPE.RENT ? rentalPrice : 0,
                        securityDeposit: obj.productType == Constants.PRODUCT_TYPE.RENT ? securityDeposit : 0,
                        prepDays: obj.productType == Constants.PRODUCT_TYPE.RENT ? prepDays : 0,
                        preLovedPrice: obj.productType == Constants.PRODUCT_TYPE.PRE_LOVED ? preLovedPrice : 0,
                        lastUpdatedBy: null,
                        ProductContents: ProductContents

                    }, {
                        include: [
                            { model: Models.ProductContent }
                        ],
                        transaction: transaction
                    });

                    if(product && product.id){
                        //update productParentId, code, sku
                        if(index == 0){
                            productParentId = product?.id;
                        }
                        
                        await Models.Product.update(
                            {
                                parentProductId: productParentId,
                                sku: product?.sku +"-" + product.id,
                                code: product?.code + "-" + product.id 
                            },
                            {
                                where: {
                                    id: product.id
                                },
                                transaction
                            }
                        );
                        if(obj.attributes && obj.attributes.length > 0){
                            //Insert attribute values
                            for(const [indexAttribute, objAttribute] of obj.attributes.entries()){
                                let ProductAttributesContents: ProductAttributeContentInterface[] = [];
                                let defaultAttributeLanguageObject: ProductAttributeContentInterface;
                                let requestedAttributeLanguageObject: ProductAttributeContentInterface;
                                if (language != process.env.DEFAULT_LANGUAGE_CODE) {
                                    if (defaultLanguage && requestedLanguage) {
                                        defaultAttributeLanguageObject = {
                                            languageId: defaultLanguage.id,
                                            value: objAttribute.value,
                                        };
                                        requestedAttributeLanguageObject = {
                                            languageId: requestedLanguage.id,
                                            value: objAttribute.value,
                                        }
                                        ProductAttributesContents.push(defaultAttributeLanguageObject, requestedAttributeLanguageObject);
                                    }
                                }else{
                                    defaultAttributeLanguageObject = {
                                        languageId: defaultLanguage.id,
                                        value: objAttribute.value,
                                    };
                                    ProductAttributesContents.push(defaultAttributeLanguageObject);
                                }
                                let productAttribute = await Models.ProductAttribute.create({
                                    productId: product?.id,
                                    attributeId: parseInt(objAttribute?.attributeId),
                                    code: await Common.slugify(objAttribute.value),
                                    ProductAttributeContents: ProductAttributesContents
                                }, {
                                    include: [
                                        { model: Models.ProductAttributeContent }
                                    ],
                                    transaction: transaction
                                });

                            }
                            
                        }
                    }
                }
            }else{

            }

        }

        await transaction.commit();
        return h.response({ message: request.i18n.__("PRODUCT_CREATED_SUCCESSFULLY"), responseData: {normalAttributes, productsArray, combinations: combinations, slug: slug}}).code(200) 
        
    } catch (err) {
        console.log(err)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}


export const gallery = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try{
        let language = request.headers.language;
        // let userId = request.auth.credentials.userData.id;
        // let accountId = request.auth.credentials.userData.accountId;
        let { storeId, productId, attachments  } = request.payload;
        
        let product = await Models.Product.findOne({where: {storeId: storeId, id: productId}});
        if(product && attachments && attachments.length > 0){
            await Models.ProductGallery.destroy({where: {productId: product.id}, transaction});
            for(const [index, obj] of attachments.entries()){
                await Models.ProductGallery.create({
                    productId: productId,
                    attachmentId: obj
                }, {transaction})
            }
            await transaction.commit();
            return h.response({ message: request.i18n.__("PRODUCT_GALLERY_HAS_BEEN_UPDATED_SUCCESSFULLY"), responseData: null }).code(200)
        }else{
            await transaction.rollback();
            return Common.generateError(request, 400, 'PRODUCT_NOT_FOUND', {});
        }
    } catch (err) {
        console.log(err)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

export const copyGallery = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try{
        let language = request.headers.language;
        // let userId = request.auth.credentials.userData.id;
        // let accountId = request.auth.credentials.userData.accountId;
        let { productId, toBeCopiedFromProductId  } = request.payload;
        
        let product = await Models.Product.findOne({where: {id: productId}});
        let toBeCopiedFrom = await Models.Product.findOne({where: {id: toBeCopiedFromProductId, parentProductId: product?.parentProductId}});
        if(product && toBeCopiedFrom){
            let gallery = await Models.ProductGallery.findAll({where:{productId: toBeCopiedFrom?.id}});
            if(gallery){
                gallery = JSON.parse(JSON.stringify(gallery));
                if(gallery && gallery.length > 0){
                    for(const [index, obj] of gallery.entries()){
                        await Models.ProductGallery.create({
                            productId: productId,
                            attachmentId: obj.attachmentId
                        }, {transaction})
                    }
                }
            }
            await transaction.commit();
            return h.response({ message: request.i18n.__("PRODUCT_GALLERY_HAS_BEEN_COPIED_SUCCESSFULLY"), responseData: null }).code(200)
        }else{
            await transaction.rollback();
            return Common.generateError(request, 400, 'PRODUCT_NOT_FOUND', {});
        }
    } catch (err) {
        console.log(err)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

//Send product to admin for approval
export const sendForApproval = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try{
        let language = request.headers.language;
        let { id  } = request.payload;
        let where: WhereOptions = {id: id}
        where = {...where, [Op.or]: [
            {approvalStatus: Constants.PRODUCT_APPROVAL_STATUS.NOT_SENT_FOR_APPROVAL},
            {approvalStatus: Constants.PRODUCT_APPROVAL_STATUS.REJECTED}
        ] }
        let product = await Models.Product.findOne({where: where});
        if(product){
            await Models.Product.update({approvalStatus: Constants.PRODUCT_APPROVAL_STATUS.SENT_FOR_APPROVAL}, {where: {id: id}})
            await transaction.commit();
            return h.response({ message: request.i18n.__("PRODUCT_SENT_FOR_APPROVAL"), responseData: null }).code(200)
        }else{
            await transaction.rollback();
            return Common.generateError(request, 400, 'PRODUCT_NOT_FOUND', {});
        }
    } catch (err) {
        console.log(err)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

//Send product to admin for approval
export const updateProductApprovalStatus = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try{
        let language = request.headers.language;
        let { id, reason, status  } = request.payload;
        let where: WhereOptions = {id: id}
        where = {...where, approvalStatus: Constants.PRODUCT_APPROVAL_STATUS.SENT_FOR_APPROVAL }
        let product = await Models.Product.findOne({where: where});
        if(product){
            if(status == Constants.PRODUCT_APPROVAL_STATUS.REJECTED){
                await Models.Product.update({approvalStatus: Constants.PRODUCT_APPROVAL_STATUS.REJECTED, reason: reason}, {where: {id: id}, transaction})
            }else{
                await Models.Product.update({approvalStatus: Constants.PRODUCT_APPROVAL_STATUS.APPROVED}, {where: {id: id}, transaction})
            }
            
            await transaction.commit();
            return h.response({ message: request.i18n.__("PRODUCT_SENT_FOR_APPROVAL"), responseData: null }).code(200)
        }else{
            await transaction.rollback();
            return Common.generateError(request, 400, 'PRODUCT_NOT_FOUND', {});
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
        // let userId = request.auth.credentials.userData.id;
        // let accountId = request.auth.credentials.userData.accountId;
        let language = request.headers.language;
        let { productType, parentProductId, perPage, page, searchText } = request.query;
        perPage = +process.env.PAGINATION_LIMIT! < perPage ? +process.env.PAGINATION_LIMIT! : perPage;
        let offset = (page - 1) * perPage;

        let where: WhereOptions = {}
        if(searchText) {
            where = { ...where, [Op.or]: [
                sequelize.literal('MATCH(`defaultContent`.name) AGAINST(:searchText IN BOOLEAN MODE)'),
                sequelize.literal('MATCH(`content`.name) AGAINST(:searchText IN BOOLEAN MODE)'),
              ] }
        }   
        if(productType){
            where = {
                ...where,
                productType: productType
            }
        }
        if(parentProductId){
            where = {
                ...where,
                parentProductId: parentProductId
            }
        }else{
            where = {
                ...where,
                [Op.and]:[
                    sequelize.literal('`Product`.id = `Product`.parent_product_id')
                ]
            }
        }
       

        let records = await Models.Product.findAndCountAll({
            attributes: productAttributes,
            include: [
                {
                    attributes: [],
                    model: Models.ProductContent, as: 'content',
                    include: [
                        { attributes: [], model: Models.Language, where: { code: language } }
                    ]
                },
                {
                    attributes: [],
                    model: Models.ProductContent, as: 'defaultContent',
                    include: [
                        { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                    ]
                },
                {
                    attributes: productImageAttributes,
                    model: Models.Attachment,
                    as: "productImage"
                }
            ],
            order: [['id', 'desc']],
            where: where,
            offset: offset,
            limit: perPage,
            subQuery: false,
            //group: ['parentProductId'],
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

// get a product by id
export const getProduct = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let { id } = request.params
        //let accountId = request.auth.credentials.userData.accountId;
        let accountId = 0;
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