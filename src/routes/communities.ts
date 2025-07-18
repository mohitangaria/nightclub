import { Common, Joi } from "../config/routeImporter";
import * as Community from "../controllers/communities";
import {
    communityResponse,
    communitySlugIdentifier,
    communityIdentifier,
    communityRequest,
    listAllCommunitiesRequest,
    communityStatusRequest,
    listAllCommunitiesResponse,
    listPaginatedCommunitiesRequest,
    listPaginatedCommunitiesResponse
} from "../validators/community"
import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500 } from "../validators/global"
const isAuthorized = false

module.exports = [
    {
        method: 'POST',
        path: '/community',
        handler: Community.create,
        options: {
            tags: ["api", "Community"],
            notes: "Create new community",
            description: "Create new community",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: communityRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: communityResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/community/{id}',
        handler: Community.getCommunity,
        options: {
            tags: ["api", "Community"],
            notes: "Get community",
            description: "Get community",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: communityIdentifier,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: communityResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/community/bySlug/{slug}',
        handler: Community.getCommunityBySlug,
        options: {
            tags: ["api", "Community"],
            notes: "Get community",
            description: "Get community",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: communitySlugIdentifier,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: communityResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/community/{id}',
        handler: Community.update,
        options: {
            tags: ["api", "Community"],
            notes: "Update community",
            description: "Update community",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: communityIdentifier,
                payload: communityRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: communityResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/community/status/{id}',
        handler: Community.updateStatus,
        options: {
            tags: ["api", "Community"],
            notes: "Update community",
            description: "Update community",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: communityIdentifier,
                payload: communityStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: communityResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/community/{id}',
        handler: Community.destroy,
        options: {
            tags: ["api", "Community"],
            notes: "Delete community",
            description: "Delete community",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: communityIdentifier,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: communityResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/community/listAll',
        handler: Community.listAllCommunities,
        options: {
            tags: ["api", "Community"],
            notes: "Get all communities",
            description: "Get all communities",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                query: listAllCommunitiesRequest,
                validator: Joi
            },
            response: {
                status: {
                    200: listAllCommunitiesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/community/list',
        handler: Community.listCommunities,
        options: {
            tags: ["api", "Community"],
            notes: "Get communities with pagination",
            description: "Get communities with pagination",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                query: listPaginatedCommunitiesRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listPaginatedCommunitiesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]