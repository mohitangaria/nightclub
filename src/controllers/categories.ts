import  {Models, sequelize} from "../models";
import * as Common from './common';
import * as Constants from '../constants';
import Moment from "moment";
import _ from "lodash";
import { Sequelize, Op } from "../config/dbImporter";
import requestIp from 'request-ip';
import * as Hapi from "@hapi/hapi";
import { Literal,Fn } from "sequelize/types/utils";
import { CategoryInterface,CategoryContentInterface } from "../config/interfaces";
import { string } from "joi";
import { NumBatchResults } from "aws-sdk/clients/personalize";
import CategoryContent from "../models/CategoryContent";

type AttributeElement = string | [Literal, string] | [Fn,string] ;
// Define all query attributes

const hirarchyAttributes: AttributeElement[] = [
    'id','code','parentId',
    [sequelize.literal('(case when `content`.name is not null then `content`.name else `defaultContent`.name END)'), 'name']
];

const mydirectoryattributes: AttributeElement[] = [
    'id',
    [sequelize.literal('(case when `content`.name is not null then `content`.name else `defaultContent`.name END)'), 'name'],
];

const attributes: AttributeElement[] = [
    'id','code','status','isRevision','revisionId','createdAt','updatedAt','level',
    [sequelize.literal('(case when `content`.name is not null then `content`.name else `defaultContent`.name END)'), 'name'],
];

const categoryImageAttributes: AttributeElement[] = [
    "id", 
    [sequelize.fn('CONCAT',process.env.PROTOCOL,'://',process.env.HOST_SERVER,"/attachment/",sequelize.literal('`categoryImage`.`unique_name`')), 'filePath']
]

const parentAttributes: AttributeElement[] = [
    'id','code',
    [sequelize.literal('(case when `parent->content`.name is not null then `parent->content`.name else `parent->defaultContent`.name END)'), 'name'],
];

const categoryParentImageAttributes: AttributeElement[] = [
    "id",
     [sequelize.fn('CONCAT',process.env.PROTOCOL,'://',process.env.HOST_SERVER,"/attachment/",sequelize.literal('`parent->categoryImage`.`unique_name`')), 'filePath']
]


const categoryTypeAttributes: AttributeElement[] = [
    'id','code',
    [sequelize.literal('(case when `categorytype->content`.name is not null then `categorytype->content`.name else `categorytype->defaultContent`.name END)'), 'name']
];


const authorAttributes: AttributeElement[] = [
    'id',
    [sequelize.literal('`author->UserProfile`.`name`'), 'name'],
    [sequelize.literal('`author->UserProfile->profileImage`.`unique_name`'), 'profileImage']
];

const updatedByAttributes: AttributeElement[] = [
    'id',
    [sequelize.literal('`updatedBy->UserProfile`.`name`'), 'name'],
    [sequelize.literal('`updatedBy->UserProfile->profileImage`.`unique_name`'), 'profileImage']
];


// get all parents
const getParentHirarchy = async(parentId:Number,language:String,userId:Number,accountId:Number): Promise<any> =>{
    try{
        let parentHirarchy=[];
        let parent = await Models.Category.findOne({
            attributes:hirarchyAttributes,
            where: { id: parentId as number },
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
                        {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUANGE_CODE}}
                    ]
                }
            ]
        });
        let object = JSON.parse(JSON.stringify(parent))
        if(object.parentId){
            parentHirarchy.push(object);
            let parentCategory = await getParentHirarchy(object.parentId,language,null as unknown as Number, null as unknown as number, );
            parentHirarchy = parentCategory.concat(parentHirarchy);
            return parentHirarchy;
        }else{
            parentHirarchy.push(object)
            return parentHirarchy;
        }
    }catch(err){
        console.log(err);
        return [];
    }
}
// Fetch a category by identifier
const storeRevision=async(Object:CategoryInterface,transaction: Sequelize.Transaction)=>{
    try{
        let revisonObject=JSON.parse(JSON.stringify(Object));
        let revisionId=revisonObject.id;
        revisonObject = _.omit(revisonObject,['id']);
        revisonObject.isRevision=true;
        revisonObject.code=revisonObject.code+'-'+Moment().toISOString();
        revisonObject.revisionId=revisionId;
        for(const key in revisonObject.CategoryContents){
            revisonObject.CategoryContents[key] = _.omit(revisonObject.CategoryContents[key],['id','categoryId'])
        }
        let revision = await Models.Category.create(revisonObject,{include:[{model:Models.CategoryContent}],transaction:transaction});
        if(revision)
            return revision;
        else 
            return false;
    }catch(err){
        console.log(err);
        return false;
    }
}

// fetch category details by id
const fetch=async(id:number,accountId:number,language:string)=>{
    let category= await Models.Category.findOne({
        attributes:attributes,
        include:[
            {
                attributes:categoryImageAttributes,
                model:Models.Attachment,
                as:"categoryImage"
            },
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
                    {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUANGE_CODE}}
                ]
             },
            {
                attributes:parentAttributes,
                model:Models.Category,
                as:'parent',
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
                            {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUANGE_CODE}}
                        ]
                    }
                ]  
            },
            {
                attributes:categoryTypeAttributes,
                model:Models.CategoryType,
                as:'categorytype',
                include:[
                    {
                        attributes:[],
                        model:Models.CategoryTypeContent,as:'content',
                        include:[
                            {attributes:[],model:Models.Language, where:{code:language}}
                        ]
                    },
                    {
                        attributes:[],
                        model:Models.CategoryTypeContent,as:'defaultContent',
                        include:[
                            {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUANGE_CODE}}
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
                        include:[{model:Models.Attachment,as:'profileImage',attributes:[]}]
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
                        include:[{model:Models.Attachment,as:'profileImage',attributes:[]}]
                    }
                ]
            }
        ],
        where:{id:id,accountId:accountId},
        subQuery:false,
    });
    return category;
}

// get order sequence of a category
const getOrderSequence=async (Id:number,transaction:Sequelize.Transaction)=>{
    let orderSequence='';
    let categoryId = Id;
    let categoryCode = '';
    try{
        let loopcounter=0;
        let category;
        orderSequence='';
        while(categoryId!=null){
            if(loopcounter!=0)
                orderSequence=orderSequence!=''?categoryCode+'|'+orderSequence:categoryCode;
            category = await Models.Category.findOne({attributes:['parentId','code'],where:{id:categoryId},transaction:transaction});
            categoryCode=category?.code!;
            categoryId = category?.parentId!;
            loopcounter+=1;
        }
        if(orderSequence!='')
            orderSequence=category?.code+"|"+orderSequence;
        else    
            orderSequence=category?.code!;
        return orderSequence;
    }catch(err){
        return orderSequence;
    }
}

const ifChildIsParent=async(categoryId:number,parentId:number)=>{
    try{
        let children = await Models.Category.findAll({attributes:['id'],where:{parentId:categoryId}});
        const isParentPresent = children.find((child) => child.id === parentId);
        if(isParentPresent){
            return true;
        }else{
            for(let child of children){
                let levelHasParent=await ifChildIsParent(child.id!,parentId);
                if(levelHasParent)
                    return true;
            }
            return false;
        }
    }catch(err){
        return true;
    }

}

export const create=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {name,parentId,categorytypeCode,imageId}=request.payload;
        let categorytypeDetails= await Models.CategoryType.findOne({where:{code:categorytypeCode}});
        if(!categorytypeDetails){
            await transaction.rollback();
            return Common.generateError(request,400,'VALID_CATEGORY_TYPE_IS_REQUIRED',{});
        }
        let categorytypeId = categorytypeDetails?.id;
        let slug = await Common.slugify(name);
        let scannedSlug=slug;
        if(categorytypeCode=='directory'){
            slug = userId+"_"+slug;
        }
        let CategoryContents:CategoryContentInterface[]=[];
        if(parentId){
            let parentCategory = await Models.Category.findOne({where:{id:parentId}});
            if(!parentCategory){
                await transaction.rollback();
                return Common.generateError(request,400,categorytypeCode=='directory'?'PARENT_DIRECTORY_DOES_NOT_EXISTS':'PARENT_CATEGORY_DOES_NOT_EXISTS',{});
            }else if(parentCategory && parentCategory.categorytypeId!=categorytypeId){
                await transaction.rollback();
                return Common.generateError(request,400,categorytypeCode=='directory'?'PARENT_AND_CHILD_TYPE_DOES_NOT_MATCH':'PARENT_AND_CHILD_CATEGORY_TYPE_DOES_NOT_MATCH',{});
            }
        }
        let categoryWhere={categorytypeId:categorytypeId,parentId:parentId};
        if(process.env.SAAS_ENABLED){
            categoryWhere=_.assign(categoryWhere,{accountId:accountId});
            categoryWhere={...categoryWhere,...{[Op.or]:[
                {userId:null,code:scannedSlug},
                {userId:userId,code:slug}
            ]}}
        }else{
            categoryWhere=_.assign(categoryWhere,{userId:userId})
            categoryWhere={...categoryWhere,...{[Op.or]:[
                {userId:null,code:scannedSlug},
                {userId:userId,code:slug}
            ]}}
        }
        let existingCase = await Models.Category.findOne({where:categoryWhere});
        let defaultLanguage=await Models.Language.findOne({where:{'code':process.env.DEFAULT_LANGUANGE_CODE}});
        let language = request.headers.language;
        let defaultLanguageObject:CategoryContentInterface;
        let requestedLanguageObject:CategoryContentInterface;
        if(defaultLanguage){
        if(language!=process.env.DEFAULT_LANGUANGE_CODE){
            // create content in default language as user language is not default
            let requestedLanguage=await Models.Language.findOne({where:{'code':request.header.language}});
            
            if(defaultLanguage && requestedLanguage){
                //create category in default in requested language
                    defaultLanguageObject={
                    name:name,
                    languageId:defaultLanguage.id
                };
                   requestedLanguageObject={
                    name:name,
                    languageId:requestedLanguage.id
                }
                CategoryContents.push(defaultLanguageObject,requestedLanguageObject)
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_FETCHING_REQUIRED_LANGUAGE_FOR_CONTENT_CREATION',{});
            }
        }else{
            defaultLanguageObject={
                name:name,
                languageId:defaultLanguage?.id
            }
            CategoryContents.push(defaultLanguageObject) 
        }
        if(!existingCase){
            let category = await Models.Category.create({
                    code:slug,
                    parentId:parentId,
                    imageId:imageId,
                    userId:userId,
                    accountId:accountId,
                    lastUpdatedBy:null ,
                    categorytypeId:categorytypeId!,
                    CategoryContents:CategoryContents
                },{
                    include:[
                        {model:Models.CategoryContent}
                    ],
                    transaction:transaction
                }
            );
            if(category){
                let orderSequence=await getOrderSequence(category.id!,transaction);
                let level = orderSequence.split('|').length;
                await Models.Category.update({orderSequence:orderSequence ,level:level},{where:{id:category.id},transaction:transaction})
                await transaction.commit();
                let returnObject=await fetch(category.id!,accountId,request.headers.language);
                returnObject = JSON.parse(JSON.stringify(returnObject));
                return h.response({message:request.i18n.__(categorytypeCode=='directory'?"DIRECTORY_CREATED_SUCCESSFULLY":"CATEGORY_CREATED_SUCCESSFULLY"),responseData:returnObject}).code(200)
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_CREATING_THE_CATEGORY',{});
            }
        }else{
            await transaction.rollback();
            return Common.generateError(request,400,categorytypeCode=='directory'?'DIRECTORY_WITH_NAME_ALREADY_EXISTS':'CATEGORY_WITH_NAME_ALREADY_IN_USE',{});
        }
    }else{
        return Common.generateError(request, 400, 'DEFAULT_LANGUAGE_NOT_FOUND', {});
    }
    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// get a category type by id
export const get=async(request:Hapi.RequestQuery,h:Hapi.ResponseToolkit)=>{
    try{
        let {id}=request.params
        let accountId = request.auth.credentials.userData.accountId;
        let category = await fetch(id,accountId,request.headers.language);
        if(category){
            return h.response({message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),responseData:JSON.parse(JSON.stringify(category))}).code(200)
        }else{
            return Common.generateError(request,400,'CATEGORY_TYPE_DOES_NOT_EXISTS',{});
        }
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// update a category 
export const update=async(request:Hapi.RequestQuery,h:Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let {id}=request.params;
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {name,parentId,imageId,categorytypeCode}=request.payload;
        let slug = await Common.slugify(name);
        let scannedSlug=slug;
        if(categorytypeCode=='directory'){
            slug = userId+"_"+slug;
        }
        let categorytypeDetails= await Models.CategoryType.findOne({where:{code:categorytypeCode}});
        if(!categorytypeDetails){
            await transaction.rollback();
            return Common.generateError(request,400,'VALID_CATEGORY_TYPE_IS_REQUIRED',{});
        }
        let categorytypeId = categorytypeDetails.id;
        let category = await Models.Category.findOne({
            where:{id:id,isRevision:false,revisionId:null!},
            include:[
                {
                    model:Models.CategoryContent
                }
            ]
        });
        
        let categoryWhere={categorytypeId:categorytypeId,parentId:parentId,id:{[Op.ne]:id}};
        if(process.env.SAAS_ENABLED){
            categoryWhere=_.assign(categoryWhere,{accountId:accountId});
            categoryWhere={...categoryWhere,...{[Op.or]:[
                {userId:null,code:scannedSlug},
                {userId:userId,code:slug}
            ]}}
        }else{
            categoryWhere=_.assign(categoryWhere,{userId:userId})
            categoryWhere={...categoryWhere,...{[Op.or]:[
                {userId:null,code:scannedSlug},
                {userId:userId,code:slug}
            ]}}
        }
        let existingCase = await Models.Category.findOne({where:categoryWhere});
        if(category && !existingCase){
            // Create revision of existing entity in DB
            if(parentId){
                let parentIsChild = await ifChildIsParent(category.id!,parentId);
                if(parentIsChild){
                    return Common.generateError(request,400,'CHILD_CATEGOTY_CANNOT_BE_ASSIGNED_AS_PARENT}',{});
                }
            }
            
            let revisonObject = JSON.parse(JSON.stringify(category))
            let revision = await storeRevision(revisonObject,transaction);
            let updateStamp = await Models.Category.update({lastUpdatedBy:userId,parentId:parentId,imageId:imageId},{where:{id:category.id},transaction:transaction});
            let requestedLanguageId = await Models.Language.findOne({where:{code:request.headers.language}})
            let orderSequence=await getOrderSequence(category.id!,transaction);
            let level = orderSequence.split('_').length;
            let updateobj = { orderSequence: orderSequence, level: level } as {orderSequence: string, level: number, code: string}
            if (category.userId) {
                 updateobj = { ...updateobj, code: slug }
                   }     
            await Models.Category.update(updateobj,{where:{id:category.id},transaction:transaction});
            const existingContent = category.CategoryContents!.find((content) => content.languageId == requestedLanguageId!.id);
            if(existingContent){
                let updatedContent:CategoryContentInterface = {name:'', languageId:existingContent.languageId};
                updatedContent['name']=name;
                await Models.CategoryContent.update(updatedContent,{where:{id:existingContent.id},transaction:transaction});
            }else{
                let newContent:CategoryContentInterface = {name:'', languageId:existingContent!.languageId};
                newContent.name=name;
                newContent.categoryId=category.id;
                newContent.languageId!=requestedLanguageId?.id;
                await Models.CategoryContent.create(newContent,{transaction:transaction});
            }
            await transaction.commit()
            let responseObject = await fetch(id,accountId,request.headers.language);
            responseObject = JSON.parse(JSON.stringify(responseObject));
            return h.response({message:request.i18n.__("CATEGORY_HAS_BEEN_UPDATED_SUCCESSFULLY"),responseData:responseObject}).code(200)

        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'CATEGORY_ID_NOT_FOUND',{});
        }
    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

export const deleteCategory = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let {id}=request.params;
        let accountId = request.auth.credentials.userData.accountId;
        let category = await Models.Category.findOne({
            where:{id:id,isRevision:false,revisionId:null!},
            include:[
                {
                    model:Models.CategoryContent
                }
            ]
            
        });
        if(category){
            if(category.userId){
                let subFolders = await Models.Category.findOne({where:{parentId:category.id,isRevision:false}});
                let userId = request.auth.credentials.userData.id;
                let revisonObject = JSON.parse(JSON.stringify(category))
                let revision = await storeRevision(revisonObject,transaction);
                if(revision){
                    let catResponseObject = await fetch(id,accountId,request.headers.language);
                    catResponseObject = JSON.parse(JSON.stringify(catResponseObject));
                    await category.update({lastUpdatedBy:userId,code:category.code+'-'+Moment().toISOString()});
                    await category.destroy({transaction:transaction});
                    await transaction.commit();
                    return h.response({message:request.i18n.__("CATEGORY_HAS_BEEN_DELETED_SUCCESSFULLY"),responseData:JSON.parse(JSON.stringify(catResponseObject))}).code(200);
                }else{
                    await transaction.rollback();
                    return Common.generateError(request,400,'ERROR_WHILE_CREATING_REVISION',{});
                }
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'DEFAULT_CATEGORY_CANNOT_BE_DELETED',{});
            }
        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'CATEGORY_NOT_FOUND',{});
        }

    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

export const getCategories=async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let accountId=null;
        if(request.auth.isAuthenticated){
            accountId=request.auth.credentials.userData.accountId;
        }
        let {categoryTypeCode}=request.params;
        let categoryType=await Models.CategoryType.findOne({where:{code:categoryTypeCode}});
        if(categoryType){
            let categories = await Models.Category.findAll({
                attributes:attributes,
                where:{
                    status:Constants.STATUS.ACTIVE,
                    accountId:accountId,
                    categorytypeId:categoryType.id,
                    isRevision:false
                },
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
                            {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUANGE_CODE}}
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
                                include:[{model:Models.Attachment,as:'profileImage',attributes:[]}]
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
                                include:[{model:Models.Attachment,as:'profileImage',attributes:[]}]
                            }
                        ]
                    }
                ],
                order:[["orderSequence","ASC"],["code","ASC"]]
            })
            return h.response({message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),responseData:JSON.parse(JSON.stringify(categories))}).code(200)
        }else{
            return Common.generateError(request,400,'CATEGORY_NOT_FOUND',Error);
        }
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// List category with pagination 
export const  list=async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {perPage,page,parentId,type} = request.query;
        let categoryType=await Models.CategoryType.findOne({where:{code:type}});
        console.log(request.query);
        if(!categoryType){
            return Common.generateError(request,400,'CATEGORY_TYPE_DOES_NOT_EXISTS',{});
        }
        let hirarchy=[];
        if(parentId){
            hirarchy = await getParentHirarchy(parentId,request.headers.language,userId,accountId);
        }
        perPage = +process.env.PAGINATION_LIMIT!<perPage?+process.env.PAGINATION_LIMIT!:perPage
        let offset = (page - 1) * perPage;
        let where={isRevision:false,parentId:parentId,categorytypeId:categoryType.id}
        if(type=='directory'){
            where={...where,...{userId:null}}
        }
        let categories = await Models.Category.findAndCountAll({
            attributes:attributes,
            include:[
                {
                    attributes:categoryImageAttributes,
                    model:Models.Attachment,
                    as:"categoryImage"
                },
                {
                    attributes:parentAttributes,
                    model:Models.Category,
                    as:'parent',
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
                                {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUANGE_CODE}}
                            ]
                        }
                    ]  
                },
                {
                    attributes:categoryTypeAttributes,
                    model:Models.CategoryType,
                    as:'categorytype',
                    include:[
                        {
                            attributes:[],
                            model:Models.CategoryTypeContent,as:'content',
                            include:[
                                {attributes:[],model:Models.Language, where:{code:request.headers.language}}
                            ]
                        },
                        {
                            attributes:[],
                            model:Models.CategoryTypeContent,as:'defaultContent',
                            include:[
                                {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUANGE_CODE}}
                            ]
                        }
                    ]
                },
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
                        {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUANGE_CODE}}
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
                            include:[{model:Models.Attachment,as:'profileImage',attributes:[]}]
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
                            include:[{model:Models.Attachment,as:'profileImage',attributes:[]}]
                        }
                    ]
                }
                
            ],
            order:[['id','desc']],
            where:where,
            offset:offset,
            limit: perPage,
            distinct:true,
            subQuery:false

        });
        const count = categories.count;
        let totalPages = await Common.getTotalPages(count,perPage);
        let rows = JSON.parse(JSON.stringify(categories.rows));
        return h.response({
            message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData:{
                parentHirarchy:hirarchy,
                data:rows,
                perPage:perPage,
                page:page,
                totalPages:totalPages
            }
        }).code(200)
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// update status of category
export const  updateStatus=async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let {id}=request.params;
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {status}=request.payload;
        let category = await Models.Category.findOne({
            where:{id:id,isRevision:false,revisionId:null!},
            include:[
                {
                    model:Models.CategoryContent
                }
            ]
        });
        if(category){
            // Create revision of existing entity in DB
            let revisonObject = JSON.parse(JSON.stringify(category))
            let revision = await storeRevision(revisonObject,transaction);
            if(revision){
                await Models.Category.update({lastUpdatedBy:userId,status:status},{where:{id:category.id},transaction:transaction});
                await transaction.commit();
                let responseObject = await fetch(id,accountId,request.headers.language);
                responseObject = JSON.parse(JSON.stringify(responseObject));
                return h.response({message:request.i18n.__("CATEGORY_STATUS_HAS_BEEN_UPDATED_SUCCESSFULLY"),responseData:responseObject}).code(200)
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_CREATING_THE_REVISION',{});
            }

        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'CATEGORY_NOT_FOUND',{});
        }

    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

export const  myDirectories=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {categoryTypeCode}=request.params;
        let categoryType=await Models.CategoryType.findOne({where:{code:categoryTypeCode}});
        let myDirectories = await Models.Category.findAll({
            attributes:mydirectoryattributes,
            where:{
                status:Constants.STATUS.ACTIVE,
                accountId:accountId,
                categorytypeId:categoryType?.id,
                isRevision:false,
                [Op.or]:[
                    {userId:userId,accountId:accountId},
                    {userId:null,accountId:accountId}
                ]
            },
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
                        {attributes:[],model:Models.Language, where:{code:process.env.DEFAULT_LANGUANGE_CODE}}
                    ]
                }
            ],
            order:[["orderSequence","ASC"],["code","ASC"]]
        })
        return h.response({message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),responseData:JSON.parse(JSON.stringify(myDirectories))}).code(200)
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}