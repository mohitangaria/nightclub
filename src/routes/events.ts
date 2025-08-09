import {Common,Joi} from "../config/routeImporter" ;
import {authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global" 
import * as events from "../controllers/event" ;
module.exports=[ 
	{
		method : "GET",
		path : "/events",
		handler : events.listAllEvents,
		options: {
			tags: ["api", "Events"],
			notes: "Endpoint to list events",
			description:"List events",
			auth: {strategies: ['jwt']},
			validate: {
				headers: authorizedheaders,
				options:options,
				failAction: async (req:any, h:any, err:any) => {
					return Common.FailureError(err, req);
				},
				validator: validator
			}
		}
	},

]