import { Common, Joi } from "../config/routeImporter";
import * as brand from "../controllers/brands";
import { brandRequest, brandIdentity, brandStatusRequest, listBrandRequest } from "../validators/brands";
import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500, identifierRequest } from "../validators/global";
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/brand',
        handler:brand.create,
        options:{
            tags: ["api", "Brand"],
            notes: "Create a new brand to be used in products",
            description: "Create new brand",
            auth: { strategy: "jwt", scope: ['admin','manage_brand','create_brand'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: brandRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    //200: categoryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },

    {
        method: 'GET',
        path: '/brand/{id}',
        handler:brand.getBrand,
        options:{
            tags: ["api", "Brand"],
            notes: "Get brand by id",
            description: "Get brand",
            auth: { strategy: "jwt", scope: ['admin','manage_brand'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: brandIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    //200: categoryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },

    {
        method: 'GET',
        path: '/brand',
        handler:brand.list,
        options:{
            tags: ["api", "Brand"],
            notes: "List brands",
            description: "List brands",
            auth: { strategy: "jwt", scope: ['admin','manage_brand','delete_brand','update_brand','create_brand'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                query: listBrandRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    //200: listCategoryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },

    {
        method: 'PATCH',
        path: '/brand/{id}',
        handler:brand.update,
        options:{
            tags: ["api", "Brand"],
            notes: "Update brand",
            description: "Update brand",
            auth: { strategy: "jwt", scope: ['admin','manage_brand','update_brand'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: brandIdentity,
                payload: brandRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    //200: categoryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },

    {
        method: 'PATCH',
        path: '/brand/{id}/status',
        handler:brand.updateStatus,
        options:{
            tags: ["api", "Brand"],
            notes: "Update brand status",
            description: "Update brand status",
            auth: { strategy: "jwt", scope: ['admin','manage_brand','update_brand'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:brandIdentity,
                payload:brandStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    //200: categoryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },

    {
        method: 'DELETE',
        path: '/brand/{id}',
        handler:brand.deleteBrand,
        options:{
            tags: ["api", "Brand"],
            notes: "Delete brand",
            description: "Delete brand",
            auth: { strategy: "jwt", scope: ['admin','manage_brand','delete_brand'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:brandIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    //200: categoryDeleteResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
]