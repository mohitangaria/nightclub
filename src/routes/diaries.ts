import  {Common,Joi} from "../config/routeImporter";
import * as Diary from "../controllers/diaries";
import {
    diaryResponse,
    diarySlugIdentifier,
    diaryIdentifier,
    diaryRequest,
    diaryStatusRequest,
    listAllDiariesRequest,
    listAllDiariesResponse,
    listPaginatedDiarysRequest,
    listPaginatedDiarysResponse
} from "../validators/diary"
import {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global"
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/diary',
        handler:Diary.create,
        options:{
            tags: [ "api", "Diary" ],
            notes: "Create new Diary",
            description: "Create new Diary",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities","manage_diaries"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:diaryRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/diary/{id}',
        handler:Diary.getDiary,
        options:{
            tags: [ "api", "Diary" ],
            notes: "Get diary",
            description: "Get diary",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:diaryIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/diary/bySlug/{slug}',
        handler:Diary.getDiaryBySlug,
        options:{
            tags: [ "api", "Diary" ],
            notes: "Get diary",
            description: "Get diary",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:diarySlugIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/diary/{id}',
        handler:Diary.update,
        options:{
            tags: [ "api", "Diary" ],
            notes: "Update diary",
            description: "Update diary",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:diaryIdentifier,
                payload:diaryRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/diary/status/{id}',
        handler: Diary.updateStatus,
        options: {
            tags: ["api", "Diary"],
            notes: "Update diary status",
            description: "Update diary status",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: diaryIdentifier,
                payload: diaryStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/diary/{id}',
        handler:Diary.destroy,
        options:{
            tags: [ "api", "Diary" ],
            notes: "Delete diary",
            description: "Delete diary",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:diaryIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/diary/listAll',
        handler:Diary.listAllDiaries,
        options:{
            tags: [ "api", "Diary" ],
            notes: "Get all diaries",
            description: "Get all diaries",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listAllDiariesRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listAllDiariesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/diary/list',
        handler:Diary.listDiaries,
        options:{
            tags: [ "api", "Diary" ],
            notes: "Get diaries with pagination",
            description: "Get diaries with pagination",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listPaginatedDiarysRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: listPaginatedDiarysResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]