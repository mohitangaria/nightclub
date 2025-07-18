import {Joi,Common,_} from "../config/routeImporter";
import {userObject,categoryObject,parenetCategory,categoryTypeObject,attachmentObject} from "./relations";
let sampleDescription="a planned social occasion or activity at which a person, usually someone well-known, is formally introduced to attendees to socialize with them or answer their questions: We were invited to a meet and greet with the cast after the performance"
let sampleTitle="Title of news"
const news: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description("Unique identifier for the news").example(1),
    communityId: Joi.number().integer().description("Identifier of community for which news has been created").example(1),
    slug:Joi.string().trim().description('System generated unique code for the community').example("news-slug"),
    createdBy:userObject,
    updatedBy:userObject,
    status:Joi.number().integer().valid(0,1).description('Required status of the community 0-> Inactive, 1=> Active').example(1),
    title:Joi.string().trim().description('Title of the news').example(sampleTitle),
    excerpt: Joi.string().trim().description('Excerpt of the topic').example(sampleTitle),
    description:Joi.string().description('Small description for the news').example(sampleDescription),
    newsImage:attachmentObject.allow(null).description("Featured image for the news"),
    newsAttachments:Joi.array().items(attachmentObject).description("Files attached to the news").allow(null).min(0),
    createdAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    updatedAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Last update date"),
}).label('news').description('News object')


const newsRequest: Joi.ObjectSchema = Joi.object().keys({
    communityId: Joi.number().integer().description("Identifier of community for which news has been created").example(1).required().error(errors=>{return Common.routeError(errors,'COMMUNITY_ID_IS_REQUIRED')}),
    title:Joi.string().trim().description('Title of the news').example(sampleTitle).required().error(errors=>{return Common.routeError(errors,'NEWS_TITLE_IS_REQUIRED')}),
    excerpt: Joi.string().trim().description('Excerpt of the topic').example(sampleTitle).required().error(errors => { return Common.routeError(errors, 'TOPIC_EXCERPT_IS_REQUIRED') }),
    description:Joi.string().description('Small description for the news').example(sampleDescription).required().error(errors=>{return Common.routeError(errors,'NEWS_DESCRIPTION_IS_REQUIRED')}),
    status: Joi.number().integer().valid(0, 1).example(1).description('Status of the topic 0-> Inactive, 1=> Active').allow(null).default(1),
    newsImage:Joi.number().example(1).description("Identifier of attachment used as fetaured image").allow(null).default(null),
    newsAttachments:Joi.array().items(Joi.number()).optional().allow(null).default(null).example([1,2]).description("array of files associated with the news")
}).label('news-request').description('Request object for the news')

const newsStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status:Joi.number().integer().valid(0,1).description('Required status of the community 0-> Inactive, 1=> Active').example(1).required().error(errors=>{return Common.routeError(errors,'NEWS_STATUS_IS_REQUIRED')}),
}).label('news-status-request').description('Request object for the news status')

const newsIdentifier: Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().integer().description('Unique identifier for the news').example(1).required().error(errors=>{return Common.routeError(errors,'NEWS_ID_IS_REQUIRED')})
}).label('news-identifier').description('Unique identifier for the news')

const newsSlugIdentifier: Joi.ObjectSchema = Joi.object().keys({
    slug: Joi.string().trim().description('Unique string identifier for the news').example('news-slug').required().error(errors => { return Common.routeError(errors, 'NEWS_SLUG_IS_REQUIRED') })
}).label('topic-identifier').description('Unique string identifier for the news')

const newsResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:news
}).label('news-response-object').description('Response format for news')

const listAllNewsRequest: Joi.ObjectSchema = Joi.object().keys({
    communityId:Joi.number().required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') }).example(1),
    status: Joi.number().optional().default(null).allow(null).valid(0, 1).example(1).description('filter news for status 0-> Inactive, 1=> Active')
}).label('all-news-request-object').description('Request format for news listing')

const listAllNewsResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:Joi.array().items(news).description("Array of news objects")
}).label('all-news-response-object').description('Response format for all news at once')

const listPaginatedNewsRequest:Joi.ObjectSchema = Joi.object().keys({
    communityId:Joi.number().required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') }).example(1),
    page:Joi.number().integer().example(1).description("news number").optional().default(1),
    status: Joi.number().optional().default(null).allow(null).valid(0, 1).example(1).description('filter news for status 0-> Inactive, 1=> Active')
}).label('paginated-news-response-object').description('Request format for news with pagination')

const listPaginatedNewsResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:{
        data:Joi.array().items(news).description("Array of news objects").example([]),
        page:Joi.number().integer().example(1).description("Current news number"),
        perPage:Joi.number().integer().example(10).description("Number of records per news"),
        totalPages:Joi.number().integer().example(10).description("Total number of news"),
        totalRecords:Joi.number().integer().example(100).description("Total number of news")
    }
}).label('paginated-news-response-object').description('Response format for news with pagination')

export {
    news,
    newsResponse,
    newsSlugIdentifier,
    newsIdentifier,
    newsRequest,
    newsStatusRequest,
    listAllNewsRequest,
    listAllNewsResponse,
    listPaginatedNewsRequest,
    listPaginatedNewsResponse
}