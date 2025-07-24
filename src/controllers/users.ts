import jwksLocalClient from 'jwks-rsa';
import jwt, { JwtPayload } from 'jsonwebtoken';
import axios, { isAxiosError } from 'axios';
import { Models, sequelize } from "../models";
import { Sequelize, Op } from "../config/dbImporter";
import * as Common from "./common";
import Moment from "moment";
// import * as Email from "./emailTemplates";
import * as Constants from "../constants";
import Bcrypt from "bcrypt";
import { request } from "http";
import * as Hapi from "@hapi/hapi";
import { hapi } from "hapi-i18n"
import { Literal, Fn, Col } from "sequelize/types/utils";
import { WhereOptions } from 'sequelize';
import { strict } from "assert";
import { AttributeElement } from "../config/customTypes";
// import axios from "axios";
import { sendEmail } from "./email";
import {searchTextConversion} from "./common";

const appleKey = async(kid: string)=>{
    const client = jwksLocalClient({
      jwksUri: process.env.APPLE_AUTH_KEY_URL!,
      timeout: 30000
    });
    return await client.getSigningKey(kid);
}

interface UserPayload {
    dob?: string | undefined;
    email: string;
    username: string;
    countryCode?: string;
    mobile?: string;
    password?: string;
    name?: string;
    role?: string;
}

const userAttributes = ['id', 'email', 'countryCode', 'mobile', 'createdAt', 'updatedAt', 'status'];
let UserProfileAttributes: AttributeElement[] = ['name', 'generalNotifications', 'paymentNotifications', 'reminderNotifications',
// [sequelize.fn('CONCAT', process.env.BASE_URL, "/attachment/", sequelize.literal('`userProfile->profileAttachment`.`unique_name`')), 'profileImage']
[
    sequelize.literal(
      `CONCAT('${process.env.BASE_URL}/attachment/', \`userProfile->profileAttachment\`.unique_name)`
    ),
    'profileImage'
  ]
];

// const createSearchIndex = async(id: number) => {
//     let searchString = "";
//     const userInfo = await Models.User.findOne({ where: { id: id } });
//     if(userInfo) {
//         searchString += userInfo.email + " ";
//         if(userInfo.mobile) {
//             searchString += userInfo.countryCode + userInfo.mobile + " ";
//         }
//         const userProfile = await Models.UserProfile.findOne({ where: { userId: id } });
//         if(userProfile) {
//             searchString += userProfile.name + " ";
//         }
//         const sellerProfile = await Models.SellerProfile.findOne({ where: { userId: id } });
//         if(sellerProfile) {
//             searchString += sellerProfile.name + " ";
//         }

//         if(searchString && searchString !== "") {
//             await userInfo.update({ searchIndex: searchString });
//         }

//         return true;
//     }

//     return false;
// }
const createSearchIndex = async(id: number) => {
    let searchString = "";
    const userInfo = await Models.User.findOne({ where: { id: id } });
    if(userInfo) {
        searchString += userInfo.email + " ";
        if(userInfo.mobile) {
            searchString += userInfo.countryCode + userInfo.mobile + " ";
        }
        const userProfile = await Models.UserProfile.findOne({ where: { userId: id } });
        if(userProfile) {
            searchString += userProfile.name + " ";
        }

        if(searchString && searchString !== "") {
            await userInfo.update({ searchIndex: searchString });
        }

        return true;
    }

    return false;
}

/**
 * Generate login and refresh tokens for a user based on their ID and account ID.
 * @param {number} userId - The ID of the user for whom tokens are generated.
 * @param {number | null} accountId - The ID of the account associated with the user (nullable).
 * @param {string} language - The language code used for localization.
 * @param {Sequelize.Transaction | null} transaction - Optional Sequelize transaction object for database operations.
 * @returns {Promise<Object | boolean>} - A promise that resolves with user data and tokens if successful, or false if there's an error.
 */
const loginToken = async (userId: number, accountId: number | null, language: string, transaction: Sequelize.Transaction | null, tokenRequired: boolean = true) => {
    try {
        let where: WhereOptions = { id: userId };
        let options = {};
        if(transaction) {
            options = { ...options, transaction }
        }
        let user = await Models.User.findOne({
            where: where,
            subQuery: false,
            // transaction: transaction,
            ...options,
            attributes: userAttributes,
            include: [
                {
                    model: Models.UserProfile, as: 'userProfile',
                    attributes: UserProfileAttributes,
                    include: [
                        { model: Models.Attachment, as: 'profileAttachment', attributes: [] }
                    ]
                },
                {
                    attributes: [
                        'code',
                        'status',
                        [sequelize.literal('(case when `Roles->content`.name is not null then `Roles->content`.name else `Roles->defaultContent`.name END)'), 'name']
                    ],
                    model: Models.Role,
                    required: true,
                    subQuery: false,
                    where: { status: Constants.STATUS.ACTIVE, [Op.or]: [{ accountId: accountId }, { accountId: null }] },
                    include: [
                        {
                            attributes: [],
                            required: false,
                            subQuery: false,
                            model: Models.RoleContent, as: 'content',
                            include: [{
                                model: Models.Language,
                                where: { code: language },
                                attributes: []
                            }],
                        },
                        {
                            attributes: [],
                            model: Models.RoleContent, as: 'defaultContent',
                            required: true,
                            subQuery: false,
                            include: [{
                                attributes: [],
                                model: Models.Language,
                                where: { code: process.env.DEFAULT_LANGUAGE_CODE }

                            }]
                        },
                        {
                            attributes: [
                                'code',
                                'status',
                                [sequelize.literal('(case when `Roles->Permissions->content`.name is not null then `Roles->Permissions->content`.name else `Roles->Permissions->defaultContent`.name END)'), 'name']
                            ],
                            model: Models.Permission,
                            where: { status: Constants.STATUS.ACTIVE, [Op.or]: [{ accountId: accountId }, { accountId: null }] },
                            required: false,
                            subQuery: false,
                            include: [
                                {
                                    attributes: [],
                                    required: false,
                                    subQuery: false,
                                    model: Models.PermissionContent, as: 'content',
                                    include: [{
                                        model: Models.Language,
                                        where: { code: language },
                                        attributes: []
                                    }],
                                },
                                {
                                    attributes: [],
                                    model: Models.PermissionContent, as: 'defaultContent',
                                    required: false,
                                    subQuery: false,
                                    include: [{
                                        attributes: [],
                                        model: Models.Language,
                                        where: { code: process.env.DEFAULT_LANGUAGE_CODE }

                                    }]
                                }
                            ]
                        }
                    ],
                    through: {
                        attributes: []
                    }
                }
            ]

        });
        if (user) {
            const { id, email, countryCode, mobile, createdAt, updatedAt, status } = user;
            const timeStamp = Moment.utc();
            let permissions = [];
            for (const role of user.Roles!) {
                permissions.push(role.code);
                for (const permission of role.Permissions!) {
                    permissions.push(permission.code);
                }
            }
            permissions = [... new Set(permissions)]


            let returnObject: any = {
                id: user.id,
                accountId: accountId,
                email: user.email,
                countryCode: user.countryCode,
                mobile: user.mobile,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                status: status,
                userProfile: JSON.parse(JSON.stringify(user.userProfile)),
                Roles: JSON.parse(JSON.stringify(user.Roles)),
                permissions
            }
            if(tokenRequired === true) {
                let token = Common.signToken({ id: id, name: user.userProfile?.name, accountId: accountId, email: email, countryCode: countryCode, mobile: mobile, createdAt: createdAt, updatedAt: updatedAt, status: status, timeStamp: timeStamp, applicationCode: process.env.APPLICATION_CODE, permissions: permissions, type: 'authorizationToken' }, 'authorizationToken');
                let refreshToken = Common.signToken({ token: token, id: id, accountId: accountId, type: 'refreshToken' }, 'refreshToken');
                if(token && refreshToken) {
                    returnObject["token"] = token
                    returnObject["refreshToken"] = refreshToken
                }
            }

            if(returnObject.id) {
                return returnObject;
            } else {
                return false;
            }


            // Common.setSessionToken(user.id!, token);
            // if (token && refreshToken && user) {
            //     return {
            //         id: user.id,
            //         accountId: accountId,
            //         email: user.email,
            //         countryCode: user.countryCode,
            //         mobile: user.mobile,
            //         createdAt: user.createdAt,
            //         updatedAt: user.updatedAt,
            //         status: status,
            //         token: token,
            //         refreshToken: refreshToken,
            //         userProfile: JSON.parse(JSON.stringify(user.userProfile)),
            //         roles: JSON.parse(JSON.stringify(user.Roles)),
            //         permissions
            //     }
            // } else {
            //     return false
            // }
        }
    } catch (err) {
        console.log("Error in loginToken", err);
        return false;
    }
}

/**
 * Generate a token for email or mobile verification.
 * @param {Object} payload - The payload containing user information like email, mobile, and countryCode.
 * @param {string} type - The type of token to generate (e.g., email verification, password reset).
 * @param {Sequelize.Transaction} transaction - The Sequelize transaction object for database operations.
 * @returns {Promise<Object>} - A promise that resolves with an object indicating success or failure of token generation.
 */
export const generateToken = async(payload: { [key: string]: any }, type: string, transaction: Sequelize.Transaction) => {
    try {
        // Generate a signup token for email verification
        let token = Common.signToken(payload, type);

        // Return error if token generation failed
        if (!token) {
            return { success: false, message: "TOKEN_NOT_GENERATED", data: null };
        }

        // Generate a verification code
        let code = Common.generateCode(4, 'number');
        
        // Use a master code in test environment
        if (+process.env.ENABLE_MASTER_CODE!) {
            code = process.env.MASTER_CODE!;
        }

        // Define conditions to deactivate existing tokens
        let where: WhereOptions = { type };

        // Build WHERE clause based on available payload data
        console.log(" =============== type", type)
        console.log(" =============== type", type)
        console.log(" =============== type", type)
        console.log(" =============== type", type)
        console.log(" =============== type", type)
        if((
            type === Constants.TOKEN_TYPES.SIGNUP || 
            type === Constants.TOKEN_TYPES.FORGET_PASSWORD || 
            type === Constants.TOKEN_TYPES.CHANGE_EMAIL || 
            type === Constants.TOKEN_TYPES.CHANGE_MOBILE ||
            type === Constants.TOKEN_TYPES.AGREEMENT
        ) && payload.email) {
            where = { ...where, email: payload.email }
        } else {
            return {success: false, message: "INVALID_DATA", data: null}
        }


        // Deactivate any existing tokens matching the conditions
        await Models.Token.update({ status: Constants.STATUS.INACTIVE }, { 
            where, 
            transaction
        });

        // Create a new token for email verification
        await Models.Token.create({
            email: payload.email, token: token, code: code,
            countryCode: payload.countryCode, mobile: payload.mobile,
            username: payload.username,
            dob: payload.dob,
            status: Constants.STATUS.ACTIVE, type: type
        }, { transaction });

        return {success: true, message: "REQUEST_SUCCESSFULL", data: { token, code }}
    } catch (error) {
        console.log(error);
        return {success: false, message: "ERROR_WHILE_GENERATING_TOKEN_CATCH", data: null}
    }
}


/**
 * Verify user credentials and initiate the signup process.
 * @param payload The payload containing email, countryCode, and mobile for verification.
 * @param transaction Sequelize transaction for database operations.
 * @returns A promise that resolves with an object containing success status, message, and token data.
 */
const verifyUserCredentials = async (payload: UserPayload, transaction: Sequelize.Transaction) => {
    try {
        // Perform email and mobile number existence checks concurrently
        const [emailExists] = await Promise.all([
            Models.User.findOne({ where: { email: payload.email } }),
            // Models.User.findOne({ where: { username: payload.username } })
        ]);
        const [isMobileExist] = await Promise.all([
            Models.User.findOne({ where: { countryCode: payload?.countryCode, mobile: payload.mobile } }),
        ]);

        // Check if email already exists
        if (emailExists) {
            return { success: false, message: "EMAIL_ALREADY_EXISTS", data: null };
        }
        if (isMobileExist) {
            return { success: false, message: "MOBILE_ALREADY_EXISTS", data: null };
        }

        // Check if mobile username already exists
        // if (usernameExists) {
        //     return { success: false, message: "USERNAME_ALREADY_EXISTS", data: null };
        // }
    
        return { success: true, message: "REQUEST_SUCCESSFUL", data: null };
    } catch (error) {
        // Handle any errors that occur during the verification process
        return { success: false, message: "ERROR_WHILE_CREATING_USER_CATCH", data: null };
    }
}

/**
 * Create a new user in the database.
 * @param {UserPayload} payload - The user data to create.
 * @param {Sequelize.Transaction} transaction - The transaction object for atomic operations.
 * @returns {Promise<{success: boolean, message: string, data: any}>} - A promise that resolves with the result of the user creation.
 */
const createUser = async (payload: UserPayload, transaction: Sequelize.Transaction) => {
    try {
        // Verify user credentials for signup requests
        const verifyCred = await verifyUserCredentials({ countryCode: payload.countryCode, mobile: payload.mobile, email: payload.email, username: payload.username }, transaction);
        if (verifyCred.success !== true) {
            return { success: false, message: verifyCred.message, data: null };
        }
        
        // Create new user with associated user profile
        const user = await Models.User.create({
            email: payload.email,
            username: null,
            countryCode: payload.countryCode,
            mobile: payload.mobile,
            password: payload.password,
            status: 1,
            userProfile: {
                name: payload.name,
                dob: payload.dob,
                attachmentId: null
            }
        }, {
            include: [{ model: Models.UserProfile, as: "userProfile" }],
            transaction
        });

        // Check if user creation was successful
        if (!user) {
            return { success: false, message: "ERROR_WHILE_CREATING_USERS", data: null };
        }

        if(+process.env.SAAS_ENABLED!){
            await Models.UserAccount.create({accountId:user.id,userId:user.id,isDefault:true},{transaction:transaction});
            //accountId = user.id;

        }else{
            await Models.UserAccount.create({accountId:null,userId:user.id,isDefault:true},{transaction:transaction});
        }

        // Assign the default role "user" to the new user
        const roleInfo = await Models.Role.findOne({ where: { code: "user" } });
        if(!roleInfo) {
            return { success: false, message: "ROLE_NOT_FOUND", data: null };
        }
        await user.setRoles([roleInfo!.id], { transaction });

        // if(payload.role === "seller") {
        //     const sellerRoleInfo = await Models.Role.findOne({ where: { code: payload.role } });
        //     if(!sellerRoleInfo) {
        //         return { success: false, message: "ROLE_NOT_FOUND", data: null };
        //     }
        //     await user.setRoles([sellerRoleInfo!.id, roleInfo!.id], { transaction });
        //     await Models.SellerProfile.create({ userId: user.id, hasSellerAccount: true, name: payload.name, status: Constants.STATUS.ACTIVE, currentStatus: Constants.SELLER_STATUS.NO_SELLER }, { transaction });
        // }

        // Return success result with the created user data
        return { success: true, message: "REQUEST_SUCCESSFULL", data: user };
    } catch (error) {
        // Handle any errors during user creation
        console.log(error)
        return { success: false, message: "ERROR_WHILE_CREATING_USER_CATCH", data: null };
    }
}

/**
 * Handle OTP verification.
 * @param {Hapi.RequestQuery} request - The Hapi request object containing query parameters.
 * @param {Hapi.ResponseToolkit} h - The Hapi response toolkit for generating HTTP responses.
 * @returns {Promise<Hapi.ResponseObject>} - A promise that resolves with an HTTP response containing success status and user data.
 */

const sendOtp = async (countryCode: string, phoneNumber: string, otp: number | string) => {
    try {
        // Validate environment variables
        if (!process.env.MASTER_CODE && !process.env.USE_TWILIO) {
            return null;
        }
        if (parseInt(process.env.USE_TWILIO!) && (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER)) {
            return null;
        }

        // Override OTP with master code if enabled
        otp = parseInt(process.env.USE_TWILIO!) ? otp : parseInt(process.env.MASTER_CODE!);

        if (parseInt(process.env.USE_TWILIO!) || parseInt(process.env.MASTER_CODE!)) {
            const twilio = require('twilio');
            const client = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

            try {
                const message = await client.messages.create({
                    body: `Night club: Your Verification Code is ${otp}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: `+${countryCode}${phoneNumber}`
                });
                return message;
            } catch (twilioError: any) {
                console.error('Error sending OTP via Twilio:', twilioError?.message!);
                return null;
            }
        }
    } catch (error: any) {
        console.error('Error in sendOtp function:', error.message, error.stack);
        return null;
    }
};

/**
 * Handle OTP (One-Time Password) sending process based on request parameters.
 * @param request The Hapi request object containing query parameters.
 * @param h The Hapi response toolkit for generating HTTP responses.
 * @returns A promise that resolves with an HTTP response containing success status and message.
 */
export const signup = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, username, email, countryCode, mobile, password, dob } = request.payload;
        const responseData = { token: null };

        // Verify user credentials for signup requests
        const verifyCred = await verifyUserCredentials({ countryCode, mobile, email, username }, transaction);
        if (verifyCred.success !== true) {
            await transaction.rollback();
            return Common.generateError(request, 400, verifyCred.message, {});
        }

        // Generate a signup token for email verification 
        const tokenData = await generateToken({ countryCode, mobile, email, password, name, username, dob }, Constants.TOKEN_TYPES.SIGNUP, transaction);
        if (tokenData.success !== true) {
            await transaction.rollback();
            return Common.generateError(request, 400, tokenData.message, {});
        }
        
        responseData["token"] = tokenData.data!.token;

        // Check if responseData token is null after processing
        if (responseData.token === null) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'ERROR_WHILE_GENERATING_TOKEN', {});
        }

        if (parseInt(process.env.USE_TWILIO!)) {
            let otpSend = await sendOtp(countryCode, mobile, tokenData?.data?.code!);
            if (!otpSend) {
                await transaction.rollback();
                return Common.generateError(request, 400, 'Error while sending OTP', {});
            }
        }

        await transaction.commit();

        let replacements = { name, code: tokenData.data!.code }
        await sendEmail("signup_verification", replacements, [email], request.headers.language);
        

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

/**
 * Handle OTP (One-Time Password) verification process.
 * @param {Hapi.RequestQuery} request - The Hapi request object containing query parameters.
 * @param {Hapi.ResponseToolkit} h - The Hapi response toolkit for generating HTTP responses.
 * @returns {Promise<Hapi.ResponseObject>} - A promise that resolves with an HTTP response containing success status and message.
 */
export const verifyToken = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        const { token, code } = request.payload;

        // Find the token information in the database
        const tokenInfo = await Models.Token.findOne({ where: { token: token, code: code } });
        if (!tokenInfo) {
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }

        // Check if the token si active or not
        if (tokenInfo.status !== Constants.STATUS.ACTIVE) {
            return Common.generateError(request, 400, 'EXPIRED_TOKEN_PROVIDED', {});
        }

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: {token} }).code(200);
    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

/**
 * Handle OTP (One-Time Password) verification process.
 * @param {Hapi.RequestQuery} request - The Hapi request object containing query parameters.
 * @param {Hapi.ResponseToolkit} h - The Hapi response toolkit for generating HTTP responses.
 * @returns {Promise<Hapi.ResponseObject>} - A promise that resolves with an HTTP response containing success status and message.
 */
// export const verifyEmail = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const { token, code } = request.payload;

//         let sendSingUpEmail = null;
//         let replacements: any = {};

//         // Find the token information in the database
//         const tokenInfo = await Models.Token.findOne({ where: { token: token, code: code, status: Constants.STATUS.ACTIVE } });
//         if (!tokenInfo) {
//             await transaction.rollback();
//             return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
//         }


//         // Validate and decode the token to get token data
//         const tokenData = await Common.validateToken(Common.decodeToken(token), tokenInfo.type);
//         if (!tokenData || !tokenData.credentials) {
//             await transaction.rollback();
//             return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
//         }

//         let userId = null;
//         if(tokenInfo.type === Constants.TOKEN_TYPES.SIGNUP) {
//             const createdUser = await createUser(tokenData.credentials?.userData, transaction);
//             console.log("createdUser=========>",createdUser)
//             if (createdUser.success !== true) {
//                 await transaction.rollback();
//                 return Common.generateError(request, 400, createdUser.message, {});
//             }
//             userId = createdUser.data!.id!;
//             sendSingUpEmail = createdUser.data!.email;
//             replacements = { name: createdUser.data!.userProfile!.name }
//         }

//         if(tokenInfo.type === Constants.TOKEN_TYPES.CHANGE_EMAIL) {
//             const email = tokenData.credentials?.userData.email;
//             userId = tokenData.credentials?.userData.userId;

//             console.log(userId)

//             const emailExists = await Models.User.findOne({ where: { email: email } });
//             if(emailExists) {
//                 await transaction.rollback();
//                 return Common.generateError(request, 400, "EMAIL_ALREADY_EXISTS", {});
//             }

//             const updateAccount = await Models.User.update({ email }, {where: { id: userId }, transaction});
//         }

//         if(tokenInfo.type === Constants.TOKEN_TYPES.CHANGE_MOBILE) {
//             const mobile = tokenData.credentials?.userData.mobile;
//             const countryCode = tokenData.credentials?.userData.countryCode;
//             userId = tokenData.credentials?.userData.userId;

//             const userExists = await Models.User.findOne({ where: { id: userId } });
//             if(!userExists) {
//                 await transaction.rollback();
//                 return Common.generateError(request, 400, "INVALID_USER", {});
//             }

//             await userExists.update({ mobile, countryCode }, {transaction});
//         }

//         // Update the token status to inactive
//         await tokenInfo.update({ status: 0 }, { transaction });
//         // Generate login token for the created user
//         const accountId = userId;
//         const responseData = await loginToken(userId, accountId, request.headers.language, transaction);

//         await transaction.commit();

//         // if(sendSingUpEmail !== null) {
//         //     await sendEmail("welcome_onboard", replacements, [sendSingUpEmail], request.headers.language);
//         // }

//         await createSearchIndex(userId);
//         return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
//     } catch (error) {
//         await transaction.rollback();
//         return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
//     }
// }

export const verifyCode = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const { token, code } = request.payload;

        let sendSingUpEmail = null;
        let replacements: any = {};

        // Find the token information in the database
        const tokenInfo = await Models.Token.findOne({ where: { token: token, code: code, status: Constants.STATUS.ACTIVE } });
        if (!tokenInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }


        // Validate and decode the token to get token data
        const tokenData = await Common.validateToken(Common.decodeToken(token), tokenInfo.type);
        if (!tokenData || !tokenData.credentials) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }

        let userId = null;
        if(tokenInfo.type === Constants.TOKEN_TYPES.SIGNUP) {
            const createdUser = await createUser(tokenData.credentials?.userData, transaction);
            console.log("createdUser=========>",createdUser)
            if (createdUser.success !== true) {
                await transaction.rollback();
                return Common.generateError(request, 400, createdUser.message, {});
            }
            userId = createdUser.data!.id!;
            sendSingUpEmail = createdUser.data!.email;
            replacements = { name: createdUser.data!.userProfile!.name }
        }

        if(tokenInfo.type === Constants.TOKEN_TYPES.CHANGE_EMAIL) {
            const email = tokenData.credentials?.userData.email;
            userId = tokenData.credentials?.userData.userId;

            console.log(userId)

            const emailExists = await Models.User.findOne({ where: { email: email } });
            if(emailExists) {
                await transaction.rollback();
                return Common.generateError(request, 400, "EMAIL_ALREADY_EXISTS", {});
            }

            const updateAccount = await Models.User.update({ email }, {where: { id: userId }, transaction});
        }

        if(tokenInfo.type === Constants.TOKEN_TYPES.CHANGE_MOBILE) {
            const mobile = tokenData.credentials?.userData.mobile;
            const countryCode = tokenData.credentials?.userData.countryCode;
            userId = tokenData.credentials?.userData.userId;

            const userExists = await Models.User.findOne({ where: { id: userId } });
            if(!userExists) {
                await transaction.rollback();
                return Common.generateError(request, 400, "INVALID_USER", {});
            }

            await userExists.update({ mobile, countryCode }, {transaction});
        }

        // Update the token status to inactive
        await tokenInfo.update({ status: 0 }, { transaction });
        // Generate login token for the created user
        const accountId = userId;
        const responseData = await loginToken(userId, accountId, request.headers.language, transaction);

        await transaction.commit();

        // if(sendSingUpEmail !== null) {
        //     await sendEmail("welcome_onboard", replacements, [sendSingUpEmail], request.headers.language);
        // }

        await createSearchIndex(userId);
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}
/**
 * Handle user login process.
 * @param {Hapi.RequestQuery} request - The Hapi request object containing query parameters.
 * @param {Hapi.ResponseToolkit} h - The Hapi response toolkit for generating HTTP responses.
 * @returns {Promise<Hapi.ResponseObject>} - A promise that resolves with an HTTP response containing success status and user data.
 */
export const login = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let {  email, password } = request.payload;

        let userInfo = await Models.User.findOne({ where: { email: email } });
        // If no user found with provided credentials, return error
        if(!userInfo) {
            return Common.generateError(request, 400, 'INVALID_CREDENTIALS', {});
        }
        
        if(!userInfo.password) {
            return Common.generateError(request, 400, 'INVALID_PASSWORD', {});
        }

        // Verify password against stored hash
        let passwordVerification = Bcrypt.compareSync(password, userInfo.password!);
        if (!passwordVerification) {
            return Common.generateError(request, 400, 'INVALID_CREDENTIALS', {});
        }

        // Check if user account is inactive
        if (userInfo.status === Constants.STATUS.INACTIVE) {
            return Common.generateError(request, 400, 'SUSPENDED_ACCOUNT', {});
        }

        const userAccountInfo = await Models.UserAccount.findOne({ where: { userId: userInfo.id } });

        const accountId = userAccountInfo ? userAccountInfo.accountId : null;

        // Generate login token and retrieve user data
        const userData = await loginToken(userInfo.id!, accountId, request.headers.language, null);

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: userData }).code(200);
    }
    catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

const getStandardFacebookUser = async (token:string) => {
    const { data } = await axios.get(`https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`);
    if (!data.id) {
      throw new Error('Invalid token (missing id or name)');
    }
    return { facebookUserId: data.id, facebookUserName: data.name, facebookEmail: data.email };
};

const getLimitedFacebookUser = async ({ token, appId }: {token: string, appId: string}) => {
    const jwksClient = jwksLocalClient({
      jwksUri: 'https://www.facebook.com/.well-known/oauth/openid/jwks',
    });
  
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        async (header: any, callback: any) => {
          const key = await jwksClient.getSigningKey(header.kid);
          const signingKey = key.getPublicKey();
          callback(null, signingKey);
        },
        {
          algorithms: ['RS256'],
          audience: appId,
          issuer: 'https://www.facebook.com',
        },
        (err: any, decoded: any) => {
          if (err) return reject(err);
          const decodedData = decoded as any;
          if (!decodedData.sub) {
            return reject(new Error('Invalid token (missing sub)'));
          }
          resolve({ facebookUserId: decodedData.sub, facebookUserName: decodedData.name, facebookEmail: decodedData.email });
        },
      );
    });
  };

  const getFacebookUser = async ({ token, appId }: {token: string, appId: string}) => {
    try {
      return await getStandardFacebookUser(token);
    } catch (error) {
        try {
            if (isAxiosError(error)) {
                console.warn('Failed to get standard Facebook user, trying limited user');
              }
              return getLimitedFacebookUser({ token, appId });
        } catch (error) {
            return null;
        }
    }
  };

const verifySocialLogin = async (platform: string, accessToken: string, payloadEmail: string) => {
    try {
      let url = "";
      let response = null
      switch (platform) {
        case "apple":
            const { header } = jwt.decode(accessToken, {complete: true});
            const kid = header.kid
            const publicKey = (await appleKey(kid)).getPublicKey()
            response = jwt.verify(accessToken, publicKey);
            const { sub, email } = response;
            if(email === payloadEmail) return true;
            return false;
        case "google":
          url = `${process.env.GOOGLE_LOGIN_END_POINT}=${accessToken}`;
          response = await axios.get(url);
          if(response?.status === 200) {
            const googleEmail = response.data.email;
            if(googleEmail === payloadEmail) return true;
          }
          return false;
        case "facebook":
        //   url = `${process.env.FACEBOOK_LOGIN_END_POINT}=${accessToken}`;
        //   response = await axios.get(url);
          
        //   return false;

            const data: any = await getFacebookUser({ token: accessToken, appId:"1561143174776812" });
            if(data?.facebookEmail) {
                const facebookEmail = data.facebookEmail;
                if(facebookEmail === payloadEmail) return true;
            }
            return false;
        default: {
          return false;
        }
      }
    } catch (err) {
      return false;
    }
  };

export const socialLogin = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const {platform, accessToken, email, name} = request.payload;

        const verifyAccessToken = await verifySocialLogin(platform, accessToken, email);
        if(verifyAccessToken !== true) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN', {});
        }

        let userId = null;
        const userExists = await Models.User.findOne({ where: { email: email } });
        if(userExists) {
            // if(userExists.status === Constants.STATUS.INACTIVE) {

            // }
            userId = userExists.id;
        } else {
            const payload = { email, username: email, name, role: "user" };
            const createdUser = await createUser(payload, transaction);
            userId = createdUser.data!.id
        }

        if(platform === "google") {
            if(userId) await Models.User.update({googleLogin: true}, { where: {id: userId}, transaction });
        }
        if(platform === "facebook") {
            if(userId) await Models.User.update({facebookLogin: true}, { where: {id: userId}, transaction });
        }
        
        await transaction.commit();
        if(!userExists) await createSearchIndex(userId!);
        const userAccountInfo = await Models.UserAccount.findOne({ where: { userId: userId } });
        const accountId = userAccountInfo ? userAccountInfo.accountId : null;
        const userData = await loginToken(userId!, accountId, request.headers.language, null);
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: userData }).code(200);
    } catch (error) {
        console.log(error)
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}


/**
 * Handle OTP (One-Time Password) verification process.
 * @param {Hapi.RequestQuery} request - The Hapi request object containing query parameters.
 * @param {Hapi.ResponseToolkit} h - The Hapi response toolkit for generating HTTP responses.
 * @returns {Promise<Hapi.ResponseObject>} - A promise that resolves with an HTTP response containing success status and message.
 */
export const forgetPassword = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        let { email } = request.payload;
        // Initialize responseData object to store token
        const responseData = { token: null };

        // Check if email is provided to find user information
        let userInfo = await Models.User.findOne({ where: { email: email } });
        
        // If no user found with provided credentials, rollback transaction and return error
        if(!userInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_CREDENTIALS', {});
        }

        const userProfileInfo = await Models.UserProfile.findOne({ where: { userId: userInfo.id } });
        if(!userProfileInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_CREDENTIALS', {});
        }
        // Generate a forget password token using the provided user information
        const tokenData = await generateToken({ email }, Constants.TOKEN_TYPES.FORGET_PASSWORD, transaction);
        
        // If token generation fails, rollback transaction and return error
        if (tokenData.success !== true) {
            await transaction.rollback();
            return Common.generateError(request, 400, tokenData.message, {});
        }

        // Assign generated token to responseData
        responseData["token"] = tokenData.data!.token;

        // Check if responseData token is null after processing
        if (responseData.token === null) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'ERROR_WHILE_GENERATING_TOKEN', {});
        }

        await transaction.commit();

        let replacements = { name: userProfileInfo.name, code: tokenData.data!.code }
        await sendEmail("reset_password", replacements, [email], request.headers.language);
        
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

/**
 * Reset Password Handler
 * 
 * This function handles the password reset request. It validates the provided token,
 * updates the user's password in the database, and commits the transaction if successful,
 * or rolls back in case of an error.
 * 
 * @param {Hapi.RequestQuery} request - The request object containing the payload and authentication data.
 * @param {Hapi.ResponseToolkit} h - The response toolkit.
 * @returns {Promise<Hapi.ResponseObject>} - The response object with a success message or error.
 */
export const resetPassword = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const { token, code, password } = request.payload;
        const tokenType = "forgetpassword";

        // Find the token information in the database
        const tokenInfo = await Models.Token.findOne({ where: { token, code, status: Constants.STATUS.ACTIVE } });
        if (!tokenInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }

        // Validate and decode the token to get token data
        const tokenData = await Common.validateToken(Common.decodeToken(token), tokenType);
        if (!tokenData || !tokenData.credentials) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }
        const email = tokenData.credentials.userData.email;

        // Find the user information in the database using the email
        const userInfo = await Models.User.findOne({ where: { email } });
        if (!userInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_EMAIL_PROVIDED', {});
        }

        // Update the user's password within the transaction
        await userInfo.update({ password }, { transaction });

        // Generate login token for the created user (commented out for now)
        // const responseData = await loginToken(userInfo.id, null, request.headers.language, transaction);

        // Update the token status to inactive within the transaction
        await tokenInfo.update({ status: 0 }, { transaction });

        await transaction.commit();
        const userAccountInfo = await Models.UserAccount.findOne({ where: { userId: userInfo.id } });
        const accountId = userAccountInfo ? userAccountInfo.accountId : null;
        const responseData = await loginToken(userInfo.id!, accountId, request.headers.language, null)

        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}


/**
 * Change Password Handler
 * 
 * This function handles the change password request. It updates the user's password
 * in the database and commits the transaction if successful, or rolls back in case of an error.
 * 
 * @param {Hapi.RequestQuery} request - The request object containing the payload and authentication data.
 * @param {Hapi.ResponseToolkit} h - The response toolkit.
 * @returns {Promise<Hapi.ResponseObject>} - The response object with a success message or error.
 */
export const changePassword = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();

    try {
        const { password, oldPassword } = request.payload;
        const userId = request.auth.credentials.userData.id;

        // Find the user information in the database using the user ID
        const userInfo = await Models.User.findOne({ where: { id: userId }, transaction });
        if (!userInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_EMAIL_PROVIDED', {});
        }

        if(!userInfo.password) {
            if(oldPassword !== null) {
                await transaction.rollback();
                return Common.generateError(request, 400, 'INVALID_OLD_PASSWORD_PROVIDED', {});
            }
        }

        if(userInfo.password) {
            // Verify password against stored hash
            if(oldPassword === null) {
                await transaction.rollback();
                return Common.generateError(request, 400, 'INVALID_OLD_PASSWORD_PROVIDED', {});
            }

            let passwordVerification = Bcrypt.compareSync(oldPassword, userInfo.password!);
            if (!passwordVerification) {
                return Common.generateError(request, 400, 'INVALID_OLD_PASSWORD_PROVIDED', {});
            }
        }


        // Update the user's password within the transaction
        await userInfo.update({ password }, { transaction });

        // Generate login token for the created user (commented out for now)
        // const responseData = await loginToken(userInfo.id, null, request.headers.language, transaction);

        await transaction.commit();
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFUL"), responseData: userInfo }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const userslist = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {
        let {page,perPage,searchText,userType,status,sortParameter,sortValue} = request.query;
        // let pageLimt = process?.env?.PAGINATION_LIMIT;
        // if(pageLimt){
        //     perPage = +pageLimt < +perPage ? +pageLimt : +perPage
        // }

        let offset = (page - 1) * perPage;

        let rolesWhere = { code: "user" };

        let where = {};
        if(status !== null) where = { status: status }

        // if(searchText) {
        //     searchText = searchText.replace('@','*');
        //     searchText = searchText.replace(' ','*')+'*';
        //     where = { ...where, [Op.or]: [
        //         sequelize.literal('MATCH(search_index) AGAINST(:searchText IN BOOLEAN MODE)'),
        //       ] }
        // }

        const searchReplacements = {regularText: "", SpecialText: ""}
        const order: any = [];
        if(searchText) {
            const searchConversion = searchTextConversion(searchText);
            searchReplacements["regularText"] = searchConversion.regularString;
            searchReplacements["SpecialText"] = searchConversion.specialString;
            let conditionArray:WhereOptions=[]
            if((searchConversion.regularString).length > 0) {
                conditionArray.push(sequelize.literal('MATCH(search_index) AGAINST(:regularText IN BOOLEAN MODE)'))  
            }
            if((searchConversion.specialString).length > 0) {
                conditionArray.push(sequelize.literal('MATCH(search_index) AGAINST(:SpecialText IN BOOLEAN MODE)'))  
            }
            if(conditionArray.length){
                where = {...where,...{[Op.or]:conditionArray}}
            }

            // where = { ...where, [Op.or]: [
            //     sequelize.literal('MATCH(`Shop`.search_index) AGAINST(:regularText IN BOOLEAN MODE)'),
            //     sequelize.literal('MATCH(`Shop`.search_index) AGAINST(:SpecialText IN BOOLEAN MODE)'),
            // ]}

            // if(searchText.includes("@")) {
            //     where = { ...where, searchIndex: {[Op.like]: `%:searchText%`} }
            // } else {
            //     searchText = searchText.replace('@','*');
            //     searchText = searchText.replace(' ','*')+'*';
            //     where = { ...where, [Op.or]: [
            //         sequelize.literal('MATCH(`Shop`.search_index) AGAINST(:searchText IN BOOLEAN MODE)'),
            //     ]}
            // }
        } else {
            order.push([sortParameter, sortValue]);
        }

        // buyers, merchants, requests

        const userInfo = await Models.User.findAndCountAll({
            where:where,
            order: order,
            offset:offset,
            limit: perPage,
            distinct: true,
            col:"id",
            replacements: searchReplacements,
            attributes:[ 'id', 'username', 'email', 'mobile', 'countryCode', 'createdAt', 'updatedAt', 'status'],
            include:[
                {
                    attributes:["id","name", "attachmentId", "referralCode", "userId"],
                    // where: profileWhere,
                    model:Models.UserProfile, as: "userProfile",
                    include:[
                        {
                            model:Models.Attachment,as:'profileAttachment',
                            attributes:["id",[sequelize.fn('CONCAT',process.env.API_PATH,sequelize.literal('`userProfile->profileAttachment`.`unique_name`')), 'filePath'],
                            "fileName", "uniqueName", "extension","status"]
                        }
                    ]
                },
                {
                    attributes:['code', 'status','id',
                        [sequelize.literal('(case when `Roles->content`.name is not null then `Roles->content`.name else `Roles->defaultContent`.name END)'), 'name']
                    ],
                    model:Models.Role,
                    include: [{
                        attributes: [],
                        model: Models.RoleContent, as: 'content',
                        include: [{
                            subQuery: true,
                            model: Models.Language,
                            where: { code: request.headers.language },
                            attributes: []
                        }],
                    },
                    {
                        attributes: [],
                        model: Models.RoleContent, as: 'defaultContent',
                        include: [{
                            subQuery: true,
                            attributes: [],
                            model: Models.Language,
                            where: { code: process.env.DEFAULT_LANGUAGE_CODE }

                        }]
                    }],
                    through:{
                        attributes:[]
                    }
                },
                {
                    attributes:[],
                    as: "conditional",
                    model:Models.Role,
                    where: rolesWhere
                }
            ]

        });

        let totalPages = await Common.getTotalPages(
            userInfo.count,
            perPage
        );

        return h.response({message:request.i18n.__("REQUEST_SUCCESSFULL"),responseData:{
            data:userInfo.rows, 
            perPage:perPage,
            page: page,
            totalRecords:userInfo.count,
            totalPages:totalPages,
            meta: {}
        }}).code(200);

    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const usersProfile = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {

        const userId = request.auth.credentials.userData.id;
        const responseData = await loginToken(userId, null, request.headers.language, null, false)

        return h.response({message:request.i18n.__("REQUEST_SUCCESSFULL"),responseData: responseData}).code(200);

    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const fetchUser = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    try {

        const userId = request.params.id;
        const responseData = await loginToken(userId, null, request.headers.language, null, false)

        return h.response({message:request.i18n.__("REQUEST_SUCCESSFULL"),responseData: responseData}).code(200);

    } catch (error) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const updateUserProfile = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = request.auth.credentials.userData.id;
        console.log("userId=========>",userId)
        const {name, attachmentId, dob} = request.payload;

        const updateObject: any = {};

        const userInfo = await Models.User.findOne({ where: { id: userId } });
        if(!userInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_USER', {});
        }

        const profileInfo = await Models.UserProfile.findOne({ where: { userId: userId } });
        if(!profileInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_USER_PROFILE', {});
        }
        
        if(name !== null) updateObject["name"] = name === "" ? null : name;
        if(dob !== null) updateObject["dob"] = dob === "" ? null : dob;

        if(attachmentId !== null) {
            if(attachmentId !== "") {
                const attachmentInfo = await Models.Attachment.findOne({ where: { id: attachmentId } });
                if(!attachmentInfo) {
                    await transaction.rollback();
                    return Common.generateError(request, 400, 'INVALID_ATTACHMENT_PROVIDED', {});
                }
                updateObject["attachmentId"] = attachmentId;
            } else {
                updateObject["attachmentId"] = null;
            }
        }

        await profileInfo.update(updateObject, { transaction });
        await transaction.commit();
        await createSearchIndex(userId!);
        const userAccountInfo = await Models.UserAccount.findOne({ where: { userId: userInfo.id } });
        const accountId = userAccountInfo ? userAccountInfo.accountId : null;
        const responseData = await loginToken(userId, accountId, request.headers.language, null, false)
        return h.response({message:request.i18n.__("REQUEST_SUCCESSFULL"),responseData: responseData}).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const changeStatus = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = request.params.id;
        const status = request.payload.status;

        const userInfo = await Models.User.findOne({ where: { id: userId } });
        if(!userInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_USER', {});
        }

        const updatedUser = await userInfo.update({ status: status }, { transaction });

        await transaction.commit();

        const responseData = await loginToken(userId, null, request.headers.language, null, false);

        return h.response({message:request.i18n.__("REQUEST_SUCCESSFULL"),responseData: responseData}).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);   
    }
}

export const requestChangeEmail = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = request.auth.credentials.userData.id;
        const name = request.auth.credentials.userData.name;
        const newEmail = request.payload.email;
        const tokenType = Constants.TOKEN_TYPES.CHANGE_EMAIL;
        const responseData = { token: null };

        const emailExists = await Models.User.findOne({ where: { email: newEmail } });
        if(emailExists) {
            await transaction.rollback();
            return Common.generateError(request, 400, "EMAIL_ALREADY_EXISTS", {});
        }

        const tokenData = await generateToken({ email: newEmail, userId: userId }, tokenType, transaction);

        if (tokenData.success !== true) {
            await transaction.rollback();
            return Common.generateError(request, 400, tokenData.message, {});
        }

        // Assign generated token to responseData
        responseData["token"] = tokenData.data!.token;

        // Check if responseData token is null after processing
        if (responseData.token === null) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'ERROR_WHILE_GENERATING_TOKEN', {});
        }

        
        await transaction.commit();
        let replacements = { name: name, code: tokenData.data!.code }
        await sendEmail("change_email", replacements, [newEmail], request.headers.language);
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const requestChangeMobile = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = request.auth.credentials.userData.id;
        const email = request.auth.credentials.userData.email;
        const mobile = request.payload.mobile;
        const countryCode = request.payload.countryCode;
        const tokenType = Constants.TOKEN_TYPES.CHANGE_MOBILE;
        const responseData = { token: null };

        const userInfo = await Models.User.findOne({ where: { id: userId } });
        if(!userInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, "INVALID_USER", {});
        }

        if(userInfo.mobile === mobile && userInfo.countryCode === countryCode) {
            await transaction.rollback();
            return Common.generateError(request, 400, "NOT_ALLOWED_TO_ENTER_SAME_NUMBER", {});
        }

        const tokenData = await generateToken({ mobile, countryCode, userId: userId, email }, tokenType, transaction);

        if (tokenData.success !== true) {
            await transaction.rollback();
            return Common.generateError(request, 400, tokenData.message, {});
        }

        // Assign generated token to responseData
        responseData["token"] = tokenData.data!.token;

        // Check if responseData token is null after processing
        if (responseData.token === null) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'ERROR_WHILE_GENERATING_TOKEN', {});
        }

        await transaction.commit();
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const verifyMobile = async (request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const { token, code } = request.payload;

        // Find the token information in the database
        const tokenInfo = await Models.Token.findOne({ where: { token: token, code: code, status: Constants.STATUS.ACTIVE } });
        if (!tokenInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }


        // Validate and decode the token to get token data
        const tokenData = await Common.validateToken(Common.decodeToken(token), 'signup');
        if (!tokenData || !tokenData.credentials) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }

        const mobile = tokenData.credentials?.userData.mobile;
        const countryCode = tokenData.credentials?.userData.countryCode;
        const userId = tokenData.credentials?.userData.userId;

        const emailExists = await Models.User.findOne({ where: { id: userId } });
        if(!emailExists) {
            await transaction.rollback();
            return Common.generateError(request, 400, "INVALID_USER", {});
        }

        await emailExists.update({ mobile, countryCode }, {transaction});
   
        const responseData = await loginToken(userId, null, request.headers.language, transaction, false);

        await transaction.commit();
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

export const resendCode = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const token = request.payload.token;
        let responseData = { token };
        const tokenInfo = await Models.Token.findOne({ where: { token: token, status: Constants.STATUS.ACTIVE } });
        if (!tokenInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }

        // Validate and decode the token to get token data
        const tokenData = await Common.validateToken(Common.decodeToken(token), tokenInfo.type);
        if (!tokenData || !tokenData.credentials) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_TOKEN_PROVIDED', {});
        }

        const data = tokenData.credentials.userData;
        let name = data.name;

        const newToken = await generateToken(data, tokenInfo.type, transaction);

        if (newToken.success !== true) {
            await transaction.rollback();
            return Common.generateError(request, 400, newToken.message, {});
        }

        // Assign generated token to responseData
        responseData["token"] = newToken.data!.token;

        // Check if responseData token is null after processing
        if (responseData.token === null) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'ERROR_WHILE_GENERATING_TOKEN', {});
        }

        await transaction.commit();
        let emailCode: string | null = null;
        if(tokenInfo.type === "signup") {
            emailCode = "signup_verification"
        } else  if(tokenInfo.type === "forgetpassword") {
            emailCode = "reset_password" 
        } else  if(tokenInfo.type === "change-email") {
            emailCode = "change_email"
        } else  if(tokenInfo.type === "agreement") {
            emailCode = "submit_agreement";
        }

        if(emailCode !== null) {

            if(name) {
                const replacements = { name: name, code: tokenInfo.code };
                await sendEmail(emailCode, replacements, [tokenInfo.email], request.headers.language);
            } else {
                const userInfo = await Models.User.findOne({
                    where: { email: tokenInfo.email },
                    include: [{
                        model: Models.UserProfile, as: "userProfile"
                    }]
                });
                if(userInfo) {
                    const replacements = { name: userInfo.userProfile?.name, code: tokenInfo.code };
                    await sendEmail(emailCode, replacements, [tokenInfo.email], request.headers.language);
                }
            }



        }
        if (parseInt(process.env.USE_TWILIO!)) {
            let otpSend = await sendOtp(data.countryCode, data.mobile, tokenInfo.code!);
            if (!otpSend) {
                await transaction.rollback();
                return Common.generateError(request, 400, 'Error while sending OTP', {});
            }
        }
        // if(tokenInfo.type === "signup_verification" || tokenInfo.type === "reset_password" || tokenInfo.type === "change_email") {
        //     const userInfo = await Models.User.findOne({
        //         where: { email: tokenInfo.email },
        //         include: [{
        //             model: Models.UserProfile, as: "userProfile"
        //         }]
        //     });
        //     if(userInfo) {
        //         const replacements = { name: userInfo.userProfile?.name, code: tokenInfo.code }
        //         await sendEmail(tokenInfo.type, replacements, [tokenInfo.email], request.headers.language);
        //     }
        // }
        return h.response({ message: request.i18n.__("REQUEST_SUCCESSFULL"), responseData: responseData }).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}

// Generate new token using previously shared token and refresh token
export const refreshToken=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    try{
        let refreshToken=request.payload.refreshToken;
        let tokenData = await Common.validateToken(Common.decodeToken(refreshToken),'refreshToken');
        if(tokenData && tokenData.isValid){
            if(tokenData.credentials!.userData.id){
                const responseData = await loginToken(tokenData.credentials!.userData.id, tokenData.credentials!.userData.accountId, request.headers.language, null, true);
                return h.response({message:request.i18n.__("REQUEST_SUCCESSFULL"),responseData: {token:responseData.token, refreshToken: responseData.refreshToken}}).code(200)
            }else{
                return Common.generateError(request, 400, 'INEFFICIENT_DATA_TO_REGENERATE_TOKEN', {});
            }
        }else{
            return Common.generateError(request, 400, 'INVALID_TOKEN', {});
        }
    }
    catch(error){
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}


export const updateUserSettings = async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit) => {
    const transaction = await sequelize.transaction();
    try {
        const userId = request.auth.credentials.userData.id;
  
        const {generalNotifications, paymentNotifications, reminderNotifications} = request.payload;

      

        const userInfo = await Models.User.findOne({ where: { id: userId } });
        if(!userInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_USER', {});
        }

        const profileInfo = await Models.UserProfile.findOne({ where: { userId: userId } });
        if(!profileInfo) {
            await transaction.rollback();
            return Common.generateError(request, 400, 'INVALID_USER_PROFILE', {});
        }
        
    
        await profileInfo.update({generalNotifications, paymentNotifications, reminderNotifications}, { transaction });
        await transaction.commit();
        const userDetails = await loginToken(userId, null, request.headers.language, null, false)
        return h.response({message:request.i18n.__("REQUEST_SUCCESSFULL"),responseData: userDetails}).code(200);
    } catch (error) {
        await transaction.rollback();
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', error);
    }
}
