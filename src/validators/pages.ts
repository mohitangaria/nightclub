import {Joi,Common,_} from "../config/routeImporter";
import {userObject,categoryObject,parenetCategory,categoryTypeObject,attachmentObject} from "./relations";
let sampleDescription="a planned social occasion or activity at which a person, usually someone well-known, is formally introduced to attendees to socialize with them or answer their questions: We were invited to a meet and greet with the cast after the performance"
let sampleTitle="Title of page"
const page: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description("Unique identifier for the page").example(1),
    communityId: Joi.number().integer().description("Identifier of community for which page has been created").example(1),
    slug:Joi.string().trim().description('System generated unique code for the community').example("COMMUNITY_CODE"),
    createdBy:userObject,
    updatedBy:userObject,
    status:Joi.number().integer().valid(0,1).description('Status of the page 0-> Inactive, 1=> Active').example(1),
    title:Joi.string().trim().description('Title of the page').example(sampleTitle),
    description:Joi.string().description('Small description for the page').example(sampleDescription),
    pageImage:attachmentObject.allow(null).description("Featured image for the page"),
    pageAttachments:Joi.array().items(attachmentObject).description("Files attached to the page").allow(null).min(0),
    createdAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    updatedAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Last update date"),
}).label('page').description('Page object')


const pageRequest: Joi.ObjectSchema = Joi.object().keys({
    communityId: Joi.number().integer().description("Identifier of community for which page has been created").example(1).required().error(errors=>{return Common.routeError(errors,'COMMUNITY_ID_IS_REQUIRED')}),
    title:Joi.string().trim().description('Title of the page').example(sampleTitle).required().error(errors=>{return Common.routeError(errors,'PAGE_TITLE_IS_REQUIRED')}),
    excerpt: Joi.string().trim().description('Excerpt of the topic').example(sampleTitle).required().error(errors => { return Common.routeError(errors, 'TOPIC_EXCERPT_IS_REQUIRED') }),
    description:Joi.string().description('Small description for the page').example(sampleDescription).required().error(errors=>{return Common.routeError(errors,'PAGE_DESCRIPTION_IS_REQUIRED')}),
    pageImage:Joi.number().example(1).description("Identifier of attachment used as fetaured image").allow(null).default(null),
    status: Joi.number().integer().valid(0, 1).example(1).description('Status of the topic 0-> Inactive, 1=> Active').allow(null).default(1),
    pageAttachments:Joi.array().items(Joi.number()).optional().allow(null).default(null).example([1,2]).description("array of files associated with the page")
}).label('page-request').description('Request object for the page')

const pageStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status:Joi.number().integer().valid(0,1).description('Required status of the community 0-> Inactive, 1=> Active').example(1).required().error(errors=>{return Common.routeError(errors,'PAGE_STATUS_IS_REQUIRED')}),
}).label('page-status-request').description('Request object for the page status')

const pageIdentifier: Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().integer().description('Unique identifier for the page').example(1).required().error(errors=>{return Common.routeError(errors,'PAGE_ID_IS_REQUIRED')})
}).label('page-identifier').description('Unique identifier for the page')

const pageSlugIdentifier: Joi.ObjectSchema = Joi.object().keys({
    id:Joi.string().trim().description('Unique string identifier for the page').example('page-slug').required().error(errors=>{return Common.routeError(errors,'PAGE_SLUG_IS_REQUIRED')})
}).label('page-string-identifier').description('Unique string identifier for the page')

const listAllPagesRequest: Joi.ObjectSchema = Joi.object().keys({
    status: Joi.number().optional().default(null).allow(null).valid(0, 1).example(1).description('filter pages for status 0-> Inactive, 1=> Active')
}).label('all-pages-request-object').description('Request format for page listing')

const pageResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:page
}).label('page-response-object').description('Response format for page')

const listAllPagesResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:Joi.array().items(page).description("Array of page objects")
}).label('all-pages-response-object').description('Response format for all page at once')

const listPaginatedPagesRequest:Joi.ObjectSchema = Joi.object().keys({
    page:Joi.number().integer().example(1).description("page number").optional().default(1),
    status: Joi.number().integer().valid(0, 1).example(1).description('Status of the topic 0-> Inactive, 1=> Active').allow(null).default(null),
}).label('paginated-pages-response-object').description('Request format for pages with pagination')

const listPaginatedPagesResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:{
        data:Joi.array().items(page).description("Array of page objects").example([]),
        page:Joi.number().integer().example(1).description("Current page number"),
        perPage:Joi.number().integer().example(10).description("Number of records per page"),
        totalPages:Joi.number().integer().example(10).description("Total number of pages"),
        totalRecords:Joi.number().integer().example(100).description("Total number of pages")
    }
}).label('paginated-pages-response-object').description('Response format for pages with pagination')



export {
    page,
    pageResponse,
    pageSlugIdentifier,
    pageIdentifier,
    pageRequest,
    pageStatusRequest,
    listAllPagesRequest,
    listAllPagesResponse,
    listPaginatedPagesRequest,
    listPaginatedPagesResponse
}
