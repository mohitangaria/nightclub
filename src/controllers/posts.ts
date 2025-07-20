import * as Hapi from "@hapi/hapi";
import { Models, sequelize } from "../models";
import { Sequelize, Op } from "../config/dbImporter";
import * as Common from "./common";
import Moment from "moment";
import * as Constants from "../constants";
import * as _ from "lodash";
import { AttributeElement } from "../config/customTypes";
import { PostInterface } from "../config/interfaces/posts";

// Define all query attributes
const attributes: AttributeElement[] = [
    'id','slug','status','isRevision','revisionId','createdAt','updatedAt',
    [sequelize.literal('(case when `content`.title is not null then `content`.title else `defaultContent`.title END)'), 'title'],
    [sequelize.literal('(case when `content`.description is not null then `content`.description else `defaultContent`.description END)'), 'description'],
    [sequelize.literal('(case when `content`.excerpt is not null then `content`.excerpt else `defaultContent`.excerpt END)'), 'excerpt']
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

const mediaImageAttributes: AttributeElement[] = [
    [sequelize.literal('`postImage`.`file_id`'),'id'],[sequelize.fn('CONCAT',process.env.BASE_URL,"/attachment/",sequelize.literal('`postImage->Attachment`.`unique_name`')),'filePath']
]

const mediaVideoAttributes: AttributeElement[] = [
    [sequelize.literal('`postVideo`.`file_id`'),'id'],[sequelize.fn('CONCAT',process.env.BASE_URL,"/attachment/",sequelize.literal('`postVideo->Attachment`.`unique_name`')),'filePath']
]

const fetch=async(id: number,accountId: number,language: string)=>{
    let post= await Models.Post.findOne({
        attributes:attributes,
        include:[
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
                attributes:mediaImageAttributes,
                model:Models.PostMedia,
                as:'postImage',
                where:{type:'image'},
                required:false,
                include:[
                    {attributes:[],model:Models.Attachment},
                    {attributes:[],model:Models.Language, where:{code:language}}
                ] 
            },
            {
                attributes:mediaVideoAttributes,
                model:Models.PostMedia,
                as:'postVideo',
                where:{type:'video'},
                required:false,
                include:[
                    {attributes:[],model:Models.Attachment},
                    {attributes:[],model:Models.Language, where:{code:language}}
                ] 
            },
            {
                attributes:[],
                model:Models.PostContent,as:'content',
                include:[
                    {model:Models.Attachment,as:'postImage'},
                    {attributes:[],model:Models.Language, where:{code:language}}
                ]
            },
            {
                attributes:[],
                model:Models.PostContent,as:'defaultContent',
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
        where:{id:id,accountId:accountId},
        subQuery:false,
    });
    return post;
}

const fetchBySlug=async(slug: string,language: string)=>{
    let post= await Models.Post.findOne({
        attributes:attributes,
        include:[
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
                attributes:mediaImageAttributes,
                model:Models.PostMedia,
                as:'postImage',
                where:{type:'image'},
                required:false,
                include:[
                    {attributes:[],model:Models.Attachment},
                    {attributes:[],model:Models.Language, where:{code:language}}
                ] 
            },
            {
                attributes:mediaVideoAttributes,
                model:Models.PostMedia,
                as:'postVideo',
                where:{type:'video'},
                required:false,
                include:[
                    {attributes:[],model:Models.Attachment},
                    {attributes:[],model:Models.Language, where:{code:language}}
                ] 
            },
            {
                attributes:[],
                model:Models.PostContent,as:'content',
                include:[
                    {model:Models.Attachment,as:'postImage'},
                    {attributes:[],model:Models.Language, where:{code:language}}
                ]
            },
            {
                attributes:[],
                model:Models.PostContent,as:'defaultContent',
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
        where:{slug:slug},
        subQuery:false,
    });
    return post;
}

// Generate revision of category type prior to update and delete functions.
const storeRevision=async(Object: PostInterface,transaction: Sequelize.Transaction)=>{
    try{
        let revisonObject=JSON.parse(JSON.stringify(Object));
        let revisionId=revisonObject.id;
        revisonObject = _.omit(revisonObject,['id']);
        revisonObject.isRevision=true;
        revisonObject.slug=revisonObject.slug+'-'+Moment().toISOString();
        revisonObject.revisionId=revisionId;
        for(const key in revisonObject.PostContents){
            revisonObject.PostContents[key] = _.omit(revisonObject.PostContents[key],['id','postId'])
        }
        let revision = await Models.Post.create(revisonObject,{include:[{model:Models.PostContent}],transaction:transaction});
        if(revision)
            return revision;
        else 
            return false;
    }catch(err){
        return false;
    }
}

export const create=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {title,description,excerpt,imageId,videoId,categoryId,postType}=request.payload;
        let titleText = await Common.convertHtmlToText(title);
        let descriptionText = await Common.convertHtmlToText(description);
        let excerptText = await Common.convertHtmlToText(excerpt);
        let slug = await Common.slugify(titleText);
        let PostContents=[];
        let postMedias=[];
        let existingCase = await Models.Post.findOne({where:{slug:slug,categoryId:categoryId,accountId:accountId}});
        let defaultLanguage=await Models.Language.findOne({where:{'code':process.env.DEFAULT_LANGUAGE_CODE}});
        let language = request.headers.language;
        if(language!=process.env.DEFAULT_LANGUAGE_CODE){
            // create content in default language as user language is not default
            let requestedLanguage=await Models.Language.findOne({where:{'code':request.header.language}});
            if(defaultLanguage && requestedLanguage){
                //create category in default in requested language
                let defaultLanguageObject={
                    title:title,
                    titleText:titleText,
                    description:description,
                    descriptionText:descriptionText,
                    excerpt:excerpt,
                    excerptText:excerptText,
                    languageId:defaultLanguage.id
                };
                let defaultImageMediaObject={};
                let defaultVideoMediaObject={};
                let requestedImageMediaObject={};
                let requestedVideoMediaObject={};

                if(imageId){
                    defaultImageMediaObject={
                        languageId:defaultLanguage.id,
                        fileId:imageId,
                        type:'image',
                        isFeatured:true
                    }
                    requestedImageMediaObject = defaultImageMediaObject;
                    postMedias.push(defaultImageMediaObject,requestedImageMediaObject)
                }
                if(videoId){
                    defaultVideoMediaObject={
                        languageId:defaultLanguage.id,
                        fileId:videoId,
                        type:'video',
                        isFeatured:true
                    }
                    requestedVideoMediaObject = defaultVideoMediaObject;
                    postMedias.push(defaultVideoMediaObject,requestedVideoMediaObject)
                }
                let requestedLanguageObject={
                    title:title,
                    titleText:titleText,
                    description:description,
                    descriptionText:descriptionText,
                    excerpt:excerpt,
                    excerptText:excerptText,
                    imageId:imageId,
                    videoId:videoId,
                    languageId:requestedLanguage.id
                }
                PostContents.push(defaultLanguageObject,requestedLanguageObject)
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_FETCHING_REQUIRED_LANGUAGE_FOR_CONTENT_CREATION',{});
            }
        }else{
            let defaultImageMediaObject={};
            let defaultVideoMediaObject={};
            if(imageId){
                defaultImageMediaObject={
                    languageId:defaultLanguage!.id,
                    fileId:imageId,
                    type:'image',
                    isFeatured:true
                }
                postMedias.push(defaultImageMediaObject)
            }
            if(videoId){
                defaultVideoMediaObject={
                    languageId:defaultLanguage!.id,
                    fileId:videoId,
                    type:'video',
                    isFeatured:true
                }
                postMedias.push(defaultVideoMediaObject)
            }
            let defaultLanguageObject={
                title:title,
                titleText:titleText,
                description:description,
                descriptionText:descriptionText,
                excerpt:excerpt,
                excerptText:excerptText,
                imageId:imageId,
                videoId:videoId,
                languageId:defaultLanguage!.id
            }
            PostContents.push(defaultLanguageObject) 
        }
        if(!existingCase){
            let post = await Models.Post.create({
                    slug:slug,
                    categoryId:categoryId,
                    postType:postType,
                    userId:userId,
                    accountId:accountId,
                    lastUpdatedBy:null,
                    status:Constants.STATUS.ACTIVE,
                    PostContents:PostContents,
                    PostMedia:postMedias
                },{
                    include:[
                        {model:Models.PostContent},
                        {model:Models.PostMedia}
                    ],
                    transaction:transaction
                }
            );
            if(post){
                await transaction.commit();
                let returnObject=await fetch(post.id!,accountId,request.headers.language);
                returnObject = JSON.parse(JSON.stringify(returnObject));
                return h.response({message:request.i18n.__("POST_CREATED_SUCCESSFULLY"),responseData:returnObject}).code(200)
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_CREATING_THE_POST',{});
            }
        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'POST_WITH_TITLE_ALREADY_IN_USE',{});
        }
    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}


// get a post by id
export const get=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let {id}=request.params
        let accountId = request.auth.credentials.userData.accountId;
        let post = await fetch(id,accountId,request.headers.language);
        if(post){
            return h.response({message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),responseData:JSON.parse(JSON.stringify(post))}).code(200)
        }else{
            return Common.generateError(request,400,'POST_DOES_NOT_EXISTS',{});
        }
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// get a post by slug
export const getBySlug=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let {slug}=request.params
        
        let post = await fetchBySlug(slug,request.headers.language);
        if(post){
            return h.response({message:request.i18n.__("REQUEST_PROCESSED_SUCCESSFULLY"),responseData:JSON.parse(JSON.stringify(post))}).code(200)
        }else{
            return Common.generateError(request,400,'POST_DOES_NOT_EXISTS',{});
        }
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// update a Post 
export const update=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let {id}=request.params;
        let userId = request.auth.credentials.userData.id;
        let accountId = request.auth.credentials.userData.accountId;
        let {title,description,excerpt,imageId,videoId,categoryId,postType}=request.payload;
        let post = await Models.Post.findOne({
            where:{id:id,isRevision:false,revisionId:null},
            include:[
                {
                    model:Models.PostContent
                },
                {
                    model:Models.PostMedia
                }
            ]
        });
        if(post){
            let revisonObject = JSON.parse(JSON.stringify(post))
            let revision = await storeRevision(revisonObject,transaction);
            if(revision){
                let titleText = await Common.convertHtmlToText(title);
                let descriptionText = await Common.convertHtmlToText(description);
                let excerptText = await Common.convertHtmlToText(excerpt);
                await Models.Post.update({lastUpdatedBy:userId,categoryId:categoryId},{where:{id:post.id},transaction:transaction});
                let requestedLanguageId = await Models.Language.findOne({where:{code:request.headers.language}})
                const existingContent = post.PostContents!.find((content) => content.languageId == requestedLanguageId?.id);
                if(existingContent){
                    let updatedContent: any = {};
                    updatedContent['title']=title;
                    updatedContent['titleText']=titleText;
                    updatedContent['description']=description;
                    updatedContent['descriptionText']=descriptionText;
                    updatedContent['excerpt']=excerptText;
                    await Models.PostContent.update(updatedContent,{where:{id:existingContent.id},transaction:transaction});
                }else{
                    let newContent: any = {};
                    newContent.title=title;
                    newContent.titleText=titleText;
                    newContent.description=description;
                    newContent.descritpionText=descriptionText;
                    newContent.excerpt=excerpt;
                    newContent.excerptText=excerptText;
                    newContent.postId=post.id;
                    newContent.languageId=requestedLanguageId!.id;
                    await Models.PostContent.create(newContent,{transaction:transaction});
                }
                await Models.PostMedia.destroy({where:{postId:id},transaction:transaction})
                if(imageId){
                    await Models.PostMedia.create({languageId:requestedLanguageId!.id,fileId:imageId,postId:id,isFeatured:true,type:'image'},{transaction:transaction});
                }
                if(videoId){
                    await Models.PostMedia.create({languageId:requestedLanguageId!.id,fileId:videoId,postId:id,isFeatured:true,type:'video'},{transaction:transaction});
                }
                await transaction.commit()
                let responseObject = await fetch(id,accountId,request.headers.language);
                responseObject = JSON.parse(JSON.stringify(responseObject));
                return h.response({message:request.i18n.__("POST_HAS_BEEN_UPDATED_SUCCESSFULLY"),responseData:responseObject}).code(200)
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_CREATING_REVISION',{});
            }
        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'POST_NOT_FOUND',{});
        }
    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

export const deletePost=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let {id}=request.params;
        let accountId = request.auth.credentials.userData.accountId;
        let post = await Models.Post.findOne({
            where:{id:id,isRevision:false,revisionId:null},
            include:[
                {
                    model:Models.PostContent
                }
            ]
        });
        if(post){
            let userId = request.auth.credentials.userData.id;
            let revisonObject = JSON.parse(JSON.stringify(post))
            let revision = await storeRevision(revisonObject,transaction);
            if(revision){
                await Models.Post.update({lastUpdatedBy:userId},{where:{id:post.id}});
                await post.destroy({transaction:transaction});
                await transaction.commit();
                return h.response({message:request.i18n.__("POST_HAS_BEEN_DELETED_SUCCESSFULLY"),responseData:JSON.parse(JSON.stringify(post))}).code(200);
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_CREATING_REVISION',{});
            }
        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'POST_NOT_FOUND',{});
        }

    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// List category with pagination 
export const list=async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let {perPage,page,postType} = request.query;
        perPage = +process.env.PAGINATION_LIMIT!<perPage?+process.env.PAGINATION_LIMIT!:perPage
        let offset = (page - 1) * perPage;
        let posts = await Models.Post.findAndCountAll({
            attributes:attributes,
            include:[
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
                    attributes:mediaImageAttributes,
                    model:Models.PostMedia,
                    as:'postImage',
                    where:{type:'image'},
                    required:false,
                    include:[
                        {attributes:[],model:Models.Attachment},
                        {attributes:[],model:Models.Language, where:{code:request.headers.language}}
                    ] 
                },
                {
                    attributes:mediaVideoAttributes,
                    model:Models.PostMedia,
                    as:'postVideo',
                    required:false,
                    where:{type:'video'},
                    include:[
                        {attributes:[],model:Models.Attachment},
                        {attributes:[],model:Models.Language, where:{code:request.headers.language}}
                    ] 
                },
                {
                    attributes:[],
                    model:Models.PostContent,as:'content',
                    include:[
                        {attributes:[],model:Models.Language, where:{code:request.headers.language}}
                    ]
                },
                {
                    attributes:[],
                    model:Models.PostContent,as:'defaultContent',
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
            order:[['id','desc']],
            where:{isRevision:false,postType:postType},
            offset:offset,
            limit: perPage,
            distinct:true,
            subQuery:false

        });
        const count = posts.count;
        let totalPages = await Common.getTotalPages(count,perPage);
        let rows = JSON.parse(JSON.stringify(posts.rows));
        return h.response({
            message:request.i18n.__("POST_LIST_REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData:{
                data:rows,
                perPage:perPage,
                page:page,
                totalPages:totalPages,
                totalRecords: count
            }
        }).code(200)
    }catch(err){
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

// List category with pagination for public post 
export const listPublicPost = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let {perPage,page,postType} = request.query;
        perPage = +process.env.PAGINATION_LIMIT!<perPage?+process.env.PAGINATION_LIMIT!:perPage
        let offset = (page - 1) * perPage;
        let posts = await Models.Post.findAndCountAll({
            attributes:attributes,
            include:[
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
                    attributes:mediaImageAttributes,
                    model:Models.PostMedia,
                    as:'postImage',
                    where:{type:'image'},
                    required:false,
                    include:[
                        {attributes:[],model:Models.Attachment},
                        {attributes:[],model:Models.Language, where:{code:request.headers.language}}
                    ] 
                },
                {
                    attributes:mediaVideoAttributes,
                    model:Models.PostMedia,
                    as:'postVideo',
                    required:false,
                    where:{type:'video'},
                    include:[
                        {attributes:[],model:Models.Attachment},
                        {attributes:[],model:Models.Language, where:{code:request.headers.language}}
                    ] 
                },
                {
                    attributes:[],
                    model:Models.PostContent,as:'content',
                    include:[
                        {attributes:[],model:Models.Language, where:{code:request.headers.language}}
                    ]
                },
                {
                    attributes:[],
                    model:Models.PostContent,as:'defaultContent',
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
            order:[['id','desc']],
            where:{isRevision:false,postType:postType, status: Constants.STATUS.ACTIVE},
            offset:offset,
            limit: perPage,
            distinct:true,
            subQuery:false

        });
        const count = posts.count;
        let totalPages = await Common.getTotalPages(count,perPage);
        let rows = JSON.parse(JSON.stringify(posts.rows));
        return h.response({
            message:request.i18n.__("POST_LIST_REQUEST_PROCESSED_SUCCESSFULLY"),
            responseData:{
                data:rows,
                perPage:perPage,
                page:page,
                totalPages:totalPages,
                totalRecords: count
            }
        }).code(200)
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
        let post = await Models.Post.findOne({
            where:{id:id,isRevision:false,revisionId:null},
            include:[
                {
                    model:Models.PostContent
                }
            ]
        });
        if(post){
            // Create revision of existing entity in DB
            let revisonObject = JSON.parse(JSON.stringify(post))
            let revision = await storeRevision(revisonObject,transaction);
            if(revision){
                await Models.Post.update({lastUpdatedBy:userId,status:status},{where:{id:post.id},transaction:transaction});
                await transaction.commit();
                let responseObject = await fetch(id,accountId,request.headers.language);
                responseObject = JSON.parse(JSON.stringify(responseObject));
                return h.response({message:request.i18n.__("POST_STATUS_HAS_BEEN_UPDATED_SUCCESSFULLY"),responseData:responseObject}).code(200)
            }else{
                await transaction.rollback();
                return Common.generateError(request,400,'ERROR_WHILE_CREATING_THE_REVISION',{});
            }

        }else{
            await transaction.rollback();
            return Common.generateError(request,400,'POST_ID_NOT_FOUND',{});
        }
    }catch(err){
        await transaction.rollback();
        return Common.generateError(request,500,'SOMETHING_WENT_WRONG_WITH_EXCEPTION',err);
    }
}

