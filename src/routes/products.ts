import { Common, Joi } from "../config/routeImporter";
import * as product from "../controllers/products";
import { productRequest, listProductRequest, productIdentity, copyGalleryIdentity, productApprovalRequest } from "../validators/products";
import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500, identifierRequest } from "../validators/global";
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/product',
        handler:product.create,
        options:{
            tags: ["api", "Product"],
            notes: "Create a new product to be used in products",
            description: "Create new product",
            auth: { strategy: "jwt", scope: ['admin', 'seller'] },
            validate: {
                // headers: authorizedheaders,
                headers: headers,
                options: options,
                payload: productRequest,
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
        path: '/product',
        handler:product.list,
        options:{
            tags: ["api", "Product"],
            notes: "List products",
            description: "List products",
            auth: { strategy: "jwt", scope: ['admin', 'seller'] },
            validate: {
                headers: headers,
                options: options,
                query: listProductRequest,
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
        method: 'GET',
        path: '/product/{id}',
        handler:product.getProduct,
        options:{
            tags: ["api", "Product"],
            notes: "Get product by id",
            description: "Get product",
            auth: { strategy: "jwt", scope: ['admin', 'seller'] },
            validate: {
                headers: headers,
                options: options,
                params: productIdentity,
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
        path: '/product/copyGallery',
        handler:product.copyGallery,
        options:{
            tags: ["api", "Product"],
            notes: "Get product by id",
            description: "Get product",
            auth: { strategy: "jwt", scope: ['admin', 'seller'] },
            validate: {
                headers: headers,
                options: options,
                query: copyGalleryIdentity,
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
        path: '/product/sendForApproval',
        handler:product.sendForApproval,
        options:{
            tags: ["api", "Product"],
            notes: "Send for admin approval",
            description: "Send for admin approval",
            auth: { strategy: "jwt", scope: ['admin', 'seller'] },
            validate: {
                headers: headers,
                options: options,
                payload: productIdentity,
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
        path: '/product/updateProductApprovalStatus',
        handler:product.updateProductApprovalStatus,
        options:{
            tags: ["api", "Product"],
            notes: "Admin update product approval status",
            description: "Admin update product approval status",
            auth: { strategy: "jwt", scope: ['admin', 'seller'] },
            validate: {
                headers: headers,
                options: options,
                payload: productApprovalRequest,
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

    // {
    //     method: 'PATCH',
    //     path: '/product/sendForApproval',
    //     handler:product.sendForApproval,
    //     options:{
    //         tags: ["api", "Product"],
    //         notes: "Send for admin approval",
    //         description: "Send for admin approval",
    //         //auth: { strategy: "jwt", scope: ['admin','manage_brand'] },
    //         auth: false,
    //         validate: {
    //             headers: headers,
    //             options: options,
    //             payload: productIdentity,
    //             failAction: async (request: any, h: any, error: any) => {
    //                 return Common.FailureError(error, request);
    //             },
    //             validator: validator
    //         },
    //         response: {
    //             status: {
    //                 //200: categoryResponse,
    //                 400: resp400,
    //                 500: resp500
    //             }
    //         }
    //     }
    // },
    
]