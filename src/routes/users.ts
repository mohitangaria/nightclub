import  {Common,Joi} from "../config/routeImporter";
import * as User from "../controllers/users";
import {
    login,
    createUserRequest,
    createUserResponse
} from "../validators/users"
import {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global"
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/login',
        handler:User.login,
        options:{
            tags: [ "api", "User" ],
            notes: "Authenticate user with possible authentication methods",
            description: "User Authentication",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload:login,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    // 200: loginResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    },
    {
        method: 'POST',
        path: '/createAccount',
        handler:User.createAccount,
        options:{
            tags: [ "api", "User" ],
            notes: "Create new account for the system",
            description: "Create Account",
            auth: {strategies: ['jwt'], scope: ["admin","manage_users"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:createUserRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: createUserResponse,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]