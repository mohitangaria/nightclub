import  {Common,Joi} from "../config/routeImporter";
import * as News from "../controllers/invitations";
import {
    invitation,
    invitationRequest
} from "../validators/invitation"
import {authorizedheaders,optional_authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global"
const isAuthorized = false

module.exports=[
    {
        method: 'POST',
        path: '/invitation',
        handler:News.create,
        options:{
            tags: [ "api", "News" ],
            notes: "Create new News",
            description: "Create new News",
            auth: {strategies: ['jwt'], scope: ["admin","manage_communities","manage_news"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload:invitationRequest,
                failAction: async (request:any, h:any, error:any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    200: invitation,
                    400: resp400,
                    500: resp500
                }
            }
        }
    }
]