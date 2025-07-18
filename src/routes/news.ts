import  {Common,Joi} from "../config/routeImporter";
import * as News from "../controllers/news";
import {
    newsResponse,
    newsSlugIdentifier,
    newsIdentifier,
    newsRequest,
    newsStatusRequest,
    listAllNewsRequest,
    listAllNewsResponse,
    listPaginatedNewsRequest,
    listPaginatedNewsResponse
} from "../validators/news"
import {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global"
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/news',
        handler:News.create,
        options:{
            tags: [ "api", "News" ],
            notes: "Create new News",
            description: "Create new News",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities","manage_news"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:newsRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: newsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/news/{id}',
        handler:News.getNews,
        options:{
            tags: [ "api", "News" ],
            notes: "Get news",
            description: "Get news",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:newsIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: newsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/news/bySlug/{slug}',
        handler:News.getNewsBySlug,
        options:{
            tags: [ "api", "News" ],
            notes: "Get news by slug",
            description: "Get news by slug",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:newsSlugIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: newsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/news/{id}',
        handler:News.update,
        options:{
            tags: [ "api", "News" ],
            notes: "Update news",
            description: "Update news",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:newsIdentifier,
                payload:newsRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: newsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/news/{id}',
        handler:News.destroy,
        options:{
            tags: [ "api", "News" ],
            notes: "Delete news",
            description: "Delete news",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:newsIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: newsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/news/listAll',
        handler:News.listAllNews,
        options:{
            tags: [ "api", "News" ],
            notes: "Get all news",
            description: "Get all news",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                query:listAllNewsRequest,
                validator: Joi
            },
            response: {
                status: {
                    200: listAllNewsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/news/list',
        handler:News.listNews,
        options:{
            tags: [ "api", "News" ],
            notes: "Get news with pagination",
            description: "Get news with pagination",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listPaginatedNewsRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listPaginatedNewsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]