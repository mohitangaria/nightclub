import  {Common,Joi} from "../config/routeImporter";
import * as Survey from "../controllers/surveys";
import {
    surveyResponse,
    surveyIdentifier,
    surveyRequest,
    surveyStatusRequest,
    listAllSurveysResponse,
    listPaginatedSurveysRequest,
    listPaginatedSurveysResponse
} from "../validators/surveys"
import {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global"
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/survey',
        handler:Survey.create,
        options:{
            tags: [ "api", "Survey" ],
            notes: "Create new Survey",
            description: "Create new Survey",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities","manage_surveys"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:surveyRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: surveyResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/survey/{id}',
        handler:Survey.getSurvey,
        options:{
            tags: [ "api", "Survey" ],
            notes: "Get survey",
            description: "Get survey",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:surveyIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: surveyResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/survey/{id}',
        handler:Survey.update,
        options:{
            tags: [ "api", "Survey" ],
            notes: "Update survey",
            description: "Update survey",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:surveyIdentifier,
                payload:surveyRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: surveyResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/survey/{id}',
        handler:Survey.destroy,
        options:{
            tags: [ "api", "Survey" ],
            notes: "Delete survey",
            description: "Delete survey",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:surveyIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: surveyResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/survey/listAll',
        handler:Survey.listAllSurveys,
        options:{
            tags: [ "api", "Survey" ],
            notes: "Get all surveys",
            description: "Get all surveys",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listAllSurveysResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/survey/list',
        handler:Survey.listSurveys,
        options:{
            tags: [ "api", "Survey" ],
            notes: "Get surveys with pagination",
            description: "Get surveys with pagination",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listPaginatedSurveysRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listPaginatedSurveysResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]