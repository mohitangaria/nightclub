import { string } from 'joi';
import { text } from 'stream/consumers';
import { Joi, Common } from '../config/routeImporter';

const optional_authorizedheaders = Joi.object(Common.headers('optionalauthorized')).options({ allowUnknown: true });
const authorizedheaders = Joi.object(Common.headers('authorized')).options({ allowUnknown: true });
const headers = Joi.object(Common.headers(null)).options({ allowUnknown: true });
const apiheader = Joi.object(Common.headers('apiheader')).options({ allowUnknown: true });
const options = { abortEarly: false, state: { parse: true, failAction: 'error' } };
const validator = Joi;
const respmessage = "Confirmation/error message from API";

const identifierRequest = Joi.object().keys({
    id: Joi.string().trim().required()
      .example('1')
      .description("The unique identifier for the entity. Must be a string")
      .error(errors => { return Common.routeError(errors, 'ID_IS_REQUIRED') }),
  }).label('unique-identifier')
    .description("Schema for requesting a record using a unique identifier.")

const changeStatusRequest: Joi.ObjectSchema = Joi.object().keys({
  status: Joi.number().integer().valid(0, 1).required()
      .description("Status to be updated, valid values are 0 and 1")
      .example(1)
      .error(errors => { return Common.routeError(errors, 'INVALID_STATUS_VALUE'); }),
}).label('change-status-request').description('Request to change status');


// const identifierRequest = (label: string) => {
//   return (Joi.object().keys({
//     id: Joi.string().trim().required()
//       .example('1')
//       .description("The unique identifier for the entity. Must be a string")
//       .error(errors => { return Common.routeError(errors, 'ID_IS_REQUIRED') }),
//   }).label(`${label}-unique-identifier`)
//     .description("Schema for requesting a record using a unique identifier."))
// }


const resp400 = Joi.object().keys({
  statusCode: 400,
  message: Joi.string().example('400 error message').description('Error message from server'),
  error: Joi.string().example('bad request').description('description of error'),
  errors: Joi.object().example('{key:"details of error"}').description('error object with key value pair')
}).unknown(true).label('400-response-model').description('400 response object');

const resp500 = Joi.object().keys({
  statusCode: 500,
  message: Joi.string().example('500 internal server error').description('Error message from server'),
  error: Joi.string().example('exception encountered while processing request').description('Error details in string format')
}).unknown(true).label('500-response-model').description('500 response object');

export { authorizedheaders, optional_authorizedheaders, apiheader, headers, options, validator, respmessage, resp400, resp500, identifierRequest, changeStatusRequest };
