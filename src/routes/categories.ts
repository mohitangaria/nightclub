import { Common, Joi } from "../config/routeImporter";
const {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500}=require("../validators/global")
import * as category from "../controllers/categories";
const {
    categoryIdentity,
    categoryTypeIdentity,
    categoryRequest,
    categoryResponse,
    categoriesResponse,
    categoryDeleteResponse,
    categoryStatusRequest,
    listCategoryRequest,
    listCategoryResponse,

}=require("../validators/categories")

module.exports=[
    {
        method: 'POST',
        path: '/category',
        handler:category.create,
        options:{
            tags: ["api", "Category"],
            notes: "Create a new category to manage categories and subcategories",
            description: "Create new category",
            auth: { strategy: "jwt", scope: ['admin','manageCategoryTypes','createCategoryType'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: categoryRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: categoryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/category/{id}',
        handler:category.get,
        options:{
            tags: ["api", "Category"],
            notes: "Get category by id",
            description: "Get category",
            auth: { strategy: "jwt", scope: ['admin','manageCategory','createCategory'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: categoryIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: categoryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/category/{id}',
        handler:category.update,
        options:{
            tags: ["api", "Category"],
            notes: "Update category",
            description: "Update category",
            auth: { strategy: "jwt", scope: ['admin','manageCategory','updateCategory'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:categoryIdentity,
                payload: categoryRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: categoryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/category/{id}',
        handler:category.deleteCategory,
        options:{
            tags: ["api", "Category"],
            notes: "Delete category",
            description: "Delete category",
            auth: { strategy: "jwt", scope: ['admin','manageCategory','deleteCategory'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:categoryIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: categoryDeleteResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/categories/{categoryTypeCode}',
        handler:category.getCategories,
        options:{
            tags: ["api", "Category"],
            notes: "Get categories",
            description: "Get categories by type",
            auth: { strategy: "jwt",mode: 'optional'},
            validate: {
                headers: optional_authorizedheaders,
                options: options,
                params: categoryTypeIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: categoriesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/category/{categoryTypeCode}/tree',
        handler:category.getTree,
        options:{
            tags: ["api", "Category"],
            notes: "Get categories",
            description: "Get categories by type",
            auth: { strategy: "jwt",mode: 'optional'},
            validate: {
                headers: optional_authorizedheaders,
                options: options,
                params: categoryTypeIdentity,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: categoriesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/category/list',
        handler:category.list,
        options:{
            tags: ["api", "Category"],
            notes: "List categories",
            description: "List categories",
            auth: { strategy: "jwt", scope: ['admin','manage_category','delete_category','update_category','create_category'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listCategoryRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: listCategoryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/category/{id}/status',
        handler:category.updateStatus,
        options:{
            tags: ["api", "Category"],
            notes: "Update category status",
            description: "Update category status",
            auth: { strategy: "jwt", scope: ['admin','manage_category','update_category'] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params:categoryIdentity,
                payload:categoryStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: validator
            },
            response: {
                status: {
                    // 200: categoryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
    
]