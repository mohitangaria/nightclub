'use strict';
import * as appVersion from "../controllers/appVersion";
import { Common, Joi } from '../config/routeImporter';
import { appVersionRequest, appVersionResponse } from "../validators/appVersion";
import { RouteType } from '../config/interfaces';
const validator = Joi;
const { authorizedheaders, optional_authorizedheaders, headers, options, respmessage, resp400, resp500 } = require("../validators/global")
const routes: RouteType[] = [
    // {
    //     method: 'GET',
    //     path: '/app/version',
    //     handler: appVersion.getAppVersion,
    //     options: {
    //         tags: [
    //             "api", "VERSION",
    //         ],
    //         notes: "Get current app version",
    //         description: "Get current app version",
    //         auth: false,
    //         validate: {
    //             headers: headers,
    //             options: options,
    //             failAction: async (req, h, err) => {
    //                 return Common.FailureError(err, req);
    //             },
    //             validator: validator,
    //         },
    //         response: {
    //             status: {
    //                 200: appVersionResponse,
    //                 400: resp400,
    //                 500: resp500
    //             }
    //         }
    //     }
    // },
    // {
    //     method: 'PATCH',
    //     path: '/app/version',
    //     handler: appVersion.setAppVersion,
    //     options: {
    //         tags: [
    //             "api", "VERSION",
    //         ],
    //         notes: "Update app version",
    //         description: "Update app version",
    //         auth: { strategies: ['jwt'], scope: ['admin'] },
    //         validate: {
    //             headers: authorizedheaders,
    //             options: options,
    //             payload: appVersionRequest,
    //             failAction: async (req: any, h: any, err: any) => {
    //                 return Common.FailureError(err, req);
    //             },
    //             validator: validator
    //         },
    //         response: {
    //             status: {
    //                 200: appVersionResponse,
    //                 400: resp400,
    //                 500: resp500
    //             }
    //         }
    //     }
    // },
]
module.exports = routes