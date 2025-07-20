import { Common, Joi } from "../config/routeImporter";
import * as Controller from "../controllers/bankDetails";
import { addBankDetailsRequest } from "../validators/bankDetails";

import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500, identifierRequest, changeStatusRequest } from "../validators/global";

module.exports = [
    {
        method: 'POST',
        path: '/bank-detail',
        handler: Controller.create,
        options: {
            tags: ["api", "Bank Details"],
            notes: "This endpoint allows users to submit their bank details for processing. It is used by both admins and sellers to provide their banking information.",
            description: "Submit bank details for a user.",
            auth: {strategy: "jwt", scope: ["admin", "seller"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: addBankDetailsRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/bank-detail/{id}',
        handler: Controller.update,
        options: {
            tags: ["api", "Bank Details"],
            notes: "This endpoint allows users to update their existing bank details. It is used by both admins and sellers to modify banking information.",
            description: "Update the bank details for a specific user.",
            auth: {strategy: "jwt", scope: ["admin", "seller"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: addBankDetailsRequest,
                params: identifierRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/bank-detail/{id}',
        handler: Controller.get,
        options: {
            tags: ["api", "Bank Details"],
            notes: "Retrieve the bank details for a specific user. This endpoint allows users or admins to view existing bank details associated with a user's account.",
            description: "Fetch the bank details for a specific user by ID.",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                params: identifierRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/bank-details',
        handler: Controller.list,
        options: {
            tags: ["api", "Bank Details"],
            notes: "Retrieve a list of all bank details associated with user accounts. This endpoint allows users or admins to view all available bank details.",
            description: "Fetch a list of all bank details.",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                // query: listShopRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/bank-detail/{id}',
        handler: Controller.remove,
        options: {
            tags: ["api", "Bank Details"],
            notes: "This endpoint allows for the deletion of a specific bank detail record by its ID. Only admins or authorized users can perform this operation.",
            description: "Delete a bank detail record by its ID.",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                params: identifierRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: otpResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]