import {Joi,Common,_} from "../config/routeImporter";
import {userObject,categoryObject,parenetCategory,categoryTypeObject,attachmentObject} from "./relations";
let sampleDescription="a planned social occasion or activity at which a person, usually someone well-known, is formally introduced to attendees to socialize with them or answer their questions: We were invited to a meet and greet with the cast after the performance"
let sampleTitle="Title of diary"
const diary: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description("Unique identifier for the diary").example(1),
    communityId: Joi.number().integer().description("Identifier of community for which diary has been created").example(1),
    slug:Joi.string().trim().description('System generated unique code for the diary').example("diary_code"),
    createdBy:userObject,
    updatedBy:userObject,
    status:Joi.number().integer().valid(0,1).description('Required status of the diary 0-> Inactive, 1=> Active').example(1),
    title:Joi.string().trim().description('Title of the diary').example(sampleTitle),
    excerpt: Joi.string().trim().description('Excerpt of the topic').example(sampleTitle),
    description:Joi.string().description('Small description for the diary').example(sampleDescription),
    diaryImage:attachmentObject.allow(null).description("Featured image for the diary"),
    diaryAttachments:Joi.array().items(attachmentObject).description("Files attached to the diary").allow(null).min(0),
    totalEntries:Joi.number().description('number of entries recorded in the diary').example(10),
    createdAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    updatedAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Last update date"),
}).label('diary').description('Diary object')


const diaryRequest: Joi.ObjectSchema = Joi.object().keys({
    communityId: Joi.number().integer().description("Identifier of community for which diary has been created").example(1).required().error(errors=>{return Common.routeError(errors,'COMMUNITY_ID_IS_REQUIRED')}),
    title:Joi.string().trim().description('Title of the diary').example(sampleTitle).required().error(errors=>{return Common.routeError(errors,'DIARY_TITLE_IS_REQUIRED')}),
    excerpt: Joi.string().trim().description('Excerpt of the topic').example(sampleTitle).required().error(errors => { return Common.routeError(errors, 'TOPIC_EXCERPT_IS_REQUIRED') }),
    description:Joi.string().description('Small description for the diary').example(sampleDescription).required().error(errors=>{return Common.routeError(errors,'DIARY_DESCRIPTION_IS_REQUIRED')}),
    diaryImage:Joi.number().example(1).description("Identifier of attachment used as fetaured image").allow(null).default(null),
    diaryAttachments:Joi.array().items(Joi.number()).optional().allow(null).default(null).example([1,2]).description("array of files associated with the diary")
}).label('diary-request').description('Request object for the diary')

const diaryStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status:Joi.number().integer().valid(0,1).description('Required status for the diary 0-> Inactive, 1=> Active').example(1).required().error(errors=>{return Common.routeError(errors,'COMMUNITY_STATUS_IS_REQUIRED')}),
}).label('diary-status-request').description('Request object for the diary status')

const diarySlugIdentifier: Joi.ObjectSchema = Joi.object().keys({
    slug: Joi.string().trim().description('Unique string identifier for the diary').example('diary-slug').required().error(errors => { return Common.routeError(errors, 'TOPIC_ID_IS_REQUIRED') })
}).label('topic-identifier').description('Unique string identifier for the diary')

const diaryIdentifier: Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().integer().description('Unique identifier for the diary').example(1).required().error(errors=>{return Common.routeError(errors,'COMMUNITY_ID_IS_REQUIRED')})
}).label('diary-identifier').description('Unique identifier for the diary')

const diaryResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:diary
}).label('diary-response-object').description('Response format for diary')

const listAllDiariesResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:Joi.array().items(diary).description("Array of diary objects")
}).label('all-diarys-response-object').description('Response format for all diary at once')

const listPaginatedDiarysRequest:Joi.ObjectSchema = Joi.object().keys({
    communityId:Joi.number().required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') }).example(1),
    page:Joi.number().integer().example(1).description("page number").optional().default(1),
}).label('paginated-diarys-response-object').description('Request format for diarys with pagination')

const listAllDiariesRequest: Joi.ObjectSchema = Joi.object().keys({
    communityId:Joi.number().required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') }).example(1),
    status: Joi.number().optional().default(null).allow(null).valid(0, 1).example(1).description('filter topics for status 0-> Inactive, 1=> Active')
}).label('all-topics-request-object').description('Request format for topic listing')

const listPaginatedDiarysResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:{
        data:Joi.array().items(diary).description("Array of diary objects").example([]),
        page:Joi.number().integer().example(1).description("Current page number"),
        perPage:Joi.number().integer().example(10).description("Number of records per page"),
        totalPages:Joi.number().integer().example(10).description("Total number of pages"),
        totalRecords:Joi.number().integer().example(100).description("Total number of pages")
    }
}).label('paginated-diarys-response-object').description('Response format for diarys with pagination')



export {
    diary,
    diaryResponse,
    diarySlugIdentifier,
    diaryIdentifier,
    diaryRequest,
    diaryStatusRequest,
    listAllDiariesRequest,
    listAllDiariesResponse,
    listPaginatedDiarysRequest,
    listPaginatedDiarysResponse
}
