import {Joi,Common,_} from "../config/routeImporter";
import {userObject,categoryObject,parenetCategory,categoryTypeObject,attachmentObject} from "./relations";
import {diary} from "./diary"
let sampleReply="Sample content for the post/reply"
const diaryEntry: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description("Unique identifier for the entry").example(1),
    diaryId: Joi.number().integer().description("Identifier for the diary").example(1),
    createdBy:userObject,
    status:Joi.number().integer().valid(0,1).description('Required status of the entry 0-> Inactive, 1=> Active').example(1),
    entry:Joi.string().trim().description('Entry content').example(sampleReply),
    entryAttachments:Joi.array().items(attachmentObject).label('entry-attachments').description("Files attached to the entry").allow(null),
    createdAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    updatedAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Last update date"),
}).label('diary-entry').description('Diary Entry object')

const diaryEntryRequest: Joi.ObjectSchema = Joi.object().keys({
    diaryId: Joi.number().integer().description("Identifier of topic for which post/reply has been created").example(1).required().error(errors=>{return Common.routeError(errors,'DIARY_ID_IS_REQUIRED')}),
    status: Joi.number().integer().valid(0, 1).example(1).description('Status of the entry 0-> Inactive, 1=> Active').allow(null).default(1),
    entry:Joi.string().trim().description('Reply/post content').example(sampleReply).required().error(errors=>{return Common.routeError(errors,'REPLY_IS_REQUIRED')}),
    diaryEntryImage: Joi.number().example(1).description("Identifier of attachment used as fetaured image").allow(null).default(null),

    entryAttachments:Joi.array().items(Joi.number()).optional().allow(null).default(null).example([1,2]).label('diary-entry-attachment-ids').description("array of files associated with the diary entry")
}).label('diary-entry-request').description('Request object for the diary entry')

const diaryEntryStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status:Joi.number().integer().valid(0,1).description('Required status of the Entry 0-> Inactive, 1=> Active').example(1).required().error(errors=>{return Common.routeError(errors,'DIARY_ENTRY_STATUS_IS_REQUIRED')}),
}).label('diary-entry-status-request').description('Request object for the diary entry status')

const diaryEntryIdentifier: Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().integer().description('Unique identifier for the diary entry').example(1).required().error(errors=>{return Common.routeError(errors,'REPLY_ID_IS_REQUIRED')})
}).label('reply-identifier').description('Unique identifier for the diary entry')

const diaryEntryResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:diaryEntry
}).label('diary-entry-response-object').description('Response format for the diary entry')

const listAllDiaryEntriesRequest: Joi.ObjectSchema = Joi.object().keys({
    status: Joi.number().optional().default(null).allow(null).valid(0, 1).example(1).description('filter diary entry for status 0-> Inactive, 1=> Active')
}).label('all-diary-entry-request-object').description('Request format for diary entry listing')

const listAllDiaryEntriesResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:Joi.array().items(diaryEntry).description("Array of reply objects")
}).label('all-diary-entries-response-object').description('Response format for all diary entry at once')

const listPaginatedDiaryEntriesRequest:Joi.ObjectSchema = Joi.object().keys({
    diaryId:Joi.number().integer().example(1).description("diaryId").required().error(errors=>{return Common.routeError(errors,'DIARY_ID_IS_REQUIRED')}),
    page:Joi.number().integer().example(1).description("page number").optional().default(1),
    status: Joi.number().integer().valid(0, 1).example(1).description('Status of the diary entry 0-> Inactive, 1=> Active').allow(null).default(null),
}).label('paginated-diary-entries-response-object').description('Request format for diary entry with pagination')

const listPaginatedDiaryEntriesResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:{
        diary:diary,
        data:Joi.array().items(diaryEntry).description("Array of diary entry objects").example([]),
        page:Joi.number().integer().example(1).description("Current page number"),
        perPage:Joi.number().integer().example(10).description("Number of records per page"),
        totalPages:Joi.number().integer().example(10).description("Total number of pages"),
        totalRecords:Joi.number().integer().example(100).description("Total number of pages")
    }
}).label('paginated-diary-entry-response-object').description('Response format for diary-entry with pagination')

export {
    diaryEntry,
    diaryEntryResponse,
    diaryEntryIdentifier,
    diaryEntryRequest,
    diaryEntryStatusRequest,
    listAllDiaryEntriesRequest,
    listAllDiaryEntriesResponse,
    listPaginatedDiaryEntriesRequest,
    listPaginatedDiaryEntriesResponse
}
