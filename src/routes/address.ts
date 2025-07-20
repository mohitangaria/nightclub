import { Common, Joi } from "../config/routeImporter";
import * as Controller from "../controllers/address";
import { addAddressRequest, filterAddressRequest } from "../validators/address";
// import { otpResponse, userResponse } from "../validators/users";
import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500, identifierRequest } from "../validators/global";
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/address',
        handler:Controller.addAddress,
        options:{
            tags: [ "api", "Address" ],
            notes: "allow user to add address",
            description: "allow user to add address",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:addAddressRequest,
                failAction: async (req:any, h:any, err:any) => {
                    return Common.FailureError(err, req);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: loginWithMobileResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/address/{id}',
        handler:Controller.updateAddress,
        options:{
            tags: [ "api", "Address" ],
            notes: "allow user to update address",
            description: "allow user to update address",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                params: identifierRequest,
                payload:addAddressRequest,
                failAction: async (req:any, h:any, err:any) => {
                    return Common.FailureError(err, req);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: loginWithMobileResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/address/{id}',
        handler:Controller.fetchAddress,
        options:{
            tags: [ "api", "Address" ],
            notes: "allow user to get address by id",
            description: "allow user to get address by id",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:identifierRequest,
                failAction: async (req:any, h:any, err:any) => {
                    return Common.FailureError(err, req);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: loginWithMobileResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/address/user-address',
        handler:Controller.fetchUserAddress,
        options:{
            tags: [ "api", "Address" ],
            notes: "allow user to get address by id",
            description: "allow user to get address by id",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                query: filterAddressRequest,
                failAction: async (req:any, h:any, err:any) => {
                    return Common.FailureError(err, req);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: loginWithMobileResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/user/{id}/address',
        handler:Controller.fetchUserAddress,
        options:{
            tags: [ "api", "Address" ],
            notes: "allow user to get address by id",
            description: "allow user to get address by id",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:identifierRequest,
                query: filterAddressRequest,
                failAction: async (req:any, h:any, err:any) => {
                    return Common.FailureError(err, req);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: loginWithMobileResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/address/{id}',
        handler:Controller.deleteAddress,
        options:{
            tags: [ "api", "Address" ],
            notes: "allow user to delete address",
            description: "allow user to delete address",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                params: identifierRequest,
                failAction: async (req:any, h:any, err:any) => {
                    return Common.FailureError(err, req);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: loginWithMobileResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]