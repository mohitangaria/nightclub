import { Common, Joi } from "../config/routeImporter";
const {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500}=require("../validators/global")
import * as attributes from "../controllers/attributes";
import { 
    attributeIdentity,
    attributeRequest,
    attributeStatusRequest,

 } from "../validators/attributes";


module.exports=[{
    method: 'POST',
    path: '/attribute',
    handler:attributes.createAttribute,
    options:{
        tags: ["api", "Product Attribute"],
        notes: "Create a new attribute to be used in products",
        description: "Create a new attribute",
        auth: { strategy: "jwt", scope: ['admin'] },
        validate: {
            headers: authorizedheaders,
            options: options,
            payload: attributeRequest,
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
    path: '/attribute/{id}',
    handler:attributes.getAttribute,
    options:{
        tags: ["api", "Product Attribute"],
        notes: "Get attribute by id",
        description: "Get attribute",
        auth: { strategy: "jwt", scope: ['admin','manageCategory','createCategory'] },
        validate: {
            headers: authorizedheaders,
            options: options,
            params: attributeIdentity,
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
    path: '/attributeList',
    handler:attributes.attributeList,
    options:{
        tags: ["api", "Product Attribute"],
        notes: "List category attributes",
        description: "List category attributes",
        auth: { strategy: "jwt", scope: ['admin'] },
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
                //200: listCategoryResponse,
                400: resp400,
                500: resp500
            }
        }
    }
},

{
    method: 'PATCH',
    path: '/attribute/{id}',
    handler:attributes.updateAttribute,
    options:{
        tags: ["api", "Product Attribute"],
        notes: "Update attribute",
        description: "Update attribute",
        auth: { strategy: "jwt", scope: ['admin','manageCategory','updateCategory'] },
        validate: {
            headers: authorizedheaders,
            options: options,
            params: attributeIdentity,
            payload: attributeRequest,
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
    path: '/attribute/{id}/status',
    handler:attributes.updateAttributeStatus,
    options:{
        tags: ["api", "Product Attribute"],
        notes: "Update attribute status",
        description: "Update attribute status",
        auth: { strategy: "jwt", scope: ['admin','manage_category','update_category'] },
        validate: {
            headers: authorizedheaders,
            options: options,
            params:attributeIdentity,
            payload:attributeStatusRequest,
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
    path: '/attribute/{id}',
    handler:attributes.deleteAttribute,
    options:{
        tags: ["api", "Product Attribute"],
        notes: "Delete attribute",
        description: "Delete attribute",
        auth: { strategy: "jwt", scope: ['admin'] },
        validate: {
            headers: authorizedheaders,
            options: options,
            params: attributeIdentity,
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
}]