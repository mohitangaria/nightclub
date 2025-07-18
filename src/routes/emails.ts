import {Common,Joi} from "../config/routeImporter" ;
import {authorizedheaders,headers,options,validator,respmessage,resp400,resp500} from "../validators/global" 
import * as emails from "../controllers/emails" ;
const {
    emailTemplateRequest,
    emailTemplteIdentity,
    emailTemplate,
	emailTemplateListRequest,
	emailTemplateStatusRequest
}=require("../validators/emails")
module.exports=[ 
    {
		method : "POST",
		path : "/email/template",
		handler : emails.create,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to define a new email template for portal",
			description:"Create email template",
			auth: {strategies: ['jwt'], scope: ["admin","create_email_templates","manage_email_templates"]},
			validate: {
				headers:authorizedheaders,
				options: options,
				payload: emailTemplateRequest,
				failAction: async (req:any, h:any, err:any) => {
					return Common.FailureError(err, req);
				},
				validator: validator
			}
		}
	},
	{
		method : "GET",
		path : "/email/template/{id}",
		handler : emails.get,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to get defined email template by code",
			description:"Get email template",
			auth: {strategies: ['jwt'], scope: ["admin","view_email_templates","list_email_templates","manage_email_templates"]},
			validate: {
				headers: authorizedheaders,
				options: options,
				params: emailTemplteIdentity,
				failAction: async (request:any, h:any, err:any) => {
					return Common.FailureError(err, request);
				},
				validator: validator
			}
		}
	},
	{
		method : "PATCH",
		path : "/email/template/{id}",
		handler : emails.update,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to update defined email template for portal by id",
			description:"Update email template",
			auth: {strategies: ['jwt'], scope: ["admin","update_email_templates","manage_email_templates"]},
			validate: {
				headers: authorizedheaders,
				options: options,
                params:emailTemplteIdentity,
				payload: emailTemplateRequest,
				failAction: async (req:any, h:any, err:any) => {
					return Common.FailureError(err, req);
				},
				validator: validator
			}
		}
	},
	{
		method : "DELETE",
		path : "/email/template/{id}",
		handler : emails.deleteTemplate,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to remove defined email template from the portal by id",
			description:"Remove email template",
			auth: {strategies: ['jwt'], scope: ["admin","delete_email_templates","manage_email_templates"]},
			validate: {
				headers: authorizedheaders,
				options: options,
				params:emailTemplteIdentity,
				failAction: async (req:any, h:any, err:any) => {
					return Common.FailureError(err, req);
				},
				validator: validator
			}
		}
	},
	{
		method : "GET",
		path : "/email/template/list",
		handler : emails.list,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to list defined email template for portal",
			description:"List email templates",
			auth: {strategies: ['jwt'], scope: ["admin","list_email_templates","manage_email_templates"]},
			validate: {
				headers: authorizedheaders,
				options:options,
				query: emailTemplateListRequest,
				failAction: async (req:any, h:any, err:any) => {
					return Common.FailureError(err, req);
				},
				validator: validator
			}
		}
	},
	{
		method : "POST",
		path : "/email/send",
		handler : emails.sendMail,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to send test email",
			description:"Send test email",
			auth: {strategies: ['jwt'], scope: ["admin","manage_email_templates","send_test_email"]},
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
	{
		method : "PATCH",
		path : "/email/template/{id}/status",
		handler : emails.updateStatus,
		options: {
			tags: ["api", "Email"],
			notes: "Endpoint to update defined email template for portal by id",
			description:"Update email template status",
			auth: {strategies: ['jwt'], scope: ["admin","update_email_templates_status","manage_email_templates"]},
			validate: {
				headers: authorizedheaders,
				options: options,
                params:emailTemplteIdentity,
				payload: emailTemplateStatusRequest,
				failAction: async (req:any, h:any, err:any) => {
					return Common.FailureError(err, req);
				},
				validator: validator
			}
		}
	}
]