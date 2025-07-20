import Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { decode, JwtPayload } from "jsonwebtoken";
import * as crypto from "crypto-js";
import { boolean, object } from "joi";
import * as Joi from 'joi';
import { Models } from '../models';
import * as handlebars from 'handlebars';
import * as convert from 'html-to-text'
import * as nodemailer from 'nodemailer';
import * as AWS from 'aws-sdk';
import * as Fs from 'fs';
import NodeCache from "node-cache";
import { Model } from "sequelize"
import { Sequelize, Op } from "../config/dbImporter";
import { ObjectKey } from "aws-sdk/clients/s3";
import { SendBulkTemplatedEmailRequest, SendBulkTemplatedEmailResponse } from 'aws-sdk/clients/ses';
import { Key } from "node-cache";
import { Keys } from "aws-sdk/clients/costexplorer";
import Moment from "moment";
import * as csv from 'fast-csv';
import * as _ from 'lodash';
import { EmailRecordInterface } from '../config/interfaces/emailList'
import Axios, { AxiosRequestConfig, Method, ResponseType } from 'axios';

interface awsError {
  message: string;
  code: string;
  time: Date;
  requestId: string,
  statusCode: number;
  retryable: boolean,
  retryDelay: number;
}

interface dynamicObject {
  [key: string]: number | string | object
}
const Jwt = require('jsonwebtoken');
let sessionCache = new NodeCache();


AWS.config.update({
  accessKeyId: process.env.SES_ACCESS_KEY,
  secretAccessKey: process.env.SES_ACCESS_SECRET,
  region: process.env.SES_REGION,
});
const AWS_SES = new AWS.SES();


const transporter = nodemailer.createTransport({
  SES: new AWS.SES({
    apiVersion: '2010-12-01',
  }),
});

interface GlobalHeaders {
  language: Joi.StringSchema;
  timezone: Joi.StringSchema;
  connection: Joi.StringSchema;
  latitude?: Joi.StringSchema;
  longitude?: Joi.StringSchema;
  authorization?: Joi.StringSchema;
  apikey?: Joi.StringSchema;
}


const convertHtmlToText = async (html: string): Promise<string> => {
  const text = convert.htmlToText(html, {});
  return text || '';
};


const encrypt = (text: string) => {
  let encrypted = crypto.AES.encrypt(text, process.env.CRYPTO_KEY).toString();
  return encrypted;
}

const generateError = (request: Hapi.RequestQuery, type: number, message: string, err: any) => {
  console.log(err)
  let error: Boom.Boom<unknown>
  switch (type) {
    case 500:
      error = Boom.badImplementation(message);
      error.output.payload.error = request.i18n.__('INTERNAL_SERVER_ERROR');
      error.output.payload.message = request.i18n.__(message);
      error.output.payload.errors = err;
      console.log(err);
      break;
    case 400:
      error = Boom.badRequest(message);
      error.output.payload.error = request.i18n.__('BAD_REQUEST');
      error.output.payload.message = request.i18n.__(message);
      error.output.payload.errors = err;
      break;
    case 401:
      error = Boom.unauthorized(message);
      error.output.payload.error = request.i18n.__('UNAUTHORIZED_REQUEST');
      error.output.payload.message = request.i18n.__(message);
      error.output.payload.errors = err;
      break;
    case 403:
      error = Boom.forbidden(message);
      error.output.payload.error = request.i18n.__('PERMISSION_DENIED');
      error.output.payload.message = request.i18n.__(message);
      error.output.payload.errors = err;
      break;
    case 404:
      error = Boom.badRequest(message);
      error.output.payload.error = request.i18n.__('FILE_NOT_FOUND');
      error.output.payload.message = request.i18n.__(message);
      error.output.payload.errors = err;
      break;
    default:
      error = Boom.badImplementation(message);
      error.output.payload.error = request.i18n.__('UNKNOWN_ERROR_MESSAGE');
      error.output.payload.message = request.i18n.__(message);
      error.output.payload.errors = err;
      break;
  }
  //console.log(error);
  return error;
}

interface tokenData {
  data: string;
  iat: number
}

// const validateApiKey = async (apikey: string) => {
//   try {
//     let validateKey;
//     validateKey = await Models.Key.findOne({where:{key:apikey}});
//     console.log("here",validateKey);
//     if(validateKey && validateKey.userId && validateKey.accountId){
//       console.log({isValid: true,credentials:{userData:{userId:validateKey.userId,accountId:validateKey.accountId},scope:['api']}});
//       return {isValid: true,credentials:{userData:{id:validateKey.userId,accountId:validateKey.accountId},scope:['api']}}
//     }
//     else{ return {isValid: false,credential:{}} }
//   } catch (err) {
//     return { isValid: false, credentials: {} };
//   }
// }

const validateToken = async (token: tokenData, type: string | string[]) => {

  try {
    if (token) {
      let fetchToken = JSON.parse(decrypt(token.data));
      let includeTokens = ['authorizationToken', 'refreshToken']
      if (fetchToken.type && includeTokens.includes(fetchToken.type)) {
        if (type == 'refreshToken') {
          if (!fetchToken.token) {
            return false;
          } else {
            //let validSessionToken1=Jwt.verify(sessionCache.get('user_'+fetchToken.id),process.env.JWT_PRIVATE_KEY);
            let updatedToken = module.exports.decodeToken(fetchToken.token);
            token = updatedToken;
          }
        }
        if (1 == +process.env.ENABLE_SINGLE_SESSSION! && sessionCache.get('user_' + fetchToken.id)) {
          let validSessionToken = Jwt.verify(sessionCache.get('user_' + fetchToken.id), process.env.JWT_PRIVATE_KEY);
          if (validSessionToken.data != token.data) {
            return {
              isValid: false
            };
          }
        } else if (1 == +process.env.ENABLE_SINGLE_SESSSION!) {
          return {
            isValid: false
          };
        }
      }
      var diff = Moment().diff(Moment(token.iat * 1000));
      if (diff > 0) {
        return {
          isValid: true,
          credentials: { userData: fetchToken, scope: fetchToken.permissions }
        };
      }
      return {
        isValid: false
      };
    } else {
      return false;
    }

  } catch (error) {
    console.log(error)
  }
};

const decodeToken = (token: string) => {
  let decodedToken = decode(token)!
  return decode(token)!;
};

const decryptData = (text: string) => {
  console.log(text);
  try {
    if (text) {
      let decrypted = crypto.AES.decrypt(text, process.env.DATA_KEY).toString(crypto.enc.Utf8)
      return JSON.parse(decrypted);
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

const decrypt = (text: string) => {
  console.log(text);
  try {
    if (text) {
      let decrypted = crypto.AES.decrypt(text, process.env.CRYPTO_KEY).toString(crypto.enc.Utf8)
      return decrypted;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

const getTotalPages = async (records: number, perpage: number) => {
  let totalPages = Math.ceil(records / perpage);
  return totalPages;
};

const encryptData = (json: object) => {
  let text = JSON.stringify(json);
  let encrypted = crypto.AES.encrypt(text, process.env.DATA_KEY).toString();
  return encrypted;
}

// const routeError = (errors: Joi.ErrorReport[], message: string) => {
//   errors.map((err: Joi.ErrorReport) => {
//     switch (err.code) {
//       case "any.required":
//       case "any.empty":
//       case "string.required":
//       case "string.empty":
//         err.message = message;
//         break;
//     }
//     return err;
//   });
//   return errors;
// }

const routeError = (errors: Joi.ErrorReport[], message: string) => {
  errors.map((err: Joi.ErrorReport) => {
    console.log(err);
    switch (err.code) {
      case "any.required":
      case "any.empty":
      case "string.required":
      case "string.email":
      case "string.empty":
        err.message = message;
        break;
      case "string.base":
        err.message = 'INVALID_DATA_TYPE';
        break;
      case "any.unknown":
        err.message = 'UNKNOWN_FIELDS_DETECTED';
        break;
      
    }
    return err;
  });
  return errors;
}


const revokeSessionToken = (user: string) => {
  sessionCache.del(user);
}

const headers = (authorized: 'authorized' | 'optionalauthorized' | 'authorizedLatLong' | 'apiheader' | null): GlobalHeaders => {
  let globalHeaders: GlobalHeaders = {
    language: Joi.string().optional().allow(null).default(process.env.DEFAULT_LANGUAGE_CODE),
    timezone: Joi.string().optional().allow(null).default("UTC"),
    connection: Joi.string().optional().allow(null).default("keep-alive")
  };

  if (authorized === 'authorized') {
    globalHeaders.authorization = Joi.string().required().description("Authorization token, for browser requests authorization cookie is in use");
  } else if (authorized === 'optionalauthorized') {
    globalHeaders.authorization = Joi.string().optional().description("Authorization token, for browser requests authorization cookie is in use");
  } else if (authorized === 'authorizedLatLong') {
    globalHeaders.authorization = Joi.string().required().description("Authorization token, for browser requests authorization cookie is in use");
    globalHeaders.latitude = Joi.string().required().description("Latitude for user location");
    globalHeaders.longitude = Joi.string().required().description("Latitude for user location");
  } else if (authorized === 'apiheader') {
    globalHeaders.apikey = Joi.string().description("Api key to consume services");
    globalHeaders.authorization = Joi.string().description("Authorization token");
  }
  return globalHeaders;
}
// const FailureError = (err: any, request: any) => {
//   const updatedError = err;
//   updatedError.output.payload.message = [];
//   const customMessages: Record<string, string> = {};

//   if (err.isJoi && Array.isArray(err.details) && err.details.length > 0) {
//     err.details.forEach((error: { context?: { label?: any }; message?: any }) => {
//       const label = error.context?.label || '';
//       const errorMessage = error.message || '';
//       customMessages[label] = request.i18n.__(errorMessage);
//     });
//   }

//   delete updatedError.output.payload.validation;
//   updatedError.output.payload.error = request.i18n.__('BAD_REQUEST');
//   updatedError.output.payload.message = request.i18n.__('ERROR_WHILE_VALIDATING_REQUEST');
//   updatedError.output.payload.errors = customMessages;

//   return updatedError;
// };

const FailureError = (err: any, request: any) => {
  const updatedError = err;
  updatedError.output.payload.message = [];
  const customMessages: Record<string, string> = {};

  if (err.isJoi && Array.isArray(err.details) && err.details.length > 0) {
    err.details.forEach((error: { context?: { label?: any }; message?: any,type:string },index:number) => {
      if(error.type=='object.unknown'){
        err.details[index].message = request.i18n.__('UNKNOWN_KEYS_ARE_NOT_ALLOWED');
      }
      const label = error.context?.label || '';
      const errorMessage = error.message || '';
      customMessages[label] = request.i18n.__(errorMessage);
    });
  }

  delete updatedError.output.payload.validation;
  updatedError.output.payload.error = request.i18n.__('BAD_REQUEST');
  updatedError.output.payload.message = request.i18n.__('ERROR_WHILE_VALIDATING_REQUEST');
  updatedError.output.payload.errors = customMessages;

  return updatedError;
};

const sendEmail = async (
  to: string[],
  from: string,
  cc: string[],
  bcc: string[],
  emailTemplateCode: string,
  replacements: Record<string, any>,
  attachments: string[],
  language: string,
  template: string,
  type?: string
): Promise<object> => {


  try {
    let emailTemplate = await Models.EmailTemplate.findOne({
      where: { code: emailTemplateCode },
      include: [
        { model: Models.EmailTemplateContent, as: 'emailContent', include: [{ model: Models.Language, where: { code: language } }] }
      ]
    });

    if (!emailTemplate) {
      return {} as any;
    }
    emailTemplate = JSON.parse(JSON.stringify(emailTemplate));
    let content = emailTemplate?.emailContent?.message as unknown as string ?? '' as unknown as string;
    let subject = emailTemplate?.emailContent?.subject as unknown as string ?? '' as unknown as string;
    let protocol = process.env.EMAIL_PROTOCOL;
    let htmlTemplate = await readHTMLFile(__dirname + '/../../emailTemplate/' + language + '/' + template + '.html');
    let templateFn = handlebars.compile(htmlTemplate);
    let mailtosend = templateFn({ content: content });
    var templateToSend = handlebars.compile(mailtosend);
    var htmlToSend = templateToSend(replacements);
    var mailSubject = handlebars.compile(subject);
    var updatedSubject = mailSubject(replacements);
    let text = await convertHtmlToText(htmlToSend); // Ensure 'convertHtmlToText' is imported
    
    let response: any = {}; // Define the response type
    switch (protocol) {
      case 'smtp':
        // send some mail
        response = transporter.sendMail({
          from: from,
          to: to.join(', '), // Join the 'to' array into a comma-separated string
          subject: updatedSubject,
          text: text as string,
          html: htmlToSend,
        }, (error, info) => {
          if (error) {
            console.log(error);
          }
        });
        break;
    }
    console.log(response)
    return response;
  } catch (error) {
    console.log(error);
    return { response: "data" }
  }
};


const generateCode = (Requestedlength: number, type: number | string) => {
  const char = type == 'number' ? '1234567890' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; //Random Generate Every Time From This Given Char
  const length = typeof Requestedlength != 'undefined' ? Requestedlength : 4;
  let randomvalue = '';
  for (let i = 0; i < length; i++) {
    const value = Math.floor(Math.random() * char.length);
    randomvalue += char.substring(value, value + 1).toUpperCase();
  }
  return randomvalue;
}

const signToken = (tokenData: object, type: string) => {
  try {
    let expirationTime: string | null;
    switch (type) {
      case 'signup':
        expirationTime = '30m';
        break;
      case 'authorizationToken':
        expirationTime = '12h';
        break;
      case 'mobile-otp':
        expirationTime = '5m';
        break;
      case '2faVerification':
        expirationTime = '5m';
        break;
      case '2faAuthentication':
        expirationTime = '5m';
        break;
      default:
        expirationTime = null;

    }
    let life = {};
    if (expirationTime != null) {
      life = { expiresIn: expirationTime };
    }

    return Jwt.sign({ data: encrypt(JSON.stringify(tokenData)) }, process.env.JWT_PRIVATE_KEY, life);
  } catch (err) {
    return false;
  }
};
const setSessionToken = (userId: number, token: string) => {
  sessionCache.set('user_' + userId, token);
}

const validateKeys = (obj: object, keys: Keys) => {
  let verification = keys.every(key => Object.keys(obj).includes(key));
  return verification
}

const readHTMLFile = async (path: string) => {
  let html = await Fs.readFileSync(path, { encoding: "utf-8" });
  return html;
};

// Generate slug for a text
const slugify = (text: string, append = '') => {
  let slug = text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
  if (append) {
    slug = slug + '-' + append;
  }
  return slug;
}

const chunk = (arr: EmailRecordInterface[], len: number) => {
  var chunks = [],
    i = 0,
    n = arr.length;
  while (i < n) {
    let chunk: EmailRecordInterface[] = arr.slice(i, i += len)
    chunks.push(chunk);
  }
  return chunks;
}

// get AWS Verification template

const getVerificationTemplate=async (templateName:string)=>{
  let awsTemplate;
  try{
    awsTemplate = await AWS_SES.getCustomVerificationEmailTemplate({ TemplateName: templateName }).promise();
    return awsTemplate;
  }catch(err){
    console.log(err);
    return false;
  }
}

const createVerificationTemplate=async (fromEmail:string,templateName:string,templateSubject:string,templateContent:string,successRedirectionURL:string,failureRedirectionURL:string)=>{
  let awsTemplate;
  try{
    //console.log("here in template");
    awsTemplate = await AWS_SES.createCustomVerificationEmailTemplate({
      FailureRedirectionURL:failureRedirectionURL,
      FromEmailAddress: fromEmail,
      SuccessRedirectionURL:successRedirectionURL,
      TemplateContent: templateContent,
      TemplateName: templateName,
      TemplateSubject: templateSubject,
    }).promise();
    console.log(awsTemplate);
    return awsTemplate;
  }catch(err){
    console.log(err);
    return false;
  }
}

const sendVerificationEamil=async (templateName:string,email:string)=>{
  let awsTemplate;
  try{
    console.log("here in template");
    let mail = await AWS_SES.sendCustomVerificationEmail({
      EmailAddress:email,
      TemplateName: templateName
    }).promise();
    console.log(mail);
    return mail;
  }catch(err){
    console.log(err);
    return false;
  }
}

const verifyEmailIdentitySatus=async (email:string)=>{
  let emailVerification;
  try{
    emailVerification = await AWS_SES.getIdentityVerificationAttributes({ Identities: [email] }).promise();
    return emailVerification;
  }catch(err){
    console.log(err);
    return false;
  }
}

// get AWS Verification template

const getAWSTemplate=async (templateName:string)=>{
  let awsTemplate;
  try{
    awsTemplate = await AWS_SES.getTemplate({ TemplateName: templateName }).promise();
    return awsTemplate;
  }catch(err){
    return false;
  }
}

// Create AWS templete for sending emails
const createAWSSESTemplate = async (title: string, subject: string, htmlMessage: string, textMessage: string) => {
  let params = {
    Template: {
      TemplateName: title,
      SubjectPart: subject,
      HtmlPart: htmlMessage,
      TextPart: textMessage
    }
  };
  let awsTemplate;
  try {
    awsTemplate = await getAWSTemplate(title);
    if(!awsTemplate){
      try {
        awsTemplate = await AWS_SES.createTemplate(params).promise();
        return awsTemplate;
      } catch (err) {
        return false;
      }
    }
    return awsTemplate;
  }
  catch (err) {
    return false;
  }
}

const sendBulkTemplatedEmail = async (params: SendBulkTemplatedEmailRequest) => {
  try {
    let response = await AWS_SES.sendBulkTemplatedEmail(params).promise();
    return response.Status;
  } catch (err) {
    console.log(err);
    return false;
  }
}

const upperkeyobject = (obj: dynamicObject, camelCase: string[]) =>
  Object.keys(obj).reduce((acc: dynamicObject, k) => {
    console.log(obj);
    let updatedKey = _.camelCase(k.trim());
    if (camelCase.includes(updatedKey)) {
      acc[updatedKey] = obj[k];
    } else {
      acc[updatedKey.toUpperCase()] = obj[k];
    }
    console.log(acc);
    return acc;
  }, {});




  interface AxiosRequest {
    requestUrl: string;
    requestMethod: string;
    requestHeader?: Record<string, string>;
    requestBody?: Record<string, any>;
    responseType?: ResponseType;
  }
  
const axiosRequest = async ({requestUrl, requestMethod, requestHeader, requestBody, responseType = 'json'}
  : AxiosRequest): Promise<any> => {
  try {
    let responseData;
    let requestObject: AxiosRequestConfig = {
      url: requestUrl,
      headers: requestHeader,
      method: requestMethod.toLowerCase() as Method,
      responseType: responseType as ResponseType
    };
  
    requestObject = (requestMethod.toLowerCase() === 'get')
      ? { ...requestObject, params: requestBody }
      : { ...requestObject, data: requestBody };

    responseData = await Axios(requestObject);
    responseData = responseData.data;
    return responseData;
  } catch (error) {
    const { response } = error as { response?: any };
    return response ? response.data : 'AXIOS_REQUEST_FAILED';
  }
};
  
const searchTextConversion = (sentence: string) => {
  // Define a regular expression to match words with special characters
  const specialCharRegex = /[\W_]+/; // \W matches any non-word character, _ matches underscore

  // Split the sentence into words
  const words = sentence.split(' ');

  // Initialize arrays to hold words with and without special characters
  const specialWords: string[] = [];
  const regularWords: string[] = [];

  // Process each word
  words.forEach(word => {
      // Check if the word contains special characters
      if (specialCharRegex.test(word)) {
          // Add to special words list, wrapping it in quotes
          specialWords.push(`"${word}"`);
      } else {
          // Add to regular words list
          regularWords.push(word);
      }
  });

  // Create strings by joining words with spaces
  const specialString = specialWords.join(' ');
  let regularString = regularWords.join('*');
  if(regularString.length > 0) {
    regularString = '*'+regularString+'*'
}

  // Return the two separate strings
  return { specialString, regularString };
}

export {
  // validateApiKey,
  validateToken,
  setSessionToken,
  decodeToken,
  decryptData,
  encryptData,
  generateError,
  routeError,
  headers,
  FailureError,
  sendEmail,
  convertHtmlToText,
  revokeSessionToken,
  generateCode,
  signToken,
  validateKeys,
  getTotalPages,
  slugify,
  chunk,
  upperkeyobject,
  createAWSSESTemplate,
  sendBulkTemplatedEmail,
  getVerificationTemplate,
  createVerificationTemplate,
  sendVerificationEamil,
  verifyEmailIdentitySatus,
  axiosRequest,
  searchTextConversion
}
