import { Common, Joi } from "../config/routeImporter";
import * as post from "../controllers/posts";
import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500, identifierRequest } from "../validators/global";


import {
    postIdentity,
    postDeleteResponse,
    postRequest,
    postResponse,
    postsResponse,
    listPostRequest,
    listPostResponse,
    postStatusRequest,
    listPostPublicRequest,
    postSulgIdentity
} from "../validators/posts";

module.exports=[
    {
        method: 'POST',
        path: '/post',
        handler:post.create,
        options:{
            tags: ["api", "Posts"],
            notes: "Create a new post",
            description: "Create new post",
            auth: { strategy: 'jwt', scope: ['admin','manage_posts','create_post'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: postRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: postResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/post/{id}',
        handler:post.get,
        options:{
            tags: ["api", "Posts"],
            notes: "Get post by id",
            description: "Get post",
            auth: { strategy: 'jwt', scope: ['admin','manage_post','update_post'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: postIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: postResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/post/public/{slug}',
        handler:post.getBySlug,
        options:{
            tags: ["api", "Posts"],
            notes: "Get post by slug",
            description: "Get post",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                params: postSulgIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: postResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/post/{id}',
        handler:post.update,
        options:{
            tags: ["api", "Posts"],
            notes: "Update post",
            description: "Update post",
            auth: { strategy: 'jwt', scope: ['admin','manage_post','update_post'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:postIdentity,
                payload: postRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: postResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/post/{id}',
        handler:post.deletePost,
        options:{
            tags: ["api", "Posts"],
            notes: "Delete post",
            description: "Delete post",
            auth: { strategy: 'jwt', scope: ['admin','manage_post','delete_post'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:postIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: postDeleteResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/post/list',
        handler:post.list,
        options:{
            tags: ["api", "Posts"],
            notes: "List posts",
            description: "List posts",
            auth: { strategy: 'jwt', scope: ['admin','manage_post','delete_post','update_post','create_post'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listPostRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: listPostResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/post/public-list',
        handler:post.listPublicPost,
        options:{
            tags: ["api", "Posts"],
            notes: "List posts",
            description: "List posts",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                query:listPostPublicRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: listPostResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/post/{id}/status',
        handler:post.updateStatus,
        options:{
            tags: ["api", "Posts"],
            notes: "Update post status",
            description: "Update post status",
            auth: { strategy: 'jwt', scope: ['admin','manage_post','update_post'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:postIdentity,
                payload:postStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: postResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]