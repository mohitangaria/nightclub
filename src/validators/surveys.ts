import {Joi,Common,_} from "../config/routeImporter";
import {userObject,categoryObject,parenetCategory,categoryTypeObject,attachmentObject} from "./relations";
let sampleDescription="a planned social occasion or activity at which a person, usually someone well-known, is formally introduced to attendees to socialize with them or answer their questions: We were invited to a meet and greet with the cast after the performance"
let sampleTitle="Title of the survey"
const survey: Joi.ObjectSchema = Joi.object().keys({
    id: Joi.number().integer().description("Unique identifier for the survey").example(1),
    communityId: Joi.number().integer().description("Identifier of community for which survey has been created").example(1),
    slug:Joi.string().trim().description('System generated unique code for the community').example("COMMUNITY_CODE"),
    createdBy:userObject,
    updatedBy:userObject,
    status:Joi.number().integer().valid(0,1).description('Required status of the community 0-> Inactive, 1=> Active').example(1),
    title:Joi.string().trim().description('Title of the survey').example(sampleTitle),
    excerpt: Joi.string().trim().description('Excerpt of the topic').example(sampleTitle),
    surveyType:Joi.number().description('Link to the survey').example(1).valid(1,2,3).default(1).allow(null).description('Type of survey 1=>Survey, 2=>ad servey 3=>video review'),
    surveyUrl:Joi.string().trim().description('Link to the survey').example('http://qfimr.com/survey_link'),
    description:Joi.string().description('Small description for the survey').example(sampleDescription),
    surveyImage:attachmentObject.allow(null).description("Featured image for the survey"),
    createdAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Creation date"),
    updatedAt: Joi.date().example("2023-01-02T12:18:55.000Z").description("Last update date"),
}).label('survey').description('Survey object')


const surveyRequest: Joi.ObjectSchema = Joi.object().keys({
    communityId: Joi.number().integer().description("Identifier of community for which survey has been created").example(1).required().error(errors=>{return Common.routeError(errors,'COMMUNITY_ID_IS_REQUIRED')}),
    title:Joi.string().trim().description('Title of the survey').example(sampleTitle).required().error(errors=>{return Common.routeError(errors,'SURVEY_TITLE_IS_REQUIRED')}),
    excerpt: Joi.string().trim().description('Excerpt of the topic').example(sampleTitle).required().error(errors => { return Common.routeError(errors, 'TOPIC_EXCERPT_IS_REQUIRED') }),
    description:Joi.string().description('Small description for the survey').example(sampleDescription).required().error(errors=>{return Common.routeError(errors,'SURVEY_DESCRIPTION_IS_REQUIRED')}),
    surveyType:Joi.number().description('Link to the survey').example(1).valid(1,2,3).default(1).allow(null).description('Type of survey 1=>Survey, 2=>ad servey 3=>video review'),
    surveyUrl:Joi.string().trim().description('Link to the survey').example('http://qfimr.com/survey_link').required().error(errors=>{return Common.routeError(errors,'SURVEY_LINK_IS_REQUIRED')}),
    surveyImage:Joi.number().example(1).description("Identifier of attachment used as fetaured image").allow(null).default(null),
    
}).label('survey-request').description('Request object for the survey')

const surveyStatusRequest: Joi.ObjectSchema = Joi.object().keys({
    status:Joi.number().integer().valid(0,1).description('Required status of the community 0-> Inactive, 1=> Active').example(1).required().error(errors=>{return Common.routeError(errors,'SURVEY_STATUS_IS_REQUIRED')}),
}).label('survey-status-request').description('Request object for the survey status')

const surveyIdentifier: Joi.ObjectSchema = Joi.object().keys({
    id:Joi.number().integer().description('Unique identifier for the survey').example(1).required().error(errors=>{return Common.routeError(errors,'SURVEY_ID_IS_REQUIRED')})
}).label('survey-identifier').description('Unique identifier for the survey')

const surveyResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:survey
}).label('survey-response-object').description('Response format for survey')

const listAllSurveysResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:Joi.array().items(survey).description("Array of survey objects")
}).label('all-surveys-response-object').description('Response format for all survey at once')

const listAllSurveysRequest:Joi.ObjectSchema = Joi.object().keys({
    communityId:Joi.number().required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') }).example(1),
    surveyType:Joi.number().description('Link to the survey').example(1).valid(1,2,3).default(1).allow(null).description('Type of survey 1=>Survey, 2=>ad servey 3=>video review'),
}).label('All-surveys-response-object').description('Request format for all surveys')

const listPaginatedSurveysRequest:Joi.ObjectSchema = Joi.object().keys({
    communityId:Joi.number().required().error(errors => { return Common.routeError(errors, 'COMMUNITY_ID_IS_REQUIRED') }).example(1),
    surveyType:Joi.number().description('Link to the survey').example(1).valid(1,2,3).default(1).allow(null).description('Type of survey 1=>Survey, 2=>ad servey 3=>video review'),
    page:Joi.number().integer().example(1).description("page number").optional().default(1),
}).label('paginated-surveys-response-object').description('Request format for surveys with pagination')

const listPaginatedSurveysResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().description("confirmation message"),
    responseData:{
        data:Joi.array().items(survey).description("Array of survey objects").example([]),
        page:Joi.number().integer().example(1).description("Current page number"),
        perPage:Joi.number().integer().example(10).description("Number of records per page"),
        totalPages:Joi.number().integer().example(10).description("Total number of pages"),
        totalRecords:Joi.number().integer().example(100).description("Total number of pages")
    }
}).label('paginated-surveys-response-object').description('Response format for surveys with pagination')



export {
    survey,
    surveyResponse,
    surveyIdentifier,
    surveyRequest,
    surveyStatusRequest,
    listAllSurveysResponse,
    listAllSurveysRequest,
    listPaginatedSurveysRequest,
    listPaginatedSurveysResponse
}
