import { Joi, Common, _ } from "../config/routeImporter";
const {userObject}=require("./relations")

const faqRequest=Joi.object().keys({
    question: Joi.string().trim().required().error(errors=>{return Common.routeError(errors,'FAQ_QUESTION_IS_REQUIRED')}).example("Question title ").description('Question is required'),
    answer: Joi.string().trim().required().error(errors=>{return Common.routeError(errors,'FAQ_ANSWER_IS_REQUIRED')}).example("Answer to the question").description('Detailed answer to the question'),
    categoryId: Joi.number().integer().allow(null).optional().default(null).error(errors=>{return Common.routeError(errors,'CATEGORY_ID_SHOULD_BE_A_VALID_NUMBER')}).example(1).description('ref category id')
}).label('faq-request').description('Create a FAQ entry')


const faqIdentity=Joi.object().keys({
    id:Joi.number().required().example(1).description("Unique identifier for the faq"),
}).label('faq-identiry').description('Identifier for the content type')

const faq=Joi.object().keys({
    id:Joi.number().example(1).description("Unique identifier for the faq"),
    categoryId: Joi.number().allow(null).example(1).example("category"),
    question:Joi.string().example("Question title").description('Question'),
    answer:Joi.string().example("Answer to the question").description('Answer'),
    author:userObject.allow(null),
    updatedBy:userObject.allow(null),
    status:Joi.number().example(1).valid(0,1).description("Activation status"),
    isRevision:Joi.boolean().example(true).allow(null).description("If the entry is stored as revision or not"),
    revisionId:Joi.number().example(1).allow(null).description("Ref to the revision entity"),
    createdAt:Joi.date().example("2023-01-02T12:18:55.000Z").description("creation date"),
    updatedAt:Joi.date().example("2023-01-02T12:18:55.000Z").description("last update date")
}).label('FAQ').description('FAQ object')



const faqResponse=Joi.object().keys({
    message:Joi.string().example("Request status message").description("Message to confirm the operation"),
    responseData:faq
}).label('faq-response').description('FAQ response object')

const faqDeletedObj = faq.keys({deletedAt:Joi.date().example("2023-01-02T12:18:55.000Z").description("Date when record was deleted"),}).label('deleted-faq').description('Deleted models for FAQ');

const faqDeleteResponse=Joi.object().keys({
    message:Joi.string().example("Request status message").description("Message to confirm the operation"),
    responseData:faqDeletedObj
}).label('faq-delete-response').description('FAQ response object')

const faqsResponse=Joi.object().keys({
    message:Joi.string().example("Request status message").description("Message to confirm the operation"),
    responseData:Joi.array().items(faq).min(0).label('faq-listing').description('Array of faq objects')
}).label('faq-response').description('List of all faq in array format')

const listFaqRequest=Joi.object().keys({
    page:Joi.number().optional().min(1).default(1),
    parentId:Joi.number().optional().default(null),
    perPage:Joi.number().optional().min(1).default(+process.env.PAGINATION_LIMIT!),
    showRevisions:Joi.boolean().optional().default(false).valid(true,false).example(false).description("If request is to list all category types or revisions of a category. For revisions id is required parameter"),
    categoryId: Joi.number().optional().default(null).allow(null).example(1),
    searchText: Joi.string().trim().optional()
    .example('John Doe')
    .description("Optional text to search and filter users by name")
    .error(errors => { return Common.routeError(errors, 'SEARCH_TEXT_MUST_BE_STRING') }),
}).label('faq-list-request').description('FAQ list request with filters')

const categoryFilter=Joi.object().keys({
    categoryId: Joi.number().optional().default(null).allow(null).example(1)
}).label('faq-list-request').description('FAQ list request with filters')

const listFaqResponse=Joi.object().keys({
    message:Joi.string().example("Request status message").description("Message to confirm the operation"),
    responseData:Joi.object().keys({
        data:Joi.array().items(faq).min(0).description('Array of faq objects'),
        perPage:Joi.number().example(1).description("Number or required in response"),
        page:Joi.number().example(1).description("page no for which data is requested"),
        totalPages:Joi.number().example(1).description("Total number of pages response set will generate"),
        totalRecords:Joi.number().example(1).description("Total number of pages response set will generate")
    }).label('category-list-responseData').description('Category list response data object')
}).label('category-list-response').description('Category list response')

const faqStatusRequest = Joi.object().keys({
    status:Joi.number().required().error(errors=>{return Common.routeError(errors,'FAQ_STATUS_IS_REQUIRED')}).description("Status of the faq")
}).label('faq-status-request').description("Request to update the status of the faq")

const sortRequest = Joi.object().keys({
    sortOrder:Joi.number().strict().required().error(errors=>{return Common.routeError(errors,'SORT_ORDER_IS_REQUIRED')}).description("Sort order for the record")
}).label('faq-order-request').description("Request to update the order of the faq")


const sortResponse=Joi.object().keys({
    message:Joi.string().example("Request status message").description("Message to confirm the operation")
})

export {
    faqRequest,
    faqIdentity,
    faqResponse,
    faqDeleteResponse,
    faqsResponse,
    listFaqRequest,
    listFaqResponse,
    faqStatusRequest,
    sortRequest,
    sortResponse,
    categoryFilter
}