import {Joi,Common,_} from "../config/routeImporter";
import {userObject,categoryObject,parenetCategory,categoryTypeObject,attachmentObject} from "./relations";
let sampleDescription="a planned social occasion or activity at which a person, usually someone well-known, is formally introduced to attendees to socialize with them or answer their questions: We were invited to a meet and greet with the cast after the performance"
let sampleTitle="Title of the poll"
const poll: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description("Unique identifier for the poll").example(1),
    communityId: Joi.number().integer().description("Identifier of community for which poll has been created").example(1),
    slug:Joi.string().trim().description('System generated unique code for the community').example("COMMUNITY_CODE"),
    createdBy:userObject,
    updatedBy:userObject,
    status:Joi.number().integer().valid(0,1).description('Required status of the community 0-> Inactive, 1=> Active').example(1),
    title:Joi.string().trim().description('Title of the poll').example(sampleTitle),
    pollUrl:Joi.string().trim().description('Link to the poll').example('http://qfimr.com/survey_link'),
    description:Joi.string().description('Small description for the poll').example(sampleDescription),
    pollImage:attachmentObject.allow(null).description("Featured image for the poll"),
    createdAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    updatedAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Last update date"),
}).label('poll').description('Poll object')


const pollRequest: Joi.ObjectSchema = Joi.object().keys({
    communityId: Joi.number().integer().description("Identifier of community for which poll has been created").example(1).required().error(errors=>{return Common.routeError(errors,'COMMUNITY_ID_IS_REQUIRED')}),
    title:Joi.string().trim().description('Title of the poll').example(sampleTitle).required().error(errors=>{return Common.routeError(errors,'POLL_TITLE_IS_REQUIRED')}),
    description:Joi.string().description('Small description for the poll').example(sampleDescription).required().error(errors=>{return Common.routeError(errors,'POLL_DESCRIPTION_IS_REQUIRED')}),
    pollUrl:Joi.string().trim().description('Link to the poll').example('http://qfimr.com/survey_link').required().error(errors=>{return Common.routeError(errors,'POLL_LINK_IS_REQUIRED')}),
    pollImage:Joi.number().example(1).description("Identifier of attachment used as fetaured image").allow(null).default(null),
}).label('poll-request').description('Request object for the poll')

const pollStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status:Joi.number().integer().valid(0,1).description('Required status of the community 0-> Inactive, 1=> Active').example(1).required().error(errors=>{return Common.routeError(errors,'COMMUNITY_STATUS_IS_REQUIRED')}),
}).label('poll-status-request').description('Request object for the poll status')

const pollIdentifier: Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().integer().description('Unique identifier for the poll').example(1).required().error(errors=>{return Common.routeError(errors,'COMMUNITY_ID_IS_REQUIRED')})
}).label('poll-identifier').description('Unique identifier for the poll')

const pollResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:poll
}).label('poll-response-object').description('Response format for poll')

const listAllPollsRequest:Joi.ObjectSchema = Joi.object().keys({
    communityId:Joi.number().required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') }).example(1),
}).label('polls-list-response-object').description('Request format for polls')

const listAllPollsResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:Joi.array().items(poll).description("Array of poll objects")
}).label('all-polls-response-object').description('Response format for all poll at once')

const listPaginatedPollsRequest:Joi.ObjectSchema = Joi.object().keys({
    communityId:Joi.number().required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') }).example(1),
    page:Joi.number().integer().example(1).description("page number").optional().default(1),
}).label('paginated-polls-response-object').description('Request format for polls with pagination')

const listPaginatedPollsResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:{
        data:Joi.array().items(poll).description("Array of poll objects").example([]),
        page:Joi.number().integer().example(1).description("Current page number"),
        perPage:Joi.number().integer().example(10).description("Number of records per page"),
        totalPages:Joi.number().integer().example(10).description("Total number of pages"),
        totalRecords:Joi.number().integer().example(100).description("Total number of pages")
    }
}).label('paginated-polls-response-object').description('Response format for polls with pagination')



export {
    poll,
    pollResponse,
    pollIdentifier,
    pollRequest,
    pollStatusRequest,
    listAllPollsResponse,
    listAllPollsRequest,
    listPaginatedPollsRequest,
    listPaginatedPollsResponse
}
