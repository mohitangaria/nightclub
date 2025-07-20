import { Common, Joi } from "../config/routeImporter";
import * as faqs from "../controllers/faqs";
import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500, identifierRequest } from "../validators/global";
import {
    faqRequest,
    faqIdentity,
    faqResponse,
    faqDeleteResponse,
    faqsResponse,
    listFaqRequest,
    listFaqResponse,
    faqStatusRequest,
    sortRequest,
    sortResponse,
    categoryFilter
} from "../validators/faqs";

module.exports=[
    {
        method: 'POST',
        path: '/faq',
        handler:faqs.create,
        options:{
            tags: ["api", "FAQ"],
            notes: "Create a new faq entry",
            description: "Create new FAQ",
            auth: { strategy: 'jwt', scope: ['admin','manage_faqs','create_faq'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: faqRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: faqResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/faq/{id}',
        handler:faqs.get,
        options:{
            tags: ["api", "FAQ"],
            notes: "Get FAQ by id",
            description: "Get FAQ",
            auth: { strategy: 'jwt', scope: ['admin','manage_faqs','get_faqs'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: faqIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: faqResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/faq/{id}',
        handler:faqs.update,
        options:{
            tags: ["api", "FAQ"],
            notes: "update faq entry",
            description: "Ureate FAQ",
            auth: { strategy: 'jwt', scope: ['admin','manage_faqs','update_faq'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: faqIdentity,
                payload: faqRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: faqResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/faq/{id}',
        handler:faqs.deleteFaq,
        options:{
            tags: ["api", "FAQ"],
            notes: "Delete FAQ entry",
            description: "Delete FAQ",
            auth: { strategy: 'jwt', scope: ['admin','manage_faqs','delete_faq'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:faqIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: faqDeleteResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/faq/list',
        handler:faqs.list,
        options:{
            tags: ["api", "FAQ"],
            notes: "List faqs",
            description: "List FAQs",
            auth: { strategy: 'jwt', scope: ['admin','manage_faqs','list_faq'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listFaqRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: listFaqResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/faq/public-list',
        handler:faqs.publicList,
        options:{
            tags: ["api", "FAQ"],
            notes: "List faqs",
            description: "List FAQs",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                query:listFaqRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: listFaqResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/faq/setOrder/{id}',
        handler:faqs.setOrder,
        options:{
            tags: ["api", "FAQ"],
            notes: "Set Sort Order for faqs",
            description: "Order FAQs",
            auth: { strategy: 'jwt', scope: ['admin','manage_faqs','list_faq'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:faqIdentity,
                payload:sortRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: sortResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/faq/{id}/status',
        handler:faqs.updateStatus,
        options:{
            tags: ["api", "FAQ"],
            notes: "Update FAQ status",
            description: "Update FAQ status",
            auth: { strategy: 'jwt', scope: ['admin','manage_faqs','update_faq'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:faqIdentity,
                payload:faqStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: faqResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/faq',
        handler:faqs.listAll,
        options:{
            tags: ["api", "FAQ"],
            notes: "Update FAQ status",
            description: "Update FAQ status",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                query: categoryFilter,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: faqsResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]