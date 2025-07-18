import { Models, sequelize } from "../models";
import { Sequelize, Op } from "../config/dbImporter";
import * as Common from "./common";
import Moment from "moment";
import * as Email from "./emails";
import * as Constants from "../constants";
import Bcrypt from "bcrypt";
import { request } from "http";
import * as Hapi from "@hapi/hapi";
import {hapi} from "hapi-i18n"
import { Literal,Fn,Col } from "sequelize/types/utils";
import { WhereOptions } from 'sequelize';
import { strict } from "assert";
import {AttributeElement} from "../config/customTypes"

const userAttributes = ['id','email','countryCode','mobile'];
let UserProfileAttributes:AttributeElement[]=['name',[sequelize.fn('CONCAT', process.env.PROTOCOL, '://', process.env.HOST_SERVER, "/attachment/", sequelize.literal('`userProfile->profileAttachment`.`unique_name`')),'profileImage']]
const loginToken=async (userId: number,accountId:number|null,language: string,transaction: Sequelize.Transaction)=>{
    try{
        let where: WhereOptions = {
            id: userId
        };
        let user=await Models.User.findOne({
            where:where,
            subQuery: false,
            transaction:transaction,
            attributes:userAttributes,
            include:[
                {
                    model:Models.UserProfile,as:'userProfile',
                    attributes:UserProfileAttributes,
                    include:[
                        {model:Models.Attachment,as:'profileAttachment',attributes:[]}
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
                                where: { code: process.env.DEFAULT_LANGUANGE_CODE }

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
                                        where: { code: process.env.DEFAULT_LANGUANGE_CODE }

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
        if(user){
            const { id, email,countryCode, mobile, createdAt, updatedAt, status } = user;
            const timeStamp = Moment.utc();
            let permissions = [];
            for (const role of user.Roles!) {
                permissions.push(role.code);
                for (const permission of role.Permissions!) {
                    permissions.push(permission.code);
                }
            }
            permissions = [... new Set(permissions)]
            let token = Common.signToken({ id: id, name: user.userProfile?.name, accountId: accountId, email: email, countryCode:countryCode,mobile:mobile, createdAt: createdAt, updatedAt: updatedAt, status: status, timeStamp: timeStamp, applicationCode: process.env.APPLICATION_CODE, permissions: permissions, type: 'authorizationToken' }, 'authorizationToken');
            let refreshToken = Common.signToken({ token: token, id: id, accountId: accountId, type: 'refreshToken' }, 'refreshToken');
            Common.setSessionToken(user.id!, token);
            if (token && refreshToken && user) {
                return {
                    id: user.id,
                    accountId: accountId,
                    email: user.email,
                    countryCode:user.countryCode,
                    mobile: user.mobile,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    status: status,
                    token: token,
                    refreshToken: refreshToken,
                    userProfile: JSON.parse(JSON.stringify(user.userProfile)),
                    Roles: JSON.parse(JSON.stringify(user.Roles)),
                }
            }else{
                return false
            }  
        }
    }catch(err){
        console.log("Error in loginToken",err);
        return false;
    }
}

export const login=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let {email,password}=request.payload;
        let validateAccount = await Models.User.findOne({where:{email:email}});
        if(validateAccount && validateAccount.password){
            let passwordVerification = Bcrypt.compareSync(password, validateAccount.password);
            if (!passwordVerification) {
                return Common.generateError(request, 400, 'INVALID_USERNAME_AND_PASSWORD', {});
            }
            if (validateAccount.status == Constants.STATUS.INACTIVE) {
                return Common.generateError(request, 400, 'SUSPENDED_ACCOUNT', {});
            }
            let defaultAccountId=null;
            if(+process.env.SAAS_ENABLED!){
                let defaultAccount = await Models.UserAccount.findOne({ where: { userId: validateAccount.id,isDefault:true } });
                if(defaultAccount){
                    defaultAccountId=defaultAccount?.accountId
                }else{
                    return Common.generateError(request, 400, 'UNABLE_TO_DETECT_DEFAULT_ACCOUNT', {});
                }
            }
            const userData = await loginToken(validateAccount.id!, defaultAccountId!, request.headers.language,transaction);
            if(userData){
                await transaction.commit();
                return h.response({ message: request.i18n.__("LOGIN_SUCCESSFULLY"), responseData: { user: userData } }).code(200);
            }else{
                return Common.generateError(request, 400, 'UNABLE_TO_PROCESS_LOGIN_REQUEST', {});
            }
        }else{
            return Common.generateError(request, 400, 'USER_WITH_EMAIL_NOT_FOUND', {});
        }
    }
    catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}


export const createAccount=async(request: Hapi.RequestQuery, h: Hapi.ResponseToolkit)=>{
    const transaction = await sequelize.transaction();
    try{
        let {name,email,password}=request.payload;
        let accountId=request.auth.credentials.userData.accountId;
        let existingAccount = await Models.User.findOne({where:{email:email}});
        if(!existingAccount){
            const rounds = +process.env.HASH_ROUNDS!;
            const userPassword = Bcrypt.hashSync(password,rounds);
            const profile={name:name};
            let roles=[];
            let userRole=await Models.Role.findOne({where:{code:'user'}});
            if(!userRole){
                await transaction.rollback();
                return Common.generateError(request,400,'SYSTEM_HAS_NOT_BEEN_INITIALZED_WITH_DEFAULT_ROLES',{});
            }
            if(userRole){
                roles.push(userRole.id);
            }
            const newUser=await Models.User.create({email:email,password:userPassword,status:Constants.STATUS.ACTIVE,userProfile:profile},{include:[{model:Models.UserProfile,as:'userProfile'}],transaction:transaction});
            await Models.UserAccount.create({accountId:accountId,userId:newUser.id,isDefault:true},{transaction:transaction});
            await newUser.setRoles(roles,{transaction:transaction})
            transaction.commit();
            return h.response({message:request.i18n.__("USER_CREATED_SUCCESSFULLY")}).code(200)
        }else{
            return Common.generateError(request, 400, 'EMAIL_ID_ALREADY_IN_USE', {});
        }
    }
    catch (err) {
        return Common.generateError(request, 500, 'SOMETHING_WENT_WRONG_WITH_EXCEPTION', err);
    }
}