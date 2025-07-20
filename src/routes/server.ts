'use strict';
import * as server from "../controllers/server";
import { resp400, resp500 } from "../validators/global"
import { status } from "../validators/server";
module.exports = [
    {
        method: 'GET',
        path: '/',
        handler: server.status,
        options: {
            tags: [
                "api", "Server"
            ],
            notes: "Verification if server is running or not",
            description: "server info",
            auth: false,
            response: {
                status: {
                    200: status,
                    400: resp400,
                    500: resp500
                }
            },
        }
    }
]