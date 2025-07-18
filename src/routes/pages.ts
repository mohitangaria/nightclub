import  {Common,Joi} from "../config/routeImporter";
import * as Page from "../controllers/pages";
import {
    pageResponse,
    pageSlugIdentifier,
    pageIdentifier,
    pageRequest,
    pageStatusRequest,
    listAllPagesResponse,
    listPaginatedPagesRequest,
    listPaginatedPagesResponse
} from "../validators/pages"
import {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global"
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/page',
        handler:Page.create,
        options:{
            tags: [ "api", "Page" ],
            notes: "Create new Page",
            description: "Create new Page",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities","manage_pages"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:pageRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: pageResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/page/{id}',
        handler:Page.getPage,
        options:{
            tags: [ "api", "Page" ],
            notes: "Get page",
            description: "Get page",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:pageIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: pageResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/page/bySlug/{slug}',
        handler:Page.getPageBySlug,
        options:{
            tags: [ "api", "Page" ],
            notes: "Get page by slug",
            description: "Get page by slug",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:pageSlugIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: pageResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/page/{id}',
        handler:Page.update,
        options:{
            tags: [ "api", "Page" ],
            notes: "Update page",
            description: "Update page",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:pageIdentifier,
                payload:pageRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: pageResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/page/{id}',
        handler:Page.destroy,
        options:{
            tags: [ "api", "Page" ],
            notes: "Delete page",
            description: "Delete page",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:pageIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: pageResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/page/listAll',
        handler:Page.listAllPages,
        options:{
            tags: [ "api", "Page" ],
            notes: "Get all pages",
            description: "Get all pages",
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
                    200: listAllPagesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/page/list',
        handler:Page.listPages,
        options:{
            tags: [ "api", "Page" ],
            notes: "Get pages with pagination",
            description: "Get pages with pagination",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listPaginatedPagesRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listPaginatedPagesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]