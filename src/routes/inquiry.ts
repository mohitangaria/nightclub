import { Common, Joi } from "../config/routeImporter";
import * as inquiry from "../controllers/inquiry";
import {
  authorizedheaders,
  headers,
  options,
  validator,
  resp400,
  resp500
} from "../validators/global";

import {
  inquiryIdentity,
  inquiryRequest,
  listInquiryRequest,
  inquiryStatusRequest
} from "../validators/inquiry";

module.exports = [
  {
    method: 'POST',
    path: '/inquiry',
    handler: inquiry.createInquiry,
    options: {
      tags: ["api", "Inquiry"],
      notes: "Create a new Inquiry",
      description: "Create a new Inquiry",
      auth: { strategy: 'jwt', scope: ['admin', 'manage_inquiry', 'create_inquiry'] },
      validate: {
        headers: authorizedheaders,
        options: options,
        payload: inquiryRequest,
        failAction: async (request: any, h: any, error: any) => {
          return Common.FailureError(error, request);
        },
        validator: validator
      },
      response: {
        status: {
          // 200: inquiryResponse,
          400: resp400,
          500: resp500
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/inquiry/{id}',
    handler: inquiry.getInquiryById,
    options: {
      tags: ["api", "Inquiry"],
      notes: "Get Inquiry by ID",
      description: "Get Inquiry by ID",
      auth: { strategy: 'jwt', scope: ['admin', 'manage_inquiry', 'read_inquiry'] },
      validate: {
        headers: authorizedheaders,
        options: options,
        params: inquiryIdentity,
        failAction: async (request: any, h: any, error: any) => {
          return Common.FailureError(error, request);
        },
        validator: validator
      },
      response: {
        status: {
          // 200: inquiryResponse,
          400: resp400,
          500: resp500
        }
      }
    }
  },
  {
    method: 'PATCH',
    path: '/inquiry/{id}',
    handler: inquiry.updateInquiry,
    options: {
      tags: ["api", "Inquiry"],
      notes: "Update Inquiry",
      description: "Update Inquiry",
      auth: { strategy: 'jwt', scope: ['admin', 'manage_inquiry', 'update_inquiry'] },
      validate: {
        headers: authorizedheaders,
        options: options,
        params: inquiryIdentity,
        payload: inquiryRequest,
        failAction: async (request: any, h: any, error: any) => {
          return Common.FailureError(error, request);
        },
        validator: validator
      },
      response: {
        status: {
          // 200: inquiryResponse,
          400: resp400,
          500: resp500
        }
      }
    }
  },
  {
    method: 'DELETE',
    path: '/inquiry/{id}',
    handler: inquiry.deleteInquiry,
    options: {
      tags: ["api", "Inquiry"],
      notes: "Delete Inquiry",
      description: "Delete Inquiry",
      auth: { strategy: 'jwt', scope: ['admin', 'manage_inquiry', 'delete_inquiry'] },
      validate: {
        headers: authorizedheaders,
        options: options,
        params: inquiryIdentity,
        failAction: async (request: any, h: any, error: any) => {
          return Common.FailureError(error, request);
        },
        validator: validator
      },
      response: {
        status: {
          // 200: inquiryResponse,
          400: resp400,
          500: resp500
        }
      }
    }
  },
  {
    method: 'PATCH',
    path: '/inquiry/{id}/status',
    handler: inquiry.updateInquiryStatus,
    options: {
      tags: ["api", "Inquiry"],
      notes: "Update Inquiry Status",
      description: "Update Inquiry Status",
      auth: { strategy: 'jwt', scope: ['admin', 'manage_inquiry', 'update_inquiry'] },
      validate: {
        headers: authorizedheaders,
        options: options,
        params: inquiryIdentity,
        payload: inquiryStatusRequest,
        failAction: async (request: any, h: any, error: any) => {
          return Common.FailureError(error, request);
        },
        validator: validator
      },
      response: {
        status: {
          // 200: inquiryResponse,
          400: resp400,
          500: resp500
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/inquiry/list',
    handler: inquiry.getAllInquiriesForAdmin,
    options: {
      tags: ["api", "Inquiry"],
      notes: "List Inquiries for Admin",
      description: "List Inquiries for Admin",
      auth: { strategy: 'jwt', scope: ['admin', 'manage_inquiry'] },
      validate: {
        headers: authorizedheaders,
        options: options,
        query: listInquiryRequest,
        failAction: async (request: any, h: any, error: any) => {
          return Common.FailureError(error, request);
        },
        validator: validator
      },
      response: {
        status: {
          // 200: listInquiryResponse,
          400: resp400,
          500: resp500
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/inquiry/user/list',
    handler: inquiry.getAllInquiriesForUser,
    options: {
      tags: ["api", "Inquiry"],
      notes: "List Inquiries for User",
      description: "List Inquiries for User",
      auth: { strategy: 'jwt' },
      validate: {
        headers: authorizedheaders,
        options: options,
        query: listInquiryRequest,
        failAction: async (request: any, h: any, error: any) => {
          return Common.FailureError(error, request);
        },
        validator: validator
      },
      response: {
        status: {
          // 200: listInquiryResponse,
          400: resp400,
          500: resp500
        }
      }
    }
  }
];
