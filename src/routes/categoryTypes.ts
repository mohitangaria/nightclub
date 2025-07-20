import { Common, Joi } from "../config/routeImporter";
import * as categoryTypes from "../controllers/categoryTypes";
const {authorizedheaders,headers,options,validator,respmessage,resp400,resp500}=require("../validators/global")
// const categoryTypes=require("../controllers/categoryTypes");
import {
    categoryTypeIdentity,
    categoryTypeRequest,
    categoryTypeResponse,
    categoryTypesResponse,
    categoryTypeDeleteResponse,
    categoryTypeStatusRequest,
    listCategoryTypeRequest,
    listCategoryTypeResponse
} from "../validators/categoryTypes";

module.exports=[
    {
        method: 'POST',
        path: '/category-type',
        handler:categoryTypes.create,
        options:{
            tags: ["api", "Category Types"],
            notes: "Create a new category type to manage categories and subcategories",
            description: "Create new category type",
            auth: { strategy: 'jwt', scope: ['admin','manage_category_types','create_category_type'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: categoryTypeRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    200: categoryTypeResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/category-type/{id}',
        handler:categoryTypes.get,
        options:{
            tags: ["api", "Category Types"],
            notes: "Get category type by id",
            description: "Get category type by id",
            auth: false,
            validate: {
                headers: headers,
                params: categoryTypeIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    200: categoryTypeResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/category-type/{id}',
        handler:categoryTypes.update,
        options:{
            tags: ["api", "Category Types"],
            notes: "Update category type",
            description: "Update category type",
            auth: { strategy: 'jwt', scope: ['admin','manage_category_types','update_category_type'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:categoryTypeIdentity,
                payload: categoryTypeRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    200: categoryTypeResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/category-type/{id}',
        handler:categoryTypes.deleteCategoryType,
        options:{
            tags: ["api", "Category Types"],
            notes: "Delete category type by id",
            description: "Delete category type by id",
            auth: { strategy: 'jwt', scope: ['admin','manage_category_types','delete_category_type'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:categoryTypeIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    200: categoryTypeDeleteResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/category-type/{id}/status',
        handler:categoryTypes.updateStatus,
        options:{
            tags: ["api", "Category Types"],
            notes: "Update category status",
            description: "Update category status",
            auth: { strategy: 'jwt', scope: ['admin','manage_category_types','update_category_type'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:categoryTypeIdentity,
                payload:categoryTypeStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    200: categoryTypeResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/category-type/list',
        handler:categoryTypes.list,
        options:{
            tags: ["api", "Category Types"],
            notes: "List category types with pagination",
            description: "List category types with pagination",
            auth: { strategy: 'jwt', scope: ['admin','manage_category_types','delete_category_type','update_category_type','create_category_type'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listCategoryTypeRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    200: listCategoryTypeResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/category-types',
        handler:categoryTypes.getAll,
        options:{
            tags: ["api", "Category Types"],
            notes: "Get all category types",
            description: "Get all category types",
            auth: { strategy: 'jwt', scope: ['admin','manage_category_types','delete_category_type','update_category_type','create_category_type'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    200: categoryTypesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]