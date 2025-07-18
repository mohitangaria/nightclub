import { Joi, Common, _ } from "../config/routeImporter";
import { userObject, categoryObject, parenetCategory, categoryTypeObject, attachmentObject } from "./relations";
let sampleDescription = "a planned social occasion or activity at which a person, usually someone well-known, is formally introduced to attendees to socialize with them or answer their questions: We were invited to a meet and greet with the cast after the performance"
let sampleTitle = "Title of topic"
const topic: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description("Unique identifier for the topic").example(1),
    communityId: Joi.number().integer().description("Identifier of community for which topic has been created").example(1),
    slug: Joi.string().trim().description('System generated unique code for the topic').example("topic-slug"),
    createdBy: userObject,
    updatedBy: userObject,
    status: Joi.number().integer().valid(0, 1).description('Required status of the topic 0-> Inactive, 1=> Active').example(1),
    title: Joi.string().trim().description('Title of the topic').example(sampleTitle),
    excerpt: Joi.string().trim().description('Excerpt of the topic').example(sampleTitle),
    description: Joi.string().description('Small description for the topic').example(sampleDescription),
    topicImage: attachmentObject.allow(null).label('topic-image').description("Featured image for the topic"),
    topicAttachments: Joi.array().items(attachmentObject).label('topic-attachments').description("Files attached to the topic").allow(null).min(0),
    totalReplies: Joi.number().description('number of replies on the post/reply').example(10),
    createdAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    updatedAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Last update date"),
}).label('topic').description('Topic object')

const topicRequest: Joi.ObjectSchema = Joi.object().keys({
    communityId: Joi.number().integer().description("Identifier of community for which topic has been created").example(1).required().error(errors => { return Common.routeError(errors, 'TOPIC_ID_IS_REQUIRED') }),
    title: Joi.string().trim().description('Title of the topic').example(sampleTitle).required().error(errors => { return Common.routeError(errors, 'TOPIC_NAME_IS_REQUIRED') }),
    excerpt: Joi.string().trim().description('Excerpt of the topic').example(sampleTitle).required().error(errors => { return Common.routeError(errors, 'TOPIC_EXCERPT_IS_REQUIRED') }),
    description: Joi.string().description('Small description for the topic').example(sampleDescription).required().error(errors => { return Common.routeError(errors, 'TOPIC_DESCRIPTION_IS_REQUIRED') }),
    status: Joi.number().integer().valid(0, 1).example(1).description('Status of the topic 0-> Inactive, 1=> Active').allow(null).default(1),
    topicImage: Joi.number().example(1).description("Identifier of attachment used as fetaured image").allow(null).default(null),
    topicAttachments: Joi.array().items(Joi.number()).optional().allow(null).default(null).example([1, 2]).label('topic-attachment-ids').description("array of files associated with the topic")
}).label('topic-request').description('Request object for the topic')

const topicStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status: Joi.number().integer().valid(0, 1).description('Required status of the topic 0-> Inactive, 1=> Active').example(1).required().error(errors => { return Common.routeError(errors, 'TOPIC_STATUS_IS_REQUIRED') }),
}).label('topic-status-request').description('Request object for the topic status')

const topicIdentifier: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description('Unique identifier for the topic').example(1).required().error(errors => { return Common.routeError(errors, 'TOPIC_ID_IS_REQUIRED') })
}).label('topic-identifier').description('Unique identifier for the topic')

const topicSlugIdentifier: Joi.ObjectSchema = Joi.object().keys({
    slug: Joi.string().trim().description('Unique string identifier for the topic').example('topic-slug').required().error(errors => { return Common.routeError(errors, 'TOPIC_ID_IS_REQUIRED') })
}).label('topic-identifier').description('Unique string identifier for the topic')

const topicResponse: Joi.ObjectSchema = Joi.object().keys({
    message: Joi.string().description("confirmation message"),
    responseData: topic
}).label('topic-response-object').description('Response format for topic')

const listAllTopicsRequest: Joi.ObjectSchema = Joi.object().keys({
    communityId:Joi.number().required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') }).example(1),
    status: Joi.number().optional().default(null).allow(null).valid(0, 1).example(1).description('filter topics for status 0-> Inactive, 1=> Active')
}).label('all-topics-request-object').description('Request format for topic listing')

const listAllTopicsResponse: Joi.ObjectSchema = Joi.object().keys({
    message: Joi.string().description("confirmation message"),
    responseData: Joi.array().items(topic).description("Array of topic objects")
}).label('all-topics-response-object').description('Response format for all topic at once')

const listPaginatedTopicsRequest: Joi.ObjectSchema = Joi.object().keys({
    communityId:Joi.number().required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') }).example(1),
    page: Joi.number().integer().example(1).description("page number").optional().default(1),
    status: Joi.number().optional().default(null).allow(null).valid(0, 1).example(1).description('filter topics for status 0-> Inactive, 1=> Active')
}).label('paginated-topics-response-object').description('Request format for topics with pagination')

const listPaginatedTopicsResponse: Joi.ObjectSchema = Joi.object().keys({
    message: Joi.string().description("confirmation message"),
    responseData: {
        data: Joi.array().items(topic).description("Array of topic objects").example([]),
        page: Joi.number().integer().example(1).description("Current page number"),
        perPage: Joi.number().integer().example(10).description("Number of records per page"),
        totalPages: Joi.number().integer().example(10).description("Total number of pages"),
        totalRecords: Joi.number().integer().example(100).description("Total number of pages")
    }
}).label('paginated-topics-response-object').description('Response format for topics with pagination')

export {
    topic,
    topicResponse,
    topicSlugIdentifier,
    topicIdentifier,
    topicRequest,
    topicStatusRequest,
    listAllTopicsRequest,
    listAllTopicsResponse,
    listPaginatedTopicsRequest,
    listPaginatedTopicsResponse
}
