import { id } from "aws-sdk/clients/datapipeline";
import * as Hapi from "@hapi/hapi";
import { Models, sequelize } from "../models";
const Common = require("./common");
const Constants = require("../constants");
const Moment = require("moment");
const _ = require("lodash");
import { Sequelize, Op } from "../config/dbImporter";
import { Literal } from "sequelize/types/utils";
import { request } from "http";
import { hapi } from "hapi-i18n"
import { CategoryInterface, CategoryTypeContentInterface } from "../config/interfaces/category";
import { WhereOptions } from "sequelize";

type AttributeElement = string | [string | Literal, string];
// Define all query attributes
const attributes: AttributeElement[] = [
    'id', 'code', 'status', 'userId', 'isRevision', 'revisionId', 'createdAt', 'updatedAt',
    [sequelize.literal('(case when `content`.name is not null then `content`.name else `defaultContent`.name END)'), 'name'],
    [sequelize.literal('(case when `content`.description is not null then `content`.description else `defaultContent`.description END)'), 'description']
];

const authorAttributes: AttributeElement[] = [
    'id',
    [sequelize.literal('`author->userProfile`.`name`'), 'name'],
    [sequelize.literal('`author->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
]

const updatedByAttributes: AttributeElement[] = [
    'id',
    [sequelize.literal('`updatedBy->userProfile`.`name`'), 'name'],
    [sequelize.literal('`updatedBy->userProfile->profileAttachment`.`unique_name`'), 'profileImage']
]

// Fetch a category type by identifier
const fetch = async (id: id, language: any) => {
try {
    let categoryType = await Models.CategoryType.findOne({
        attributes: attributes,
        include: [
            {
                attributes: [],
                model: Models.CategoryTypeContent, as: 'content',
                include: [
                    { attributes: [], model: Models.Language, where: { code: language } }
                ]
            },
            {
                attributes: [],
                model: Models.CategoryTypeContent, as: 'defaultContent',
                include: [
                    { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                ]
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
        ],
        where: { id: id },
        subQuery: false,
    });
    return categoryType;
} catch (error) {
    console.log(error)
}

}

// Generate revision of category type prior to update and delete functions.
const storeRevision = async (Object: CategoryInterface, transaction: Sequelize.Transaction) => {
    try {
        let revisonObject = JSON.parse(JSON.stringify(Object));
        let revisionId = revisonObject.id;
        revisonObject = _.omit(revisonObject, ['id']);
        revisonObject.isRevision = true;
        revisonObject.code = revisonObject.code + '-' + Moment().toISOString();
        revisonObject.revisionId = revisionId;
        for (const key in revisonObject.CategorytypeContents) {
            revisonObject.CategorytypeContents[key] = _.omit(revisonObject.CategorytypeContents[key], ['id', 'categorytypeId'])
        }
        let revision = await Models.CategoryType.create(revisonObject, { include: [{ model: Models.CategoryTypeContent }], transaction: transaction });
        if (revision)
            return revision;
        else
            return false;
    } catch (err) {
        return false;
    }
}

// create a new category type
export const create = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { name, description } = request.payload;
        let exists = await Models.CategoryType.findOne({
            include: [
                { model: Models.CategoryTypeContent, where: { name: name } }
            ]
        });
        if (!exists) {
            let userId = request.auth.credentials.userData.id;
            let slug = await Common.slugify(name);
            let language = request.headers.language;
            let descriptionText = await Common.convertHtmlToText(description)
            let defaultLanguageObject = {} as CategoryTypeContentInterface;
            let requestedLanguageObject = {} as CategoryTypeContentInterface;
            let defaultLanguage = await Models.Language.findOne({ where: { 'code': process.env.DEFAULT_LANGUAGE_CODE } });
            let CategorytypeContents: CategoryTypeContentInterface[] = [];
            if (defaultLanguage) {
                if (language != process.env.DEFAULT_LANGUAGE_CODE) {
                    // create content in default language as user language is not default
                    let requestedLanguage = await Models.Language.findOne({ where: { 'code': request.header.language } });
                    if (defaultLanguage && requestedLanguage) {
                        //create categoryType in default in requested language
                        defaultLanguageObject = {
                            name: name,
                            description: description,
                            descriptionText: descriptionText,
                            languageId: defaultLanguage.id
                        };
                        requestedLanguageObject = {
                            name: name,
                            description: description,
                            descriptionText: descriptionText,
                            languageId: requestedLanguage.id
                        }
                        CategorytypeContents.push(defaultLanguageObject, requestedLanguageObject)
                    } else {
                        return Common.generateError(request, 400, 'ERROR_WHILE_FETCHING_REQUIRED_LANGUAGE_FOR_CONTENT_CREATION', {});
                    }
                } else {
                    defaultLanguageObject = {
                        name: name,
                        description: description,
                        descriptionText: descriptionText,
                        languageId: defaultLanguage?.id
                    }
                    CategorytypeContents.push(defaultLanguageObject)
                }

                console.log(CategorytypeContents)

                let categoryType = await Models.CategoryType.create(
                    {
                        code: slug,
                        userId: userId,
                        lastUpdatedBy: null as unknown as number,
                        status: Constants.STATUS.ACTIVE,
                        CategoryTypeContents: CategorytypeContents
                    },
                    {
                        include: [
                            { model: Models.CategoryTypeContent }
                        ],
                        transaction: transaction
                    }
                );




                if (categoryType) {
                    await transaction.commit();
                    let categoryTypeObj = JSON.parse(JSON.stringify(categoryType));
                    // returnOBj['name'] = returnOBj.CategorytypeContents[0].name;
                    // returnOBj['description'] = returnOBj.CategorytypeContents[0].description;
                    // returnOBj = _.omit(returnOBj, ['CategorytypeContents']);
                    let returnObject = await fetch(categoryTypeObj.id, request.headers.language);
                    returnObject = JSON.parse(JSON.stringify(returnObject));
                    return h.response({ message: request.i18n.__("CATEGORY_TYPE_HAS_BEEN_CREATED_SUCCESSFULLY"), responseData: returnObject }).code(200)
                } else {
                    await transaction.rollback();
                    return Common.generateError(request, 400, 'ERROR_WHILE_CREATING_THE_CATEGORY_TYPE', {});
                }
            } else {
                await transaction.rollback();
                return Common.generateError(request, 400, 'CONTENT_TYPE_ALREADY_EXISTS_WITH_SAME_NAME', {});
            }
        }
        else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'CATEGORY_ALREADY_EXISTS', {});
        }
    } catch (err) {
        console.log(err)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// get a category type by id
export const get = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let { id } = request.params
        let categorytype = await fetch(id, request.headers.language);
        if (categorytype) {
            return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: JSON.parse(JSON.stringify(categorytype)) }).code(200)
        } else {
            return Common.generateError(request, 400, 'CATEGORY_TYPE_DOES_NOT_EXISTS', {});
        }
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// update a category type
export const update = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { id } = request.params;
        let userId = request.auth.credentials.userData.id;
        let { name, description } = request.payload;
        let categorytype = await Models.CategoryType.findOne({
            where: { id: id, isRevision: false, revisionId: null! },
            include: [
                {
                    model: Models.CategoryTypeContent
                }
            ]
        });
        if (categorytype) {
            // Create revision of existing entity in DB
            let revisonObject = JSON.parse(JSON.stringify(categorytype))
            let revision = await storeRevision(revisonObject, transaction);
            let updateStamp = await Models.CategoryType.update({ lastUpdatedBy: userId }, { where: { id: categorytype.id }, transaction: transaction });
            let requestedLanguageId = await Models.Language.findOne({ where: { code: request.headers.language } })
            const existingContent = categorytype?.CategoryTypeContents?.find((content) => content.languageId == requestedLanguageId?.id);
            if (existingContent) {
                let updatedContent: CategoryTypeContentInterface = { name: '', description: '', descriptionText: '', languageId: existingContent!.languageId };
                updatedContent['name'] = name;
                updatedContent['description'] = description;
                updatedContent['descriptionText'] = await Common.convertHtmlToText(description)
                await Models.CategoryTypeContent.update(updatedContent, { where: { id: existingContent.id }, transaction: transaction });
            } else {
                let newContent: CategoryTypeContentInterface = { name: '', description: '', descriptionText: '', languageId: existingContent!.languageId };
                newContent.name = name;
                newContent.description = description;
                newContent.categorytypeId = categorytype.id;
                newContent.descriptionText = await Common.convertHtmlToText(description);
                newContent.languageId = requestedLanguageId!.id;
                await Models.CategoryTypeContent.create(newContent, { transaction: transaction });
            }
            await transaction.commit();
            let responseObject = await fetch(id, request.headers.language);
            responseObject = JSON.parse(JSON.stringify(responseObject));
            return h.response({ message: request.i18n.__("CATEGORY_TYPE_HAS_BEEN_UPDATED_SUCCESSFULLY"), responseData: responseObject }).code(200)

        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'CATEGORY_TYPE_ID_NOT_FOUND', {});
        }
    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }

}

// Delete a category type by identifier
export const deleteCategoryType = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { id } = request.params;
        let categorytype = await fetch(id, request.headers.language);
        if (categorytype) {
            if (categorytype.userId) {
                let userId = request.auth.credentials.userData.id;
                let revisonObject = JSON.parse(JSON.stringify(categorytype))
                let revision = await storeRevision(revisonObject, transaction);
                if (revision) {
                    let updateStamp = await Models.CategoryType.update({ lastUpdatedBy: userId }, { where: { id: categorytype.id }, transaction: transaction });
                    let removeCategory = await categorytype.destroy({ transaction: transaction });
                    await transaction.commit();
                    return h.response({ message: request.i18n.__("CATEGORY_TYPE_HAS_BEEN_DELETED_SUCCESSFULLY"), responseData: JSON.parse(JSON.stringify(categorytype)) }).code(200);
                } else {
                    await transaction.rollback();
                    return Common.generateError(request, 400, 'ERROR_WHILE_UPDATING_THE_REVISION', {});
                }
            } else {
                await transaction.rollback();
                return Common.generateError(request, 400, 'DEFAULT_CATEGORY_TYPES_CANNOT_BE_DELETED', {});
            }
        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'CATEGORY_TYPE_ID_NOT_FOUND', {});
        }

    } catch (err) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// Get all active category types
export const getAll = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let categorytypes = await Models.CategoryType.findAll({
            attributes: attributes,
            where: {
                status: Constants.STATUS.ACTIVE,
                isRevision: false
            },
            include: [
                {
                    attributes: [],
                    model: Models.CategoryTypeContent, as: 'content',
                    include: [
                        { attributes: [], model: Models.Language, where: { code: request.headers.language } }
                    ]
                },
                {
                    attributes: [],
                    model: Models.CategoryTypeContent, as: 'defaultContent',
                    include: [
                        { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                    ]
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
        })
        return h.response({ message: request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"), responseData: JSON.parse(JSON.stringify(categorytypes)) }).code(200)
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// List category types with pagination 
export const list = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let { perPage, page, searchText } = request.query;
        perPage = +process.env.PAGINATION_LIMIT! < perPage ? +process.env.PAGINATION_LIMIT! : perPage
        let offset = (page - 1) * perPage;

        let where: WhereOptions = { isRevision: false };
        if(searchText) {
            where = { ...where, [Op.or]: [
                sequelize.literal('MATCH(`defaultContent`.name) AGAINST(:searchText IN BOOLEAN MODE)'),
                sequelize.literal('MATCH(`content`.name) AGAINST(:searchText IN BOOLEAN MODE)'),
              ] }
        }

        let categorytypes = await Models.CategoryType.findAndCountAll({
            attributes: attributes,
            include: [
                {
                    attributes: [],
                    model: Models.CategoryTypeContent, as: 'content',
                    include: [
                        { attributes: [], model: Models.Language, where: { code: request.headers.language } }
                    ]
                },
                {
                    attributes: [],
                    model: Models.CategoryTypeContent, as: 'defaultContent',
                    include: [
                        { attributes: [], model: Models.Language, where: { code: process.env.DEFAULT_LANGUAGE_CODE } }
                    ]
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

            ],
            order: [['id', 'desc']],
            where: where,
            offset: offset,
            limit: perPage,
            distinct: true,
            subQuery: false,
            replacements: { searchText }

        });
        const count = categorytypes.count;
        let totalPages = await Common.getTotalPages(count, perPage);
        let rows = JSON.parse(JSON.stringify(categorytypes.rows));
        return h.response({
            message: request.i18n.__("CATEGORY_TYPE_LIST_REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData: {
                data: rows,
                perPage: perPage,
                page: page,
                totalPages: totalPages,
                totalRecords:count,
            }
        }).code(200)
    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}

// update status of category type
export const updateStatus = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { id } = request.params;
        let userId = request.auth.credentials.userData.id;
        let { status } = request.payload;
        let categorytype = await Models.CategoryType.findOne({
            where: { id: id, isRevision: false, revisionId: null as unknown as number },
            include: [
                {
                    model: Models.CategoryTypeContent
                }
            ]
        });
        if (categorytype) {
            // Create revision of existing entity in DB
            let revisonObject = JSON.parse(JSON.stringify(categorytype))
            let revision = await storeRevision(revisonObject, transaction);
            let updateStamp = await Models.CategoryType.update({ lastUpdatedBy: userId, status: status }, { where: { id: categorytype.id }, transaction: transaction });
            await transaction.commit();
            let responseObject = await fetch(id, request.headers.language);
            responseObject = JSON.parse(JSON.stringify(responseObject));
            return h.response({ message: request.i18n.__("CATEGORY_TYPE_HAS_BEEN_UPDATED_SUCCESSFULLY"), responseData: responseObject }).code(200)

        } else {
            await transaction.rollback();
            return Common.generateError(request, 400, 'CATEGORY_TYPE_ID_NOT_FOUND', {});
        }

    } catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}