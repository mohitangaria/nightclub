import { Common, Joi } from "../config/routeImporter";
import * as Controller from "../controllers/lostAndFound";
import {
    createLostAndFoundRequest,
    listLostAndFoundRequest,
    updateLostAndFoundRequest,
    updateLostAndFoundStatusRequest,
    fetchLostAndFoundDetailsRequest,
    identifierRequest
} from "../validators/lostAndFound";

import {
  authorizedheaders,
  options,
  resp400,
  resp500
} from "../validators/global";

module.exports = [
  {
    method: 'POST',
    path: '/lost-and-found',
    handler: Controller.createRequest,
    options: {
      tags: ["api", "LostAndFound"],
      notes: "Create a lost or found item entry. Requires JWT authentication.",
      description: "Create Lost & Found entry",
      auth: { strategy: "jwt" },
      validate: {
        headers: authorizedheaders,
        options: options,
        payload: createLostAndFoundRequest,
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
    method: 'PATCH',
    path: '/lost-and-found/{id}',
    handler: Controller.updateRequest,
    options: {
      tags: ["api", "LostAndFound"],
      notes: "Update a lost or found item entry by ID. Requires JWT authentication.",
      description: "Update Lost & Found entry",
      auth: { strategy: "jwt" },
      validate: {
        headers: authorizedheaders,
        options: options,
        payload: updateLostAndFoundRequest,
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
    path: '/lost-and-found/{id}',
    handler: Controller.getById,
    options: {
      tags: ["api", "LostAndFound"],
      notes: "Get a Lost & Found entry by ID. Requires JWT authentication.",
      description: "Fetch Lost & Found entry by ID",
      auth: { strategy: "jwt" },
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
          400: resp400,
          500: resp500
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/lost-and-found',
    handler: Controller.getAll,
    options: {
      tags: ["api", "LostAndFound"],
      notes: "List all Lost & Found entries with filters and pagination. Requires JWT authentication.",
      description: "List Lost & Found entries",
      auth: { strategy: "jwt" },
      validate: {
        headers: authorizedheaders,
        options: options,
        query: listLostAndFoundRequest,
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
    path: '/lost-and-found/user',
    handler: Controller.getAllByUser,
    options: {
      tags: ["api", "LostAndFound"],
      notes: "List all Lost & Found entries with filters and pagination. Requires JWT authentication.",
      description: "List Lost & Found entries",
      auth: { strategy: "jwt" },
      validate: {
        headers: authorizedheaders,
        options: options,
        query: listLostAndFoundRequest,
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
    path: '/lost-and-found/listAll',
    handler: Controller.list,
    options: {
      tags: ["api", "LostAndFound"],
      notes: "List all Lost & Found entries with filters and pagination. Requires JWT authentication.",
      description: "List Lost & Found entries",
      auth: { strategy: "jwt" },
      validate: {
        headers: authorizedheaders,
        options: options,
        query: listLostAndFoundRequest,
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
    path: '/lost-and-found/listAll/user',
    handler: Controller.listForUser,
    options: {
      tags: ["api", "LostAndFound"],
      notes: "List all Lost & Found entries with filters and pagination. Requires JWT authentication.",
      description: "List Lost & Found entries",
      auth: { strategy: "jwt" },
      validate: {
        headers: authorizedheaders,
        options: options,
        query: listLostAndFoundRequest,
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
    method: 'PATCH',
    path: '/lost-and-found/{id}/status',
    handler: Controller.updateStatus,
    options: {
      tags: ["api", "LostAndFound"],
      notes: "Change status of a Lost & Found entry. Requires JWT authentication.",
      description: "Update status (e.g., active/inactive) of Lost & Found entry",
      auth: { strategy: "jwt" },
      validate: {
        headers: authorizedheaders,
        options: options,
        payload: updateLostAndFoundStatusRequest,
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
    method: 'DELETE',
    path: '/lost-and-found/{id}',
    handler:Controller.deleteRecord,
    options:{
        tags: ["api", "LostAndFound"],
        notes: "Delete record",
        description: "Delete record",
        auth: { strategy: 'jwt', scope: ['admin','user'] },
        validate: {
            headers: authorizedheaders,
            options: options,
            params:identifierRequest,
            failAction: async (request: any, h: any, error: any) => {
                return Common.FailureError(error, request);
            },
            validator: Joi
        },
        response: {
            status: {
                // 200: postDeleteResponse,
                400: resp400,
                500: resp500
            }
        }
    }
},

];
