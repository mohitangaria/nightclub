import  Hapi from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import {decode, JwtPayload} from "jsonwebtoken";
import * as crypto from "crypto-js";
import { boolean, object } from "joi";
import * as Joi from 'joi';
import { Models } from '../models';
import * as handlebars from 'handlebars';
import * as convert from 'html-to-text'
import * as nodemailer from 'nodemailer';
import * as AWS from 'aws-sdk';
import * as Fs from 'file-system';
import NodeCache from "node-cache";
import {Model} from "sequelize"
import { Sequelize, Op } from "../config/dbImporter";
import constants from "./constants";
import { ObjectKey } from "aws-sdk/clients/s3";
import { Key } from "node-cache";
import { Keys } from "aws-sdk/clients/costexplorer";
import Moment from "moment";
const Jwt = require('jsonwebtoken');

let sessionCache = new NodeCache();
AWS.config.update({
    accessKeyId: process.env.SES_ACCESS_KEY,
    secretAccessKey: process.env.SES_ACCESS_SECRET,
    region: process.env.SES_REGION,
  });
  
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
    apikey?:Joi.StringSchema;
  }


const convertHtmlToText = async (html: string): Promise<string> => {
    const text = convert.htmlToText(html, {});
    return text || '';
  };


  const encrypt = (text:string)=>{
    let encrypted =crypto.AES.encrypt(text, process.env.CRYPTO_KEY).toString();
    return encrypted;
}

const generateError=(request:Hapi.RequestQuery,type:number,message:string,err:any)=>{
    console.log(err)
    let error:Boom.Boom<unknown>
    switch(type){
        case 500:
            error = Boom.badImplementation(message);
            error.output.payload.error =  request.i18n.__('INTERNAL_SERVER_ERROR');
            error.output.payload.message =  request.i18n.__(message);
            error.output.payload.errors = err;
            console.log(err);
            break;
        case 400:
            error = Boom.badRequest(message);
            error.output.payload.error =  request.i18n.__('BAD_REQUEST');
            error.output.payload.message = request.i18n.__(message);
            error.output.payload.errors = err;
            break;
        case 401:
            error = Boom.unauthorized(message);
            error.output.payload.error =  request.i18n.__('UNAUTHORIZED_REQUEST');
            error.output.payload.message =  request.i18n.__(message);
            error.output.payload.errors = err;
            break;
        case 403:
            error = Boom.forbidden(message);
            error.output.payload.error =  request.i18n.__('PERMISSION_DENIED');
            error.output.payload.message =  request.i18n.__(message);
            error.output.payload.errors = err;
            break;
        case 404:
            error = Boom.forbidden(message);
            error.output.payload.error =  request.i18n.__('FILE_NOT_FOUND');
            error.output.payload.message =  request.i18n.__(message);
            error.output.payload.errors = err;
            break;
        default: 
            error = Boom.badImplementation(message);
            error.output.payload.error =  request.i18n.__('UNKNOWN_ERROR_MESSAGE');
            error.output.payload.message =  request.i18n.__(message);
            error.output.payload.errors = err;
            break;
    }
    //console.log(error);
    return error;
}

interface tokenData {
  data:string;
  iat:number
}

const validateApiKey = async (apikey:string)=>{
  try{
      // let validateKey;
      // validateKey = await Models.Key.findOne({where:{key:apikey}});
      // if(validateKey && validateKey.userId && validateKey.serviceId){
      //   return {isValid: true,credentials:{userData:{userId:validateKey.userId,serviceId:validateKey.serviceId}}}
      // }
      // else{ return {isValid: false,credential:{}} }
      return {isValid: false,credentials:{}} ;
  }catch(err){
    return {isValid: false,credentials:{}} ;
  }
}

const validateToken = async (token:tokenData,type:string | string[]) => {

try {
   console.log("Hello from here common ")

  if(token){
      console.log("test === ", token);

      console.log(decrypt(token.data))




      let fetchToken = JSON.parse(decrypt(token.data));
      console.log(fetchToken, " === ");
      let includeTokens=['authorizationToken','refreshToken']
      console.log(fetchToken.type, " =============== fetchToken.type")
      if(fetchToken.type && includeTokens.includes(fetchToken.type)){
          if(type=='refreshToken'){
              if(!fetchToken.token){
              return false;
              }else{
                  //let validSessionToken1=Jwt.verify(sessionCache.get('user_'+fetchToken.id),process.env.JWT_PRIVATE_KEY);
                  let updatedToken= module.exports.decodeToken(fetchToken.token);
                  token=updatedToken;
              }
          }
          if(1==+process.env.ENABLE_SINGLE_SESSSION! && sessionCache.get('user_'+fetchToken.id)){
              let validSessionToken=Jwt.verify(sessionCache.get('user_'+fetchToken.id),process.env.JWT_PRIVATE_KEY);
              if(validSessionToken.data!=token.data){
                  return {
                      isValid: false
                  };
              }
          }else if(1==+process.env.ENABLE_SINGLE_SESSSION!){
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
  }else{
      return false;
  }

} catch (error) {
 console.log(error) 
}
};

const decodeToken = (token:string) => {
    let decodedToken = decode(token)!
    return decode(token)!;
};

const decryptData=(text:string)=>{
    console.log(text);
    try{
    if(text){
        let decrypted = crypto.AES.decrypt(text,process.env.DATA_KEY).toString(crypto.enc.Utf8)
        return JSON.parse(decrypted);
    }
  }catch(err){
    console.log(err);
    return false;
  }
};

const decrypt=(text:string)=>{
    console.log(text);
    try{
    if(text){
        let decrypted = crypto.AES.decrypt(text,process.env.CRYPTO_KEY).toString(crypto.enc.Utf8)
        return decrypted;
    }
  }catch(err){
    console.log(err);
    return false;
  }
};

const getTotalPages = async (records:number, perpage:number) => {
    let totalPages = Math.ceil(records / perpage);
    return totalPages;
};

const encryptData=(json:object)=>{
    let text = JSON.stringify(json);
    let encrypted = crypto.AES.encrypt(text, process.env.DATA_KEY).toString();
    return encrypted;
}

const  routeError =(errors: Joi.ErrorReport[], message: string)=>{
    // console.log(errors);
    errors.forEach((err: Joi.ErrorReport) => {
        switch (err.code) {
            case "any.required":
                err.message = message;
                break;
        }
    });
    return message;
}


const revokeSessionToken=(user:string)=>{
    sessionCache.del(user);
}

const headers = (authorized: 'authorized' | 'optionalauthorized' | 'authorizedLatLong' | 'apiheader' | null): GlobalHeaders=>{
    let globalHeaders: GlobalHeaders = {
      language: Joi.string().optional().allow(null).default(process.env.DEFAULT_LANGUANGE_CODE),
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
    }else if (authorized === 'apiheader') {
      globalHeaders.apikey = Joi.string().required().description("Api key to consume services");
    }
    return globalHeaders;
  }
  const FailureError = (err:  any  , request: any) => {
    const updatedError = err;
    updatedError.output.payload.message = [];
    const customMessages: Record<string, string> = {};

    if (err.isJoi && Array.isArray(err.details) && err.details.length > 0) {
        err.details.forEach((error: { context?: { label?: any }; message?: any }) => {
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
    subject: string,
    content: string,
    replacements: Record<string, any>, 
    attachments: string[],
    language: string,
    template: string,
    type?: string
  ): Promise<object> => {
    
      
    try {
    let protocol = process.env.EMAIL_PROTOCOL;
    let htmlTemplate = await readHTMLFile(__dirname + '/../emailTemplate/' + language + '/' + template + '.html');
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
        transporter.sendMail({
          from: from,
          to: to.join(', '), // Join the 'to' array into a comma-separated string
          subject: updatedSubject,
          text: text as string,
          html: htmlToSend,
        }, (error, info) => {
          if (error) {
            console.log(error);
          } else {
            for (const sentto of to) { // Use 'const' and specify the type
              Models.SystemEmails.create({               
                from: from,
                to: sentto,
                subject: subject,
                htmlContent: content,
                textContent: text || '', 
                type: type as string,
              });
            }
          }
        });
        break;
    }
    return response;
  } catch (error) {
      console.log(error)
      return {response: "data"}
  }
  };
  
  
  const generateCode=(Requestedlength:number,type:number|string)=>{
    const char = type=='number'?'1234567890':'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; //Random Generate Every Time From This Given Char
    const length = typeof Requestedlength !='undefined' ? Requestedlength : 4;
    let randomvalue = '';
    for ( let i = 0; i < length; i++) {
      const value = Math.floor(Math.random() * char.length);
      randomvalue += char.substring(value, value + 1).toUpperCase();
    }
    return randomvalue;
  }  

  const signToken = (tokenData:object,type:string) => {
    try{
        let expirationTime:string|null;
        switch(type){
            case 'signup':
                expirationTime='30m';
                break;
            case 'authorizationToken':
                expirationTime='12h';
                break;
            case 'mobile-otp':
                expirationTime='5m';
                break;
            case '2faVerification':
                expirationTime='5m';
                break;
            case '2faAuthentication':
                expirationTime='5m';
                break;
            default:
                expirationTime=null;

        }
        let life={};
        if(expirationTime!=null){
            life={expiresIn:expirationTime};
        }
        console.log("======= tkdata",tokenData)
        return Jwt.sign({ data: encrypt(JSON.stringify(tokenData))},process.env.JWT_PRIVATE_KEY,life);
    }catch(err){
        console.log(err);
        return false;
    }
};
const setSessionToken=(userId:number,token:string)=>{
    sessionCache.set('user_'+userId,token);
}  

const validateKeys=(obj:object,keys:Keys)=>{
    let verification = keys.every(key => Object.keys(obj).includes(key));
    return verification
}

const  readHTMLFile = async(path:string) => {
  let html = await Fs.readFileSync(path, { encoding: "utf-8" });
  return html;
};

// Generate slug for a text
const slugify = (text:string,append='') =>{
  let slug = text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');
  if(append){
      slug=slug+'-'+append;
  }
  return slug;
}

export {
  validateApiKey,
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
    slugify 

}
