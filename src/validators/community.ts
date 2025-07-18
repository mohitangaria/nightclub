import { Joi, Common, _ } from "../config/routeImporter";
import { userObject, categoryObject, parenetCategory, categoryTypeObject, attachmentObject } from "./relations";
let sampleDescription = "a planned social occasion or activity at which a person, usually someone well-known, is formally introduced to attendees to socialize with them or answer their questions: We were invited to a meet and greet with the cast after the performance"
let sampleName = "Name of the community"
const community: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description("Unique identifier for the community").example(1),
    slug: Joi.string().trim().description('System generated unique code for the community').example("community-slug"),
    createdBy: userObject,
    updatedBy: userObject,
    logo: attachmentObject.allow(null).label('community-image').description("Files attached to the community as logo"),
    communityAttachments: Joi.array().items(attachmentObject).label('community-attachments').description("Files attached to the community").allow(null).min(0),
    status: Joi.number().integer().valid(0, 1).description('Required status of the community 0-> Inactive, 1=> Active').example(1),
    name: Joi.string().trim().description('Name of the community').example(sampleName),
    description: Joi.string().description('Small description for the community').example(sampleDescription),
    createdAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    updatedAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Last update date"),
}).label('community').description('Community object')

const communityRequest: Joi.ObjectSchema = Joi.object().keys({
    name: Joi.string().trim().description('Name of the community').example(sampleName).required().error(errors => { return Common.routeError(errors, 'COMMUNITY_NAME_IS_REQUIRED') }),
    description: Joi.string().description('Small description for the community').example(sampleDescription).required().error(errors => { return Common.routeError(errors, 'COMMUNITY_DESCRIPTION_IS_REQUIRED') }),
    logo: Joi.number().example(1).description("Identifier of attachment used for logo").allow(null).default(null),
    status: Joi.number().integer().valid(0, 1).example(1).description('Status of the community 0-> Inactive, 1=> Active').allow(null).default(1),
    communityAttachments: Joi.array().items(Joi.number()).optional().allow(null).default(null).example([1, 2]).label('community-attachment-ids').description("array of file id's to be associated with the community")
}).label('community-request').description('Request object to create/updated a the community')

const communityStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status: Joi.number().integer().valid(0, 1).description('Required status of the community 0-> Inactive, 1=> Active').example(1).required().error(errors => { return Common.routeError(errors, 'COMMUNITY_STATUS_IS_REQUIRED') }),
}).label('community-status-request').description('Request object for the community')

const communityIdentifier: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description('Unique identifier for the community').example(1).required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') })
}).label('community-identifier').description('Unique identifier for the community')

const communitySlugIdentifier: Joi.ObjectSchema = Joi.object().keys({
    slug: Joi.string().trim().description('Unique string identifier for the community').example('community-slug').required().error(errors => { return Common.routeError(errors, 'COMMUNITY_SLUG_IS_REQUIRED') })
}).label('community-slug-identifier').description('Unique string identifier for the community')

const communityResponse: Joi.ObjectSchema = Joi.object().keys({
    message: Joi.string().description("confirmation message"),
    responseData: community
}).label('community-response-object').description('Response format for community')

const listAllCommunitiesRequest: Joi.ObjectSchema = Joi.object().keys({
    status: Joi.number().optional().default(null).allow(null).valid(0, 1).example(1).description('filter communities for status 0-> Inactive, 1=> Active')
}).label('all-communities-request-object').description('Request format for community listing')

const listAllCommunitiesResponse: Joi.ObjectSchema = Joi.object().keys({
    message: Joi.string().description("confirmation message"),
    responseData: Joi.array().items(community).description("Array of community objects")
}).label('all-communities-response-object').description('Response format for community')

const listPaginatedCommunitiesRequest: Joi.ObjectSchema = Joi.object().keys({
    page: Joi.number().integer().example(1).description("page number").optional().default(1),
    status: Joi.number().optional().default(null).allow(null).valid(0, 1).example(1).description('filter communities for status 0-> Inactive, 1=> Active')
}).label('paginated-communities-response-object').description('request format for communities with pagination')

const listPaginatedCommunitiesResponse: Joi.ObjectSchema = Joi.object().keys({
    message: Joi.string().description("confirmation message"),
    responseData: {
        data: Joi.array().items(community).description("Array of community objects").example([]),
        page: Joi.number().integer().example(1).description("Current page number"),
        perPage: Joi.number().integer().example(10).description("Number of records per page"),
        totalPages: Joi.number().integer().example(10).description("Total number of pages"),
        totalRecords: Joi.number().integer().example(100).description("Total number of pages")
    }
}).label('paginated-communities-response-object').description('Response format for communities with pagination')

export {
    community,
    communityResponse,
    communitySlugIdentifier,
    communityIdentifier,
    communityRequest,
    communityStatusRequest,
    listAllCommunitiesRequest,
    listAllCommunitiesResponse,
    listPaginatedCommunitiesRequest,
    listPaginatedCommunitiesResponse
}
