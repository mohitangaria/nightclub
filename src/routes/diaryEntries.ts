import  {Common,Joi} from "../config/routeImporter";
import * as DiaryEntries from "../controllers/diaryEntries";
import {
    diaryEntryResponse,
    diaryEntryIdentifier,
    diaryEntryRequest,
    diaryEntryStatusRequest,
    listPaginatedDiaryEntriesRequest,
    listPaginatedDiaryEntriesResponse
} from "../validators/diaryEntries"
import {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global"
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/diaryEntry',
        handler:DiaryEntries.create,
        options:{
            tags: [ "api", "DiaryEntry" ],
            notes: "Create new Diary",
            description: "Create new Diary",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities","manage_diaries"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:diaryEntryRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryEntryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/diaryEntry/{id}',
        handler:DiaryEntries.getDiary,
        options:{
            tags: [ "api", "DiaryEntry" ],
            notes: "Get diaryEntry",
            description: "Get diaryEntry",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:diaryEntryIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryEntryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/diaryEntry/{id}',
        handler:DiaryEntries.update,
        options:{
            tags: [ "api", "DiaryEntry" ],
            notes: "Update diaryEntry",
            description: "Update diaryEntry",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:diaryEntryIdentifier,
                payload:diaryEntryRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryEntryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'PATCH',
        path: '/diaryEntry/status/{id}',
        handler: DiaryEntries.updateStatus,
        options: {
            tags: ["api", "DiaryEntry"],
            notes: "Update diaryEntry status",
            description: "Update diaryEntry status",
            auth: { strategies: ['jwt'], scope: ["admin", "manage_communities"] },
            validate: {
                headers: authorizedheaders,
                options: options,
                params: diaryEntryIdentifier,
                payload: diaryEntryStatusRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryEntryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'DELETE',
        path: '/diaryEntry/{id}',
        handler:DiaryEntries.destroy,
        options:{
            tags: [ "api", "DiaryEntry" ],
            notes: "Delete diaryEntry",
            description: "Delete diaryEntry",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                params:diaryEntryIdentifier,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: diaryEntryResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'GET',
        path: '/diaryEntry/list',
        handler:DiaryEntries.listDiaryEntries,
        options:{
            tags: [ "api", "DiaryEntry" ],
            notes: "Get diaries with pagination",
            description: "Get diaries with pagination",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                query:listPaginatedDiaryEntriesRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    //200: listPaginatedDiaryEntriesResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]