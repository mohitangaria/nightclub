import  {Common,Joi} from "../config/routeImporter";
import * as Poll from "../controllers/polls";
import {
    pollResponse,
    pollIdentifier,
    pollRequest,
    pollStatusRequest,
    listAllPollsResponse,
    listPaginatedPollsRequest,
    listPaginatedPollsResponse
} from "../validators/polls"
import {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global"
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/poll',
        handler:Poll.create,
        options:{
            tags: [ "api", "Poll" ],
            notes: "Create new Poll",
            description: "Create new Poll",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities","manage_polls"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:pollRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: pollResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/poll/{id}',
        handler:Poll.getPoll,
        options:{
            tags: [ "api", "Poll" ],
            notes: "Get poll",
            description: "Get poll",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:pollIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: pollResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/poll/{id}',
        handler:Poll.update,
        options:{
            tags: [ "api", "Poll" ],
            notes: "Update poll",
            description: "Update poll",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:pollIdentifier,
                payload:pollRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: pollResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/poll/{id}',
        handler:Poll.destroy,
        options:{
            tags: [ "api", "Poll" ],
            notes: "Delete poll",
            description: "Delete poll",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:pollIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: pollResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/poll/listAll',
        handler:Poll.listAllPolls,
        options:{
            tags: [ "api", "Poll" ],
            notes: "Get all polls",
            description: "Get all polls",
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
                    200: listAllPollsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/poll/list',
        handler:Poll.listPolls,
        options:{
            tags: [ "api", "Poll" ],
            notes: "Get polls with pagination",
            description: "Get polls with pagination",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listPaginatedPollsRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listPaginatedPollsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]