import { Common, Joi } from "../config/routeImporter";
import * as Support from "../controllers/support";
import {  createSupportRequest, adminReplyRequest, fetchSupportListRequest} from "../validators/support";
import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500, identifierRequest } from "../validators/global";
const isAuthorized = false

module.exports = [
    {
        method: 'POST',
        path: '/support/ticket',
        handler: Support.createSupportTicket,
        options: {
          tags: ["api", "Support"],
          notes: "User creates a support ticket.",
          description: "Create Support Ticket",
          auth: false,
          validate: {
            headers: headers,
            options: options,
            payload: createSupportRequest,
            failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
            validator: Joi
          },
          response: {
            status: {
              400: resp400,
              500: resp500
            }
          }
        }
    },
    {
        method: 'GET',
        path: '/support/tickets',
        handler: Support.getUserTickets,
        options: {
          tags: ["api", "Support"],
          notes: "Get user's support tickets.",
          description: "Get Support Tickets",
          auth: false,
          validate: {
            headers: headers,
            options: options,
            failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
            validator: Joi
          },
          response: {
            status: {
              400: resp400,
              500: resp500
            }
          }
        }
    },
    {
        method: 'GET',
        path: '/support/ticket/{id}',
        handler: Support.getTicketById,
        options: {
          tags: ["api", "Support"],
          notes: "Get a specific support ticket.",
          description: "Get Single Support Ticket",
          auth: false,
          validate: {
            headers: headers,
            options: options,
            params: identifierRequest,
            failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
            validator: Joi
          },
          response: {
            status: {
              400: resp400,
              500: resp500
            }
          }
        }
    },
    {
        method: 'GET',
        path: '/admin/support/tickets',
        handler: Support.getAllSupportTickets,
        options: {
            tags: ["api", "Support"],
            notes: "Get all support tickets with pagination and filters",
            description: "Admin Get All Support Tickets",
            auth: false,
            validate: {
                headers: headers,
                options: options,
                query: fetchSupportListRequest,
                failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
                validator: Joi
            },
            response: {
                status: {
                    400: resp400,
                    500: resp500
                }
            }
        }
    },    
    {
        method: 'PUT',
        path: '/support/ticket/{id}/reply',
        handler: Support.adminReplyToTicket,
        options: {
          tags: ["api", "Support"],
          notes: "Admin replies to support ticket.",
          description: "Admin Reply to Ticket",
          auth: false,
          validate: {
            headers: headers,
            options: options,
            params: identifierRequest,
            payload: adminReplyRequest,
            failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
            validator: Joi
          },
          response: {
            status: {
              400: resp400,
              500: resp500
            }
          }
        }
    },
    {
        method: 'DELETE',
        path: '/admin/support/ticket/{id}',
        handler: Support.deleteSupportTicket,
        options: {
          tags: ["api", "Support"],
          notes: "Delete support ticket by user.",
          description: "Delete Support Ticket",
          auth: false,
          validate: {
            headers: headers,
            options: options,
            params: identifierRequest,
            failAction: async (request: any, h: any, error: any) => {
                    return Common.FailureError(error, request);
                },
            validator: Joi
          },
          response: {
            status: {
              400: resp400,
              500: resp500
            }
          }
        }
      }
      

      
      
      
      
]