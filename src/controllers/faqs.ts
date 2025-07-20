import * as Hapi from "@hapi/hapi";
import { Models, sequelize } from "../models";
import { Sequelize, Op } from "../config/dbImporter";
import * as Common from "./common";
import Moment from "moment";
import * as Constants from "../constants";
import { Literal, Fn } from "sequelize/types/utils";
import { FaqInterface } from "../config/interfaces/faqs";
import { _ } from "../config/routeImporter";
import { WhereOptions } from "sequelize";

type AttributeElement = string | [Literal, string] | [Fn, string];

const attributes: AttributeElement[] = [
    'id','status','isRevision','revisionId','createdAt','updatedAt','categoryId',
    [sequelize.literal('(case when `content`.question is not null then `content`.question else `defaultContent`.question END)'), 'question'],
    [sequelize.literal('(case when `content`.answer is not null then `content`.answer else `defaultContent`.answer END)'), 'answer'],
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

const categoryAttributes: AttributeElement[] = [
    'id','code',
    [sequelize.literal('(case when `category->content`.name is not null then `category->content`.name else `category->defaultContent`.name END)'), 'name'],
];

const createSearchIndex = async(id: number) => {
    let searchString = "";
    const faqInfo = await Models.Faq.findOne({ where: { id: id } });
    if(faqInfo) {

        const content = await Models.FaqContent.findAll({ where: { faqId: id } });

        for(let item of JSON.parse(JSON.stringify(content))) {
            searchString += item.question + " ";
            searchString += item.answer + " ";
        }

        if(searchString && searchString !== "") {
            await faqInfo.update({ searchIndex: searchString });
        }

        return true;
    }

    return false;
}

// Fetch a category by identifier
const storeRevision=async(Object: FaqInterface,transaction: Sequelize.Transaction)=>{
    try{
        let revisonObject=JSON.parse(JSON.stringify(Object));
        let revisionId=revisonObject.id;
        revisonObject = _.omit(revisonObject,['id']);
        revisonObject.isRevision=true;
        revisonObject.code=revisonObject.code+'-'+Moment().toISOString();
        revisonObject.revisionId=revisionId;
        for(const key in revisonObject.FaqContents){
            revisonObject.FaqContents[key] = _.omit(revisonObject.FaqContents[key],['id','faqId'])
        }
        let revision = await Models.Faq.create(revisonObject,{include:[{model:Models.FaqContent}],transaction:transaction});
        if(revision)
            return revision;
        else 
            return false;
    }catch(err){
        return false;
    }
}

// fetch category details by id
const fetch=async(id: number,accountId: number,language: string)=>{
    let faq= await Models.Faq.findOne({
        attributes:attributes,
        include:[
            {
                attributes:[],
                model:Models.FaqContent,as:'content',
                include:[
                    {attributes:[],model:Models.Language, where:{code:language}}
                ]
            },
            {
                attributes:[],
                model:Models.FaqContent,as:'defaultContent',
                include:[
                    {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUAGE_CODE}}
                ]
            },
            {
                attributes:categoryAttributes,
                model:Models.Category,
                as:'category',
                include:[
                    {
                        attributes:[],
                        model:Models.CategoryContent,as:'content',
                        include:[
                            {attributes:[],model:Models.Language, where:{code:language}}
                        ]
                    },
                    {
                        attributes:[],
                        model:Models.CategoryContent,as:'defaultContent',
                        include:[
                            {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUAGE_CODE}}
                        ]
                    }
                ] 
            },
            {
                model:Models.User,
                as:'updatedBy',
                attributes:updatedByAttributes,
                include:[
                    {
                        model:Models.UserProfile,
                        as: "userProfile",
                        attributes:[],
                        include:[{model:Models.Attachment,as:'profileAttachment',attributes:[]}]
                    }
                ]
            },
            {
                model:Models.User,
                as:'author',
                attributes:authorAttributes,
                include:[
                    {
                        model:Models.UserProfile,
                        as: "userProfile",
                        attributes:[],
                        include:[{model:Models.Attachment,as:'profileAttachment',attributes:[]}]
                    }
                ]
            }
        ],
        where:{id:id},
        // where:{id:id,accountId:accountId},
        subQuery:false,
    });
    return faq;
}

export const create=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {question,answer,categoryId}=request.payload;
        let defaultLanguage=await Models.Language.findOne({where:{'code':process.env.DEFAULT_LANGUAGE_CODE}});
        let language = request.headers.language;
        let questionText=await Common.convertHtmlToText(question);
        let answerText=await Common.convertHtmlToText(answer);
        let FaqContents=[];
        let defaultLanguageObject;
        let requestedLanguageObject;

        if(categoryId !== null) {
            const categoryInfo = await Models.Category.findOne({ where: { id: categoryId } });
            if(!categoryInfo) {
                await transaction.rollback();
                return Common.generateError(request,400,'INVALID_CATEGORY_ID_PROVIDED',{});
            }
        }

        if(language!=process.env.DEFAULT_LANGUAGE_CODE){
            // create content in default language as user language is not default
            let requestedLanguage=await Models.Language.findOne({where:{'code':request.header.language}});
            if(defaultLanguage && requestedLanguage){
                //create category in default in requested language
                defaultLanguageObject={
                    question:question,
                    answer:answer,
                    questionText:questionText,
                    answerText:answerText,
                    languageId:defaultLanguage.id
                };
                requestedLanguageObject={
                    question:question,
                    answer:answer,
                    questionText:questionText,
                    answerText:answerText,
                    languageId:requestedLanguage.id
                }
                FaqContents.push(defaultLanguageObject,requestedLanguageObject)
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_FETCHING_REQUIRED_LANGUAGE_FOR_CONTENT_CREATION',{});
            }
        }else{
            defaultLanguageObject={
                question:question,
                answer:answer,
                questionText:questionText,
                answerText:answerText,
                languageId:defaultLanguage!.id
            }
            FaqContents.push(defaultLanguageObject) 
        }
        let faq = await Models.Faq.create({
                userId:userId,
                accountId:accountId,
                lastUpdatedBy:null,
                FaqContents:FaqContents,
                categoryId: categoryId
            },{
                include:[
                    {model:Models.FaqContent}
                ],
                transaction:transaction
            }
        );
        if(faq){
            await Models.Faq.update({sortOrder:faq.id},{where:{id:faq.id},transaction:transaction});
            await transaction.commit();
            await createSearchIndex(faq.id!);
            let returnObject=await fetch(faq.id!,accountId,request.headers.language);
            
            returnObject = JSON.parse(JSON.stringify(returnObject));
            return h.response({message:request.i18n.__("FAQ_CREATED_SUCCESSFULLY"),responseData:returnObject}).code(200)
        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'ERROR_WHILE_CREATING_THE_FAQ',{});
        }
    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// get a faq type by id
export const get=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let {id}=request.params
        let accountId = request.auth.credentials.userData.accountId;
        let faq = await fetch(id,accountId,request.headers.language);
        if(faq){
            return h.response({message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),responseData:JSON.parse(JSON.stringify(faq))}).code(200)
        }else{
            return Common.generateError(request,400,'FAQ_NOT_FOUND',{});
        }
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// update a faq 
export const update=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let {id}=request.params;
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {question,answer, categoryId}=request.payload;
        let questionText=await Common.convertHtmlToText(question);
        let answerText=await Common.convertHtmlToText(answer);
        let faq = await Models.Faq.findOne({
            where:{id:id,isRevision:false,revisionId:null},
            include:[
                {
                    model:Models.FaqContent
                }
            ]
        });
        if(faq){

            if(categoryId !== null) {
                const categoryInfo = await Models.Category.findOne({ where: { id: categoryId } });
                if(!categoryInfo) {
                    await transaction.rollback();
                    return Common.generateError(request,400,'INVALID_CATEGORY_ID_PROVIDED',{});
                }
            }


            // Create revision of existing entity in DB
            let revisonObject = JSON.parse(JSON.stringify(faq))
            let revision = await storeRevision(revisonObject,transaction);
            let updateStamp = await Models.Faq.update({lastUpdatedBy:userId, categoryId},{where:{id:faq.id},transaction:transaction});
            let requestedLanguageId = await Models.Language.findOne({where:{code:request.headers.language}})
            const existingContent = faq.FaqContents!.find((content) => content.languageId == requestedLanguageId?.id);
            if(existingContent){
                let updatedContent: any = {};
                updatedContent['question']=question;
                updatedContent['answer']=answer;
                updatedContent['questionText']=questionText;
                updatedContent['answerText']=answerText;
                await Models.FaqContent.update(updatedContent,{where:{id:existingContent.id},transaction:transaction});
            }else{
                let newContent: any = {};
                newContent.question=question;
                newContent.questionText=questionText;
                newContent.answer=answer;
                newContent.answerText=answerText;
                newContent.faqId=faq.id;
                newContent.languageId=requestedLanguageId?.id;
                await Models.FaqContent.create(newContent,{transaction:transaction});
            }
            await transaction.commit()
            await createSearchIndex(id);
            let responseObject = await fetch(id,accountId,request.headers.language);
            responseObject = JSON.parse(JSON.stringify(responseObject));
            return h.response({message:request.i18n.__("FAQ_HAS_BEEN_UPDATED_SUCCESSFULLY"),responseData:responseObject}).code(200)

        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'FAQ_NOT_FOUND',{});
        }
    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

export const deleteFaq=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let {id}=request.params;
        let accountId = request.auth.credentials.userData.accountId;
        let faq = await Models.Faq.findOne({
            where:{id:id,isRevision:false,revisionId:null},
            include:[{model:Models.FaqContent}]
        });
        if(faq){
            let userId = request.auth.credentials.userData.id;
            let revisonObject = JSON.parse(JSON.stringify(faq))
            let revision = await storeRevision(revisonObject,transaction);
            if(revision){
                let faqResponseObject = await fetch(id,accountId,request.headers.language);
                faqResponseObject = JSON.parse(JSON.stringify(faqResponseObject));
                await faq.update({lastUpdatedBy:userId});
                await faq.destroy({transaction:transaction});
                await transaction.commit();
                return h.response({message:request.i18n.__("FAQ_HAS_BEEN_DELETED_SUCCESSFULLY"),responseData:JSON.parse(JSON.stringify(faqResponseObject))}).code(200);
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_CREATING_REVISION',{});
            }
        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'FAQ_NOT_FOUND',{});
        }
    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// List faq with pagination  

export const list=async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let {perPage,page,searchText,categoryId} = request.query;
        perPage = +process.env.PAGINATION_LIMIT!<perPage?+process.env.PAGINATION_LIMIT!:perPage
        let offset = (page - 1) * perPage;
        let language = request.headers.language;

        let where: WhereOptions = {isRevision:false}
        if(categoryId !== null) [
            where = { ...where, categoryId: categoryId }
        ]

        let faqs = await Models.Faq.findAndCountAll({
            attributes:attributes,
            include:[
                {
                    attributes:[],
                    model:Models.FaqContent,as:'content',
                    include:[
                        {attributes:[],model:Models.Language, where:{code:language}}
                    ]
                },
                {
                    attributes:[],
                    model:Models.FaqContent,as:'defaultContent',
                    include:[
                        {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUAGE_CODE}}
                    ]
                },
                {
                    attributes:categoryAttributes,
                    model:Models.Category,
                    as:'category',
                    include:[
                        {
                            attributes:[],
                            model:Models.CategoryContent,as:'content',
                            include:[
                                {attributes:[],model:Models.Language, where:{code:request.headers.language}}
                            ]
                        },
                        {
                            attributes:[],
                            model:Models.CategoryContent,as:'defaultContent',
                            include:[
                                {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUAGE_CODE}}
                            ]
                        }
                    ] 
                },
                {
                    model:Models.User,
                    as:'updatedBy',
                    attributes:updatedByAttributes,
                    include:[
                        {
                            model:Models.UserProfile,
                            attributes:[],
                            as: "userProfile",
                            include:[{model:Models.Attachment,as:'profileAttachment',attributes:[]}]
                        }
                    ]
                },
                {
                    model:Models.User,
                    as:'author',
                    attributes:authorAttributes,
                    include:[
                        {
                            model:Models.UserProfile,
                            attributes:[],
                            as: "userProfile",
                            include:[{model:Models.Attachment,as:'profileAttachment',attributes:[]}]
                        }
                    ]
                }
            ],
            order:[['sortOrder','ASC']],
            where:where,
            offset:offset,
            limit: perPage,
            subQuery:false

        });
        const count = faqs.count;
        let totalPages = await Common.getTotalPages(count,perPage);
        let rows = JSON.parse(JSON.stringify(faqs.rows));

        return h.response({
            message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData:{
                data:rows,
                perPage:perPage,
                page:page,
                totalPages:totalPages,
                totalRecords:count,
            }
        }).code(200)
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

export const publicList=async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let {perPage,page,searchText,categoryId} = request.query;
        perPage = +process.env.PAGINATION_LIMIT!<perPage?+process.env.PAGINATION_LIMIT!:perPage
        let offset = (page - 1) * perPage;
        let language = request.headers.language;

        let where: WhereOptions = {isRevision:false, status: Constants.STATUS.ACTIVE}
        if(categoryId !== null) [
            where = { ...where, categoryId: categoryId }
        ]

        if(searchText) {
            searchText = searchText.replace('@','*');
            searchText = searchText.replace(' ','*')+'*';
            where = { ...where, [Op.or]: [
                sequelize.literal('MATCH(`Faq`.search_index) AGAINST(:searchText IN BOOLEAN MODE)'),
            ] }
        }

        let faqs = await Models.Faq.findAndCountAll({
            attributes:attributes,
            include:[
                {
                    attributes:[],
                    model:Models.FaqContent,as:'content',
                    include:[
                        {attributes:[],model:Models.Language, where:{code:language}}
                    ]
                },
                {
                    attributes:[],
                    model:Models.FaqContent,as:'defaultContent',
                    include:[
                        {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUAGE_CODE}}
                    ]
                },
                {
                    attributes:categoryAttributes,
                    model:Models.Category,
                    as:'category',
                    include:[
                        {
                            attributes:[],
                            model:Models.CategoryContent,as:'content',
                            include:[
                                {attributes:[],model:Models.Language, where:{code:request.headers.language}}
                            ]
                        },
                        {
                            attributes:[],
                            model:Models.CategoryContent,as:'defaultContent',
                            include:[
                                {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUAGE_CODE}}
                            ]
                        }
                    ] 
                },
                {
                    model:Models.User,
                    as:'updatedBy',
                    attributes:updatedByAttributes,
                    include:[
                        {
                            model:Models.UserProfile,
                            attributes:[],
                            as: "userProfile",
                            include:[{model:Models.Attachment,as:'profileAttachment',attributes:[]}]
                        }
                    ]
                },
                {
                    model:Models.User,
                    as:'author',
                    attributes:authorAttributes,
                    include:[
                        {
                            model:Models.UserProfile,
                            attributes:[],
                            as: "userProfile",
                            include:[{model:Models.Attachment,as:'profileAttachment',attributes:[]}]
                        }
                    ]
                }
            ],
            order:[['sortOrder','ASC']],
            where:where,
            offset:offset,
            limit: perPage,
            subQuery:false,
            replacements: {searchText},
        });
        const count = faqs.count;
        let totalPages = await Common.getTotalPages(count,perPage);
        let rows = JSON.parse(JSON.stringify(faqs.rows));

        return h.response({
            message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData:{
                data:rows,
                perPage:perPage,
                page:page,
                totalPages:totalPages,
                totalRecords:count,
            }
        }).code(200)
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

export const setOrder=async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {id}=request.params;
        let {sortOrder}=request.payload;
        let faq = await Models.Faq.findOne({where:{id:id}});
        if(faq){
            let currentOrderValue=faq.sortOrder;
            if(sortOrder<=currentOrderValue!){
                await Models.Faq.increment('sortOrder',{by:1,where:{[Op.and]:[{sortOrder:{[Op.gte]:sortOrder}},{sortOrder:{[Op.lt]:currentOrderValue}}]},transaction:transaction});
                await Models.Faq.update({sortOrder:sortOrder},{where:{id:id},transaction:transaction})
            }else if(sortOrder>currentOrderValue!){
                await Models.Faq.decrement('sortOrder',{by:1,where:{[Op.and]:[{sortOrder:{[Op.gt]:currentOrderValue}},{sortOrder:{[Op.lte]:sortOrder}}]},transaction:transaction});
                await Models.Faq.update({sortOrder:sortOrder},{where:{id:id},transaction:transaction})
            }
            await transaction.commit();
            return h.response({message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY")}).code(200);
        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'FAQ_NOT_FOUND',{});
        }
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// update status of category
export const updateStatus=async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let {id}=request.params;
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {status}=request.payload;
        let faq = await Models.Faq.findOne({
            where:{id:id,isRevision:false,revisionId:null},
            include:[
                {
                    model:Models.FaqContent
                }
            ]
        });
        if(faq){
            // Create revision of existing entity in DB
            let revisonObject = JSON.parse(JSON.stringify(faq))
            let revision = await storeRevision(revisonObject,transaction);
            if(revision){
                await Models.Faq.update({lastUpdatedBy:userId,status:status},{where:{id:faq.id},transaction:transaction});
                await transaction.commit();
                let responseObject = await fetch(id,accountId,request.headers.language);
                responseObject = JSON.parse(JSON.stringify(responseObject));
                return h.response({message:request.i18n.__("FAQ_STATUS_HAS_BEEN_UPDATED_SUCCESSFULLY"),responseData:responseObject}).code(200)
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_CREATING_THE_REVISION',{});
            }

        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'FAQ_NOT_FOUND',{});
        }

    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

export const listAll=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let language = request.headers.language;

        let where: WhereOptions = {status:Constants.STATUS.ACTIVE,isRevision:false}
        if(request.query.categoryId !== null) [
            where = { ...where, categoryId: request.query.categoryId }
        ]

        let faqs = await Models.Faq.findAll({
            attributes:attributes,
            include:[
                {
                    attributes:[],
                    model:Models.FaqContent,as:'content',
                    include:[
                        {attributes:[],model:Models.Language, where:{code:language}}
                    ]
                },
                {
                    attributes:[],
                    model:Models.FaqContent,as:'defaultContent',
                    include:[
                        {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUAGE_CODE}}
                    ]
                 },
                {
                    model:Models.User,
                    as:'updatedBy',
                    attributes:updatedByAttributes,
                    include:[
                        {
                            model:Models.UserProfile,
                            attributes:[],
                            as: "userProfile",
                            include:[{model:Models.Attachment,as:'profileAttachment',attributes:[]}]
                        }
                    ]
                },
                {
                    model:Models.User,
                    as:'author',
                    attributes:authorAttributes,
                    include:[
                        {
                            model:Models.UserProfile,
                            attributes:[],
                            as: "userProfile",
                            include:[{model:Models.Attachment,as:'profileAttachment',attributes:[]}]
                        }
                    ]
                }
            ],
            where:where,
            order:[['sortOrder','ASC']]
        });
        let responseObject = JSON.parse(JSON.stringify(faqs));
        return h.response({
            message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData:responseObject
        }).code(200)
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}