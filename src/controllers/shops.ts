import { Models, sequelize } from "../models";
import { Sequelize, Op } from "../config/dbImporter";
import * as Common from "./common";
import Moment from "moment";
import * as Constants from "../constants";
import * as Hapi from "@hapi/hapi";
import { Literal, Fn, Col } from "sequelize/types/utils";
import { AttributeElement } from "../config/customTypes";
import { sendEmail } from "./email";
import { ShopInterface } from "../config/interfaces/shop";
import { _ } from "../config/routeImporter";
import { WhereOptions } from "sequelize";
import {searchTextConversion} from "./common";

const shopAttributes: AttributeElement[] = ["id","userId","accountId","contactName","contactEmail","contactCountryCode","contactPhone","shopUrl","isVerified","lastUpdatedBy","status", [sequelize.literal('(case when `content`.name is not null then `content`.name else `defaultContent`.name END)'), "name"], [sequelize.literal('(case when `content`.description is not null then `content`.description else `defaultContent`.description END)'), "description"], "settings", "slots", "attachments", "meta", "social",
"isfeatured","code", "documentId"
];

const authorAttributes: AttributeElement[] = [
    'id',
    [sequelize.literal('`author->userProfile`.`name`'), 'name'],
    [sequelize.literal('`author->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
];

const updatedByAttributes: AttributeElement[] = [
    'id',
    [sequelize.literal('`updatedBy->userProfile`.`name`'), 'name'],
    [sequelize.literal('`updatedBy->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
];

// const createSearchIndex = async(id: number) => {
//     let searchString = "";
//     let shopInfo = await Models.Shop.findOne({ 
//         where: { id: id },
//         include: [
//             {
//                 model: Models.ShopContent, as: "shopContents"
//             }
//         ]
//     });

//     shopInfo = JSON.parse(JSON.stringify(shopInfo))

//     if(shopInfo) {
//         if(shopInfo.contactEmail) searchString += shopInfo.contactEmail + " ";
//         if(shopInfo.contactName) searchString += shopInfo.contactName + " ";
//         if(shopInfo.contactPhone) searchString += shopInfo.contactCountryCode + shopInfo.contactPhone + " ";
        
//         for(let item of shopInfo.shopContents!) {
//             if(item.name) searchString += item.name + " ";
//             if(item.description) searchString += item.description + " ";
//         }

//         if(searchString && searchString !== "") {
//             await Models.Shop.update({ searchIndex: searchString }, {where: { id: id }});
//         }

//         return true;
//     }

//     return false;
// }

const createSearchIndex = async(id: number) => {
    let searchString = "";
    let shopInfo = await Models.Shop.findOne({ 
        where: { id: id },
        include: [
            {
                model: Models.ShopContent, as: "shopContents"
            }
        ]
    });
    shopInfo = JSON.parse(JSON.stringify(shopInfo))
    if(shopInfo) {
        for(let item of shopInfo.shopContents!) {
            if(item.name) searchString += item.name + " ";
        }

        if(searchString && searchString !== "") {
            await Models.Shop.update({ searchIndex: searchString }, {where: { id: id }});
        }

        return true;
    }

    return false;
}

const storeRevision = async (Object: ShopInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.code = revisonObject.code + '-' + Moment().toISOString();
        revisonObject.revisionId = revisionId;
        for (const key in revisonObject.shopContents) {
            revisonObject.shopContents[key] = _.omit(revisonObject.shopContents[key], ['id', 'shopId'])
        }
        let revision = await Models.Shop.create(revisonObject, { include: [{ model: Models.ShopContent, as: "shopContents" }], transaction: transaction });
        if (revision)
            return revision;
        else
            return false;
    } catch (err) {
        console.log(err);
        return false;
    }
}

function replaceAll(str: string, search: string, replacement: string): string {
    return str.split(search).join(replacement);
}

const fetch = async(id: number, accountId: number | null, language: string) => {
    try {
        let shopInfo = await Models.Shop.findOne({
            where: { id },
            attributes: shopAttributes,
            include: [
                {
                    model:Models.Attachment,as:'document',
                    attributes:["id",[sequelize.fn('CONCAT',process.env.BASE_URL,"/attachment/",sequelize.literal('`document`.`unique_name`')), 'filePath'],
                    "fileName", "uniqueName", "extension","status"]
                },
                {
                    model: Models.ShopContent, as: "content", attributes: [],
                    include: [{ attributes: [],model: Models.Language, where: { code: language } }]
                },
                {
                    model: Models.ShopContent, as: "defaultContent", attributes: [],
                    include: [{ attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }]
                },
                {
                    model: Models.Address, as: "pickupAddress", attributes: {exclude: ["deletedAt"]},
                    where: { addressType: Constants.ADDRESS_TYPES.PICKUP }, required: false
                },
                {
                    model: Models.Address, as: "returnAddress", attributes: {exclude: ["deletedAt"]},
                    where: { addressType: Constants.ADDRESS_TYPES.RETURN }, required: false
                },
                {
                    model: Models.BankDetail, as: "bankDetails", attributes: ["id","details","userId"],
                    required: false
                },
                {
                    model: Models.User,
                    as: 'updatedBy',
                    attributes: updatedByAttributes,
                    include: [
                        {
                            model: Models.UserProfile,
                            as: "userProfile",
                            attributes: [],
                            include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }]
                        }
                    ]
                },
                {
                    model: Models.User,
                    as: 'author',
                    attributes: authorAttributes,
                    include: [
                        {
                            model: Models.UserProfile,
                            as: "userProfile",
                            attributes: [],
                            include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }]
                        }
                    ]
                }
            ]
        });

        if(shopInfo) {
            shopInfo = JSON.parse(replaceAll(
                JSON.stringify(shopInfo),"{{baseDomain}}",`${process.env.BASE_URL}`)
            )
        }
    
        return shopInfo;
    } catch (error) {
        console.log(error)
    }

}

export const create = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const accountId = request.auth.credentials.userData.accountId;
        const userId = request.auth.credentials.userData.id;
        const { contactName, contactEmail, contactCountryCode, contactPhone, code, name, description } = request.payload;

        // const urlResponse = await generateUrl(name);
        // if(urlResponse.url !== shopUrl) {
        //     await transaction.rollback();
        //     return Common.generateError(request, 400, 'INVALID_SHOP_URL', {});
        // }

        // const code = urlResponse.code;

        const userDocumentInfo = await Models.UserDocument.findOne({ where: { isRevision: false, userId } });
        if(!userDocumentInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'DOCUMENT_DOES_NOT_EXISTS', {});
        }

        const urlExists = await Models.Shop.findOne({ where: { code: code } });
        if(urlExists) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'URL_ALREADY_EXISTS', {});
        }

        const language = request.headers.language;
        const defaultLanguage = await Models.Language.findOne({where: { code: process.env.DEFAULT_LANGUAGE_CODE }});
        if(!defaultLanguage) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_DEFAULT_LANGUAGE', {});
        }

        let contents = [];
        contents.push({ languageId: defaultLanguage.id, name: name, description: description });
        if(language !== defaultLanguage.code) {
            const languageInfo = await Models.Language.findOne({ where: { code: language } });
            if(languageInfo) {
                contents.push({ languageId: languageInfo.id, name: name, description: description });
            }
        }
       
        const createdShop = await Models.Shop.create(
            {
                userId, accountId, contactName, contactEmail, contactCountryCode, code,
                contactPhone, shopUrl: code, isVerified: true, status: Constants.STATUS.ACTIVE,
                shopContents: contents, lastUpdatedBy: userId, documentId: userDocumentInfo.id
            },
            { include: [{ model: Models.ShopContent, as: "shopContents" }], transaction }
        );
        
        if(!createdShop) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'ERROR_WHILE_CREATING_SHOP', {});
        }

        await transaction.commit();
        await createSearchIndex(createdShop.id!);
        const responseData = await fetch(createdShop.id!, null, language);   
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const accountId = request.auth.credentials.userData.accountId;
        const userId = request.auth.credentials.userData.id;
        const { contactName, contactEmail, contactCountryCode, contactPhone, description } = request.payload;
        const shopId = request.params.id;
        const shopInfo = await Models.Shop.findOne({ 
            where: { id: shopId },
            include: [
                { model: Models.ShopContent, as: "shopContents" }
            ] 
        });

        if(!shopInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_SHOP_ID_PROVIDED', {});
        }

        await storeRevision(shopInfo, transaction);

        await Models.Shop.update({
            contactName, contactEmail, contactCountryCode, contactPhone, lastUpdatedBy: userId
        }, { 
            where: {id: shopId}, transaction 
        });
        let requestedLanguageId = await Models.Language.findOne({ where: { code: request.headers.language } });
        const existingContent = shopInfo.shopContents!.find((content) => content.languageId == requestedLanguageId!.id);
        if (existingContent) {
            let updatedContent = { description: '', languageId: existingContent.languageId };
            // updatedContent['name'] = name;
            updatedContent['description'] = description;
            await Models.ShopContent.update(updatedContent, { where: { id: existingContent.id }, transaction: transaction });
        } else {
            let newContent = { description: '', shopId: shopId, languageId: existingContent!.languageId };
            // newContent.name = name;
            newContent.description = description;
            newContent.languageId == requestedLanguageId?.id;
            await Models.ShopContent.create(newContent, { transaction: transaction });
        }

        await transaction.commit();
        await createSearchIndex(shopId);
        const responseData = await fetch(shopId, null, request.headers.language);
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const get = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        const shopId = request.params.id;

        const shopInfo = await fetch(shopId, null, request.headers.language);

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: shopInfo }).code(200);
    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const list = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let { perPage, page, searchText, userId } = request.query;
        perPage = +process.env.PAGINATION_LIMIT! < perPage ? +process.env.PAGINATION_LIMIT! : perPage
        let offset = (page - 1) * perPage;

        let where:WhereOptions = { isRevision: false}
        if(userId) {
            where = { ...where, userId }
        }

        const searchReplacements = {regularText: "", SpecialText: ""}
        const order: any = [];
        if(searchText) {
            const searchConversion = searchTextConversion(searchText);
            searchReplacements["regularText"] = searchConversion.regularString;
            searchReplacements["SpecialText"] = searchConversion.specialString;
            let conditionArray:WhereOptions=[]
            if((searchConversion.regularString).length > 0) {
                conditionArray.push(sequelize.literal('MATCH(`Shop`.search_index) AGAINST(:regularText IN BOOLEAN MODE)'))  
            }
            if((searchConversion.specialString).length > 0) {
                conditionArray.push(sequelize.literal('MATCH(`Shop`.search_index) AGAINST(:SpecialText IN BOOLEAN MODE)'))  
            }
            if(conditionArray.length){
                where = {...where,...{[Op.or]:conditionArray}}
            }

            // where = { ...where, [Op.or]: [
            //     sequelize.literal('MATCH(`Shop`.search_index) AGAINST(:regularText IN BOOLEAN MODE)'),
            //     sequelize.literal('MATCH(`Shop`.search_index) AGAINST(:SpecialText IN BOOLEAN MODE)'),
            // ]}

            // if(searchText.includes("@")) {
            //     where = { ...where, searchIndex: {[Op.like]: `%:searchText%`} }
            // } else {
            //     searchText = searchText.replace('@','*');
            //     searchText = searchText.replace(' ','*')+'*';
            //     where = { ...where, [Op.or]: [
            //         sequelize.literal('MATCH(`Shop`.search_index) AGAINST(:searchText IN BOOLEAN MODE)'),
            //     ]}
            // }
        } else {
            order.push(["id", "DESC"])
        }

        const shopList = await Models.Shop.findAndCountAll({
            replacements: searchReplacements,
            order: order,
            where: where,
            offset: offset,
            limit: perPage,
            distinct: true,
            col: "id",
            attributes: shopAttributes,
            include: [
                {
                    model:Models.Attachment,as:'document',
                    attributes:["id",[sequelize.fn('CONCAT',process.env.BASE_URL,"/attachment/",sequelize.literal('`document`.`unique_name`')), 'filePath'],
                    "fileName", "uniqueName", "extension","status"]
                },
                {
                    model: Models.ShopContent, as: "content", attributes: [],
                    include: [{ attributes: [],model: Models.Language, where: { code: request.headers.language } }]
                },
                {
                    model: Models.ShopContent, as: "defaultContent", attributes: [],
                    include: [{ attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }]
                },
                {
                    model: Models.User,
                    as: 'updatedBy',
                    attributes: updatedByAttributes,
                    include: [
                        {
                            model: Models.UserProfile,
                            as: "userProfile",
                            attributes: [],
                            include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }]
                        }
                    ]
                },
                {
                    model: Models.User,
                    as: 'author',
                    attributes: authorAttributes,
                    include: [
                        {
                            model: Models.UserProfile,
                            as: "userProfile",
                            attributes: [],
                            include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }]
                        }
                    ]
                }
            ]
        });

    
        let totalPages = await Common.getTotalPages(shopList.count, perPage);
        let rows = JSON.parse(replaceAll(
            JSON.stringify(shopList.rows),"{{baseDomain}}",`${process.env.BASE_URL}`
        ));

        return h.response({
            message: request.i18n.__("REQUEST_SUCCELLFULL"),
            responseData: {
                data: rows, perPage: perPage, page: page, totalRecords:shopList.count, totalPages: totalPages,
            }
        }).code(200)
        
    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const changeStatus = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const id = request.params.id;
        const status = request.payload.status;

        const shopInfo = await Models.Shop.findOne({ 
            where: { id: id }
        });

        if(!shopInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_ID_PROVIDED', {});
        }

        await shopInfo.update({ status: status }, { transaction });

        await transaction.commit();
        const responseData = await fetch(id, null, request.headers.language);
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const changefeatured = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const id = request.params.id;
        const status = request.payload.status;

        const shopInfo = await Models.Shop.findOne({ 
            where: { id: id }
        });

        if(!shopInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_ID_PROVIDED', {});
        }

        await shopInfo.update({ isfeatured: status }, { transaction });

        await transaction.commit();
        const responseData = await fetch(id, null, request.headers.language);
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const shopSettings = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const shopId = request.params.id;
        const settings = request.payload.settings;
        const slots = request.payload.slots;
        const attachments = request.payload.attachments;
        const meta = request.payload.meta;
        const social = request.payload.social;
        const bankAccountId = request.payload.bankAccountId;

        const shopInfo = await Models.Shop.findOne({ where: { id: shopId } });
        if(!shopInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_ID_PROVIDED', {});
        }

        const updateObject: any = {};
        if(settings !== null) {
            updateObject["settings"] = settings;
            //await shopInfo.update({ settings }, { transaction });
        }

        if(slots !== null) {
            updateObject["slots"] = slots;
            //await shopInfo.update({ slots }, { transaction });
        }
        
        if(meta !== null) {
            updateObject["meta"] = meta;
            //await shopInfo.update({ meta }, { transaction });
        }

        if(bankAccountId !== null) {
            updateObject["bankAccountId"] = bankAccountId;
            // await shopInfo.update({ bankAccountId }, { transaction });
        }
        
        if(social !== null) {
            updateObject["social"] = social;
            // await shopInfo.update({ social }, { transaction });
        }

        if(attachments !== null) {
            const attachmentArray = [];
            for(let item of attachments) {
                const attachmentInfo = await Models.Attachment.findOne({ where: { id: item.attachmentId } });
                if(attachmentInfo) {
                    attachmentArray.push({
                        type: item.type,
                        attachment: {
                            id: attachmentInfo.id,
                            uniqueName: attachmentInfo.uniqueName,
                            fileName: attachmentInfo.fileName,
                            extension: attachmentInfo.extension,
                            filePath: "{{baseDomain}}/attachment/"+attachmentInfo.uniqueName,
                            size: attachmentInfo.size 
                        }
                    })
                }
            }
            updateObject["attachments"] = attachmentArray;
            // await shopInfo.update({ attachments: attachmentArray }, { transaction }); 
        }
        await shopInfo.update(updateObject, { transaction });
        await transaction.commit();
        const responseData = await fetch(shopId, null, request.headers.language);
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        console.log(error)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const listUserShops = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let authUser = request.auth.credentials.userData.id;
        let userId = request.params.id;
        if(userId == null || userId == undefined) {
            userId = authUser;
        }
        
        let where:WhereOptions = { isRevision: false, userId }

        let shopList = await Models.Shop.findAll({
            where: where,
            attributes: shopAttributes,
            include: [
                {
                    model:Models.Attachment,as:'document',
                    attributes:["id",[sequelize.fn('CONCAT',process.env.BASE_URL,"/attachment/",sequelize.literal('`document`.`unique_name`')), 'filePath'],
                    "fileName", "uniqueName", "extension","status"]
                },
                {
                    model: Models.ShopContent, as: "content", attributes: [],
                    include: [{ attributes: [],model: Models.Language, where: { code: request.headers.language } }]
                },
                {
                    model: Models.ShopContent, as: "defaultContent", attributes: [],
                    include: [{ attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }]
                },
                {
                    model: Models.User,
                    as: 'updatedBy',
                    attributes: updatedByAttributes,
                    include: [
                        {
                            model: Models.UserProfile,
                            as: "userProfile",
                            attributes: [],
                            include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }]
                        }
                    ]
                },
                {
                    model: Models.User,
                    as: 'author',
                    attributes: authorAttributes,
                    include: [
                        {
                            model: Models.UserProfile,
                            as: "userProfile",
                            attributes: [],
                            include: [{ model: Models.Attachment, as: 'profileAttachment', attributes: [] }]
                        }
                    ]
                }
            ]
        });

        shopList = JSON.parse(replaceAll(
            JSON.stringify(shopList),"{{baseDomain}}",`${process.env.BASE_URL}`
        ))

        return h.response({
            message: request.i18n.__("REQUEST_SUCCELLFULL"), responseData: shopList
        }).code(200)
        
    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

const generateUrl = async(name: string) => {
    let slug = Common.slugify(name);
    // Step 1: Find the latest record with the same base code or a similar pattern
    const latestRecord = await Models.Shop.findOne({
        where: {
            code: {
                [Op.like]: `${slug}%`
            }
        },
        order: [
            [sequelize.literal('LENGTH(code)'), 'DESC'],
            ['code', 'DESC']
        ]
    });

    // Step 2: Determine the next available code only if there is a matching pattern
    let nextCode;
    if (latestRecord && latestRecord.code!.startsWith(slug)) {
        const match = latestRecord.code!.match(/(\d+)$/);
        const suffix = match ? parseInt(match[1], 10) + 1 : 1;
        nextCode = `${slug}-${suffix}`;
    } else {
        nextCode = slug; // If no match, use the newCode as is
    }

    const url = `https://${nextCode}.com`;

    return { code: nextCode, url: url }
}

export const generateUrlForShop = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        const code = request.payload.code;
        const urlExists = await Models.Shop.findOne({ where: { code: code } });
        if(urlExists) {
            return Common.generateError(request, 400, 'URL_ALREADY_EXISTS', {});
        }
        return h.response({
            message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: {proceed: true}
        }).code(200)
    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}