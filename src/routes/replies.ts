import  {Common,Joi} from "../config/routeImporter";
import * as Reply from "../controllers/replies";
import {
    replyResponse,
    replyIdentifier,
    replyRequest,
    replyStatusRequest,
    listAllRepliesRequest,
    listAllRepliesResponse,
    listPaginatedRepliesRequest,
    listPaginatedRepliesResponse
} from "../validators/replies"
import {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global"
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/reply',
        handler:Reply.create,
        options:{
            tags: [ "api", "Reply" ],
            notes: "Create a new post/reply",
            description: "Create post/reply",
            auth: {strategies: ['jwt'], scope: ["admin","manage_topics"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:replyRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: replyResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/reply/{id}',
        handler:Reply.getReply,
        options:{
            tags: [ "api", "Reply" ],
            notes: "Get post/reply",
            description: "Get post/reply",
            auth: {strategies: ['jwt'], scope: ["admin","manage_topics"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:replyIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: replyResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/reply/{id}',
        handler:Reply.update,
        options:{
            tags: [ "api", "Reply" ],
            notes: "Update post/topic",
            description: "Update topic",
            auth: {strategies: ['jwt'], scope: ["admin","manage_topics"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:replyIdentifier,
                payload:replyRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: replyResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/reply/status/{id}',
        handler: Reply.updateStatus,
        options: {
            tags: ["api", "Reply"],
            notes: "Update reply status",
            description: "Update reply status",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: replyIdentifier,
                payload: replyStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: replyResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/reply/{id}',
        handler:Reply.destroy,
        options:{
            tags: [ "api", "Reply" ],
            notes: "Delete post/topic",
            description: "Delete post/topic",
            auth: {strategies: ['jwt'], scope: ["admin","manage_topics"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:replyIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: replyResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/reply/listAll',
        handler:Reply.listAllReplies,
        options:{
            tags: [ "api", "Reply" ],
            notes: "Get all topics",
            description: "Get all topics",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                query:listAllRepliesRequest,
                validator: Joi
            },
            response: {
                status: {
                    200: listAllRepliesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/reply/list',
        handler:Reply.listReplies,
        options:{
            tags: [ "api", "Reply" ],
            notes: "Get topics with pagination",
            description: "Get topics with pagination",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listPaginatedRepliesRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listPaginatedRepliesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]