import {Joi,Common,_} from "../config/routeImporter";
import {userObject,categoryObject,parenetCategory,categoryTypeObject,attachmentObject} from "./relations";
let sampleReply="Sample content for the post/reply"
const reply: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description("Unique identifier for the post/reply").example(1),
    topicId: Joi.number().integer().description("Identifier for the topic").example(1),
    inResponseTo: Joi.number().integer().description("Identifier for the reply/post for which reply has been posted").example(1),
    createdBy:userObject,
    status:Joi.number().integer().valid(0,1).description('Required status of the reply 0-> Inactive, 1=> Active').example(1),
    reply:Joi.string().trim().description('Reply/post content').example(sampleReply),
    replyAttachments:Joi.array().items(attachmentObject).label('reply-attachments').description("Files attached to the reply").allow(null).min(0),
    totalReplies:Joi.number().description('number of replies on the post/reply').example(10),
    createdAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    updatedAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Last update date"),
}).label('reply').description('Reply object')

const replyRequest: Joi.ObjectSchema = Joi.object().keys({
    topicId: Joi.number().integer().description("Identifier of topic for which post/reply has been created").example(1).required().error(errors=>{return Common.routeError(errors,'TOPIC_ID_IS_REQUIRED')}),
    inResponseTo: Joi.number().integer().description("Identifier of post/reply for which post/reply has been created").example(1).optional().allow(null).default(null),
    status: Joi.number().integer().valid(0, 1).example(1).description('Status of the topic 0-> Inactive, 1=> Active').allow(null).default(1),
    reply:Joi.string().trim().description('Reply/post content').example(sampleReply).required().error(errors=>{return Common.routeError(errors,'REPLY_IS_REQUIRED')}),
    replyAttachments:Joi.array().items(Joi.number()).optional().allow(null).default(null).example([1,2]).label('reply-attachment-ids').description("array of files associated with the reply")
}).label('reply-request').description('Request object for the reply')

const replyStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status:Joi.number().integer().valid(0,1).description('Required status of the reply/post 0-> Inactive, 1=> Active').example(1).required().error(errors=>{return Common.routeError(errors,'REPLY_STATUS_IS_REQUIRED')}),
}).label('reply-status-request').description('Request object for the reply status')

const replyIdentifier: Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().integer().description('Unique identifier for the reply/post').example(1).required().error(errors=>{return Common.routeError(errors,'REPLY_ID_IS_REQUIRED')})
}).label('reply-identifier').description('Unique identifier for the reply/post')

const replyResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:reply
}).label('reply-response-object').description('Response format for the reply')

const listAllRepliesRequest: Joi.ObjectSchema = Joi.object().keys({
    topicId:Joi.number().required().error(errors=>{return Common.routeError(errors,'TOPIC_ID_IS_REQUIRED')}),
    replyId:Joi.number().optional().allow(null).default(null),
    status: Joi.number().optional().default(null).allow(null).valid(0, 1).example(1).description('filter replies for status 0-> Inactive, 1=> Active')
}).label('all-replies-request-object').description('Request format for reply listing')

const listAllRepliesResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:Joi.array().items(reply).description("Array of reply objects")
}).label('all-replies-response-object').description('Response format for all replies at once')

const listPaginatedRepliesRequest:Joi.ObjectSchema = Joi.object().keys({
    topicId:Joi.number().required().error(errors=>{return Common.routeError(errors,'TOPIC_ID_IS_REQUIRED')}),
    replyId:Joi.number().optional().allow(null).default(null),
    page:Joi.number().integer().example(1).description("page number").optional().default(1),
    status: Joi.number().integer().valid(0, 1).example(1).description('Status of the reply 0-> Inactive, 1=> Active').allow(null).default(null),
}).label('paginated-replies-response-object').description('Request format for replies with pagination')

const listPaginatedRepliesResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:{
        data:Joi.array().items(reply).description("Array of reply objects").example([]),
        page:Joi.number().integer().example(1).description("Current page number"),
        perPage:Joi.number().integer().example(10).description("Number of records per page"),
        totalPages:Joi.number().integer().example(10).description("Total number of pages"),
        totalRecords:Joi.number().integer().example(100).description("Total number of pages")
    }
}).label('paginated-replies-response-object').description('Response format for replies with pagination')

export {
    reply,
    replyResponse,
    replyIdentifier,
    replyRequest,
    replyStatusRequest,
    listAllRepliesRequest,
    listAllRepliesResponse,
    listPaginatedRepliesRequest,
    listPaginatedRepliesResponse
}
