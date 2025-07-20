import { Common, Joi } from "../config/routeImporter";
import * as Controller from "../controllers/shops";
import { createShopRequest, listShopRequest, shopSettingsRequest, generateUrlRequest } from "../validators/shops";

import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500, identifierRequest, changeStatusRequest } from "../validators/global";

module.exports = [
    {
        method: 'POST',
        path: '/shop',
        handler: Controller.create,
        options: {
            tags: ["api", "Shop"],
            notes: "Creates a new shop with the provided details. Requires JWT authentication with either 'admin' or 'seller' scope. Validates and processes the request to create a shop.",
            description: "Create shop with general details",
            auth: {strategy: "jwt", scope: ["admin", "seller"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: createShopRequest,
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
        path: '/shop/{id}',
        handler: Controller.update,
        options: {
            tags: ["api", "Shop"],
            notes: "Updates the details of an existing shop identified by its ID. Requires JWT authentication with either 'admin' or 'seller' scope. The request must include the shop ID as a path parameter and the updated details in the payload.",
            description: "Update shop with general details",
            auth: {strategy: "jwt", scope: ["admin", "seller"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: createShopRequest,
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
        path: '/shop/{id}',
        handler: Controller.get,
        options: {
            tags: ["api", "Shop"],
            notes: "Retrieves the details of a specific shop identified by its ID. Requires JWT authentication. The shop ID must be provided as a path parameter.",
            description: "Fetch details of a shop by its ID.",
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
        path: '/shops',
        handler: Controller.list,
        options: {
            tags: ["api", "Shop"],
            notes: "Retrieves a list of shops with optional filters for user ID, search text, and pagination. Requires JWT authentication.",
            description: "Fetch a list of shops based on optional query parameters",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                query: listShopRequest,
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
        path: '/user/{id}/shops',
        handler: Controller.listUserShops,
        options: {
            tags: ["api", "Shop"],
            notes: "Retrieves a list of shops associated with a specific user ID. Requires JWT authentication.",
            description: "Fetch a list of shops for a user identified by their user ID.",
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
        path: '/shops/user',
        handler: Controller.listUserShops,
        options: {
            tags: ["api", "Shop"],
            notes: "Retrieves a list of shops associated with the currently authenticated user. Requires JWT authentication.",
            description: "Fetch a list of shops belonging to the currently logged-in user.",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
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
        path: '/shop/{id}/status',
        handler: Controller.changeStatus,
        options: {
            tags: ["api", "Shop"],
            notes: "Updates the status of a specific shop identified by its ID. Requires JWT authentication and admin or seller privileges.",
            description: "Change the status of a shop, where the status can be set to active, inactive, or any other defined state.",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: changeStatusRequest,
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
        method: 'PATCH',
        path: '/shop/{id}/featured',
        handler: Controller.changefeatured,
        options: {
            tags: ["api", "Shop"],
            notes: "Updates the featured status of a specific shop identified by its ID. Requires JWT authentication and admin or seller privileges.",
            description: "Toggle the featured status of a shop. The endpoint sets the shop as featured or not featured based on the provided data.",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: changeStatusRequest,
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
        method: 'PATCH',
        path: '/shop/{id}/settings',
        handler: Controller.shopSettings,
        options: {
            tags: ["api", "Shop"],
            notes: "Updates the settings of a specific shop identified by its ID. Requires JWT authentication and admin or seller privileges.",
            description: "Update the settings of a shop, including various configurations such as slot settings and other shop-specific options.",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: shopSettingsRequest,
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
        method: 'POST',
        path: '/shop/generate-url',
        handler: Controller.generateUrlForShop,
        options: {
            tags: ["api", "Shop"],
            notes: "Generates a URL based on the provided subdomain code for a shop. Requires JWT authentication.",
            description: "Generates a unique URL for a shop using the given subdomain code. The URL will be used for accessing the shop's page.",
            auth: {strategy: "jwt"},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: generateUrlRequest,
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