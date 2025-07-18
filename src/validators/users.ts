import {Joi,Common,_} from "../config/routeImporter";

const login:  Joi.ObjectSchema = Joi.object().keys({
    email:Joi.string().trim().default(null).example("email@domain.com").description("Account email id, allowed with type = email-password").error(errors=>{return Common.routeError(errors,'EMAIL_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL_ID')}),
    password:Joi.string().trim().required().example('password').description("Account password").error(errors=>{return Common.routeError(errors,'PASSWORD_IS_REQUIRED')}),
}).label('login-request').description("User login request will email/password");

const createUserRequest:  Joi.ObjectSchema = Joi.object().keys({
    email:Joi.string().trim().default(null).example("admin@qfi.com").description("Account email id, allowed with type = email-password").error(errors=>{return Common.routeError(errors,'EMAIL_IS_REQUIRED_AND_MUST_BE_VALID_EMAIL_ID')}),
    name:Joi.string().trim().default(null).example("qfi").description("Account display name").error(errors=>{return Common.routeError(errors,'ACCOUNT_DISPLAY_NAME_IS_REQUIRED')}),
    password:Joi.string().trim().required().example('password').description("Account password").error(errors=>{return Common.routeError(errors,'PASSWORD_IS_REQUIRED')}),
}).label('create-user-request').description("Request to create a new user");

const createUserResponse:Joi.ObjectSchema = Joi.object().keys({
    message:Joi.string().example("Request processed successfully").description("Confirmation message from the server"),
}).label('create-user-response').description('Confirmation for account creation')

export {
    login,
    createUserRequest,
    createUserResponse
}