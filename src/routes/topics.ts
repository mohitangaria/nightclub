import  {Common,Joi} from "../config/routeImporter";
import * as Topic from "../controllers/topics";
import {
    topicResponse,
    topicSlugIdentifier,
    topicIdentifier,
    topicRequest,
    topicStatusRequest,
    listAllTopicsRequest,
    listAllTopicsResponse,
    listPaginatedTopicsRequest,
    listPaginatedTopicsResponse
} from "../validators/topics"
import {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global"
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/topic',
        handler:Topic.create,
        options:{
            tags: [ "api", "Topic" ],
            notes: "Create new Topic",
            description: "Create new Topic",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities","manage_topics"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:topicRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: topicResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/topic/{id}',
        handler:Topic.getTopic,
        options:{
            tags: [ "api", "Topic" ],
            notes: "Get topic",
            description: "Get topic",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:topicIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: topicResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/topic/bySlug/{slug}',
        handler:Topic.getTopicBySlug,
        options:{
            tags: [ "api", "Topic" ],
            notes: "Get topic",
            description: "Get topic",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:topicSlugIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: topicResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/topic/{id}',
        handler:Topic.update,
        options:{
            tags: [ "api", "Topic" ],
            notes: "Update topic",
            description: "Update topic",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:topicIdentifier,
                payload:topicRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: topicResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/topic/status/{id}',
        handler: Topic.updateStatus,
        options: {
            tags: ["api", "Topic"],
            notes: "Update topic status",
            description: "Update topic status",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: topicIdentifier,
                payload: topicStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: topicResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/topic/{id}',
        handler:Topic.destroy,
        options:{
            tags: [ "api", "Topic" ],
            notes: "Delete topic",
            description: "Delete topic",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:topicIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: topicResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/topic/listAll',
        handler:Topic.listAllTopics,
        options:{
            tags: [ "api", "Topic" ],
            notes: "Get all topics",
            description: "Get all topics",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listAllTopicsRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listAllTopicsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/topic/list',
        handler:Topic.listTopics,
        options:{
            tags: [ "api", "Topic" ],
            notes: "Get topics with pagination",
            description: "Get topics with pagination",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listPaginatedTopicsRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listPaginatedTopicsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]