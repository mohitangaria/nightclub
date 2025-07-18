import { Common, Joi } from '../config/routeImporter';
import { authorizedheaders, optional_authorizedheaders, headers, options, validator, respmessage, resp400, resp500 } from "../validators/global"
import * as attachments from '../controllers/attachements'
import {
  uploadRequest,
  uploadResponse,
  requestWithIdentifier,
  requestWithIdIdentifier,
  attachment,
  getSignedUrl,
  getSignedUrlResponse,
  decryptDataRequest
} from '../validators/attachments';

module.exports = [
  {
    method: "POST",
    path: "/attachment/upload",
    handler: attachments.upload,
    options: {
      tags: ["api", "Attachment"],
      notes: "Endpoint to upload single/multiple attachments",
      description: "Upload file",
      auth: { strategies: ['jwt'], mode: 'optional' },
      validate: {
        headers: optional_authorizedheaders,
        options: options,
        failAction: async (req: any, h: any, err: any) => {
          return Common.FailureError(err, req);
        },
        payload: uploadRequest,
        validator: validator,
      },
      response: {
        status: {
          200: uploadResponse,
          400: resp400,
          500: resp500
        }
      },
      payload: {
        maxBytes: 125000000,
        output: "stream",
        parse: true,
        multipart: true,
        timeout: 600000,
      },
      plugins: {
        'hapi-swagger': {
          payloadType: 'form',
        },
      }
    },
  },
  {
    method: "GET",
    path: "/attachment/{uniqueName}/download",
    handler: attachments.download,
    options: {
      tags: ["api", "Attachment"],
      notes: "Endpoint to download attachment",
      description: "Download file",
      auth: false,
      validate: {
        headers: headers,
        options: options,
        params: requestWithIdentifier,
        failAction: async (req: any, h: any, err: any) => {
          return Common.FailureError(err, req);
        },
        validator: validator,
      },
      response: {
        status: {
          //200: UD,
          400: resp400,
          500: resp500
        }
      },
    },
  },
  {
    method: "GET",
    path: "/attachment/{uniqueName}",
    handler: attachments.view,
    options: {
      tags: ["api", "Attachment"],
      notes: "Endpoint to view attachment",
      description: "View file",
      auth: false,
      validate: {
        headers: headers,
        options: options,
        params: requestWithIdentifier,
        failAction: async (req: any, h: any, err: any) => {
          return Common.FailureError(err, req);
        },
        validator: Joi,
      },
      response: {
        status: {
          //200: UD,
          400: resp400,
          500: resp500
        }
      },
    },
  },
  {
    method: "DELETE",
    path: "/attachment/{uniqueName}",
    handler: attachments.deleteAttachment,
    options: {
      tags: ["api", "Attachment"],
      notes: "Endpoint to remove attachment",
      description: "Delete file",
      auth: { strategies: ['jwt'] },
      validate: {
        headers: authorizedheaders,
        options: options,
        params: requestWithIdentifier,
        failAction: async (req: any, h: any, err: any) => {
          return Common.FailureError(err, req);
        },
        validator: validator,
      },
      response: {
        status: {
          //200: UD,
          400: resp400,
          500: resp500
        }
      },
    },
  },
  {
    method: "DELETE",
    path: "/attachments/{attachmentId}",
    handler: attachments.deleteAttachmentById,
    options: {
      tags: ["api", "Attachment"],
      notes: "Endpoint to remove attachment",
      description: "Delete file",
      auth: { strategies: ['jwt'] },
      validate: {
        headers: authorizedheaders,
        options: options,
        params: requestWithIdIdentifier,
        failAction: async (req: any, h: any, err: any) => {
          return Common.FailureError(err, req);
        },
        validator: validator,
      },
      response: {
        status: {
          //200: UD,
          400: resp400,
          500: resp500
        }
      },
    },
  },
  {
    method: "GET",
    path: "/attachment/verifyS3Upload",
    handler: attachments.verifyS3Upload,
    options: {
      tags: ["api", "Attachment"],
      notes: "Endpoint to verify s3 upload made using signed url",
      description: "verify s3 upload",
      auth: false,
      validate: {
        headers: headers,
        options: {
          abortEarly: false,
        },
        query: {
          key: Joi.string().required(),
        },
        failAction: async (req: any, h: any, err: any) => {
          return Common.FailureError(err, req);
        },
        validator: validator,
      },
      response: {
        status: {
          // 200: loginResponse,
          400: resp400,
          500: resp500
        }
      }
    },
  },
];