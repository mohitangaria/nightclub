import { Common, Joi } from "../config/routeImporter";
import * as Controller from "../controllers/documents";
import { generateDocumentRequest, getDocumentListRequest, slugRequest, signDocumentRequest,verifyTokenRequest } from "../validators/documents";
// import { otpResponse, userResponse } from "../validators/users";
import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500, identifierRequest } from "../validators/global";

module.exports = [
    {
        method: 'POST',
        path: '/document/generate',
        handler: Controller.generateDocument,
        options: {
            tags: ["api", "Documents"],
            notes: "Allows admins to submit required documents for seller account approval. Ensures that all necessary documentation is provided for processing.",
            description: "Submit documents for seller account approval.",
            auth: {strategy: "jwt", scope: ["admin"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: generateDocumentRequest,
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
        path: '/document/sign',
        handler: Controller.signDocument,
        options: {
            tags: ["api", "Documents"],
            notes: "Allows sellers to sign and submit the necessary documents required for account verification or approval. Ensures that the document signing process is completed securely.",
            description: "Submit signed documents for seller account verification.",
            auth: {strategy: "jwt", scope: ["seller"]},
            validate: {
                headers: authorizedheaders,
                options: options,
                payload: signDocumentRequest,
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
		method : "GET",
		path : "/document",
		handler : Controller.getDocuments,
		options: {
			tags: ["api", "Documents"],
			notes: "Retrieves a list of documents available for the current user. This endpoint allows both admin and seller users to view documents related to their accounts or submissions.",
			description:"List all documents available to the user, including those submitted and those required for account verification.",
			auth: {strategies: ['jwt'], scope: ["admin","seller"]},
			validate: {
				headers: authorizedheaders,
				options:options,
				query: getDocumentListRequest,
				failAction: async (req:any, h:any, err:any) => {
					return Common.FailureError(err, req);
				},
				validator: validator
			}
		}
	},
    {
		method : "GET",
		path : "/document/{slug}",
		handler : Controller.generateDocumentHtmlPage,
		options: {
			tags: ["api", "Documents"],
			notes: "Generates and returns an HTML page for a specific document identified by the slug parameter. This endpoint is used to view detailed information or previews of documents.",
			description:"Fetches the HTML content for a document based on the provided slug.",
			auth: false,
			validate: {
				headers: headers,
				options:options,
				params: slugRequest,
                // query: {
                //     time: Joi.string().optional().allow(null).default(null).error(errors => { return Common.routeError(errors, 'SLUG_MUST_BE_A_VALID_VALUE') }),
                // },
				failAction: async (req:any, h:any, err:any) => {
					return Common.FailureError(err, req);
				},
				validator: validator
			}
		}
	},
    {
		method : "GET",
		path : "/user/{id}/document",
		handler : Controller.getDocuments,
		options: {
			tags: ["api", "Documents"],
			notes: "Fetches a list of documents associated with a specific user identified by the user ID. This endpoint provides details on documents submitted or required for the user's profile.",
			description:"Retrieves and lists documents for a specific user based on their user ID.",
			auth: {strategies: ['jwt'], scope: ["admin"]},
			validate: {
				headers: authorizedheaders,
				options:options,
                params: identifierRequest,
				query: getDocumentListRequest,
				failAction: async (req:any, h:any, err:any) => {
					return Common.FailureError(err, req);
				},
				validator: validator
			}
		}
	},
    {
        method: 'POST',
        path: '/document/verify-token',
        handler: Controller.verifySignDocument,
        options: {
            tags: ["api", "Documents"],
            notes: "Endpoint for verifying a document signature using an OTP. This process is essential for confirming the authenticity of signed documents.",
            description: "This endpoint verifies the document signature by validating an OTP (One-Time Password) provided by the user.",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                payload: verifyTokenRequest,
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
        path: '/document/user/{id}/regenerate',
        handler: Controller.reGenerateDocument,
        options: {
            tags: ["api", "Documents"],
            notes: "Regenerate a document for a user based on the provided user ID. This endpoint is used when a new document is needed or an existing document needs to be updated.",
            description: "This endpoint regenerates a document for a specified user.",
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
    }
]