"use strict";
import { Dialect, Sequelize } from 'sequelize'
import * as Fs from 'fs';
import * as path from 'path';
const { DB_NAME, DB_USER_NAME, DB_PASSWORD, DB_HOST } = require(__dirname + '/../config/config')[process.env.NODE_ENV!];
var sequelize = new Sequelize(
    DB_NAME,
    DB_USER_NAME,
    DB_PASSWORD,
    {
        define: {
            charset: "utf8mb4",
            collate: "utf8mb4_general_ci"
        },
        host: DB_HOST,
        dialect: process.env.MYSQL_DIALECT! as Dialect,
        dialectOptions: {
            ssl: { rejectUnauthorized: false },
        },
        port: +process.env.MYSQL_PORT!,
        pool: {
            max: +process.env.DB_POOL_MAX!,
            min: +process.env.DB_POOL_MIN!,
            acquire: +process.env.DB_POOL_ACQUIRE!,
            idle: +process.env.DB_POOL_IDLE!
        }
    }
);


import Attachment from './Attachment';
import Language from './Language';
import AppVersion from './AppVersion';

import User from "./User";
import UserProfile from "./UserProfile";
import UserAccount from "./UserAccount";

import Role from './Role';
import RoleContent from './RoleContent';

import Permission from './Permission';
import PermissionContent from './PermissionContent';

import Token from './Token';

import EmailTemplate from './EmailTemplate';
import EmailTemplateContent from './EmailTemplateContent';

import Notification from './Notification';
import NotificationTemplate from './NotificationTemplate';
import NotificationTemplateContent from './NotificationTemplateContent';

import Address from './Address';


import CategoryType from './CategoryType';
import CategoryTypeContent from './CategoryTypeContent';

import Category from './Category';
import CategoryContent from './CategoryContent';

import Faq from './Faq';
import FaqContent from './FaqContent';

import Post from './Post';
import PostContent from './PostContent';
import PostMedia from './PostMedia';

import AttributeOption from './AttributeOption';
import AttributeOptionContent from './AttributeOptionContent';

import Attribute from './Attribute';
import AttributeContent from './AttributeContent';

import LostAndFound from './LostAndFound';
import Inquiry from './Inquiry';
import SupportTicket from './SupportTicket'
import SupportMessage from './SupportMessage';


User.hasMany(UserAccount, { foreignKey: "userId", as: "userAccounts", onDelete: "cascade", onUpdate: "cascade", hooks: true });
User.hasOne(UserAccount, { foreignKey: "userId", as: "userAccount" });
User.hasOne(UserProfile, { foreignKey: "userId", as: "userProfile", onDelete: 'cascade', onUpdate: "cascade", hooks: true });

Role.hasMany(RoleContent, { foreignKey: 'roleId', onDelete: "cascade", onUpdate: "cascade", hooks: true });
Role.hasOne(RoleContent, { foreignKey: 'roleId', as: 'content' });
Role.hasOne(RoleContent, { foreignKey: 'roleId', as: 'defaultContent' });

Permission.hasMany(PermissionContent, { foreignKey: 'permissionId', onDelete: "cascade", onUpdate: "cascade", hooks: true });
Permission.hasOne(PermissionContent, { foreignKey: 'permissionId', as: 'content' });
Permission.hasOne(PermissionContent, { foreignKey: 'permissionId', as: 'defaultContent' });

Category.hasMany(Category, { foreignKey: "parentId", onDelete: 'cascade', hooks: true, as: 'children' });
Category.hasMany(PermissionContent, { foreignKey: "categoryId", onDelete: 'cascade', hooks: true });
Category.hasMany(CategoryContent, { foreignKey: "categoryId", onDelete: 'cascade', hooks: true });
Category.hasOne(CategoryContent, { foreignKey: 'categoryId', as: 'content' });
Category.hasOne(CategoryContent, { foreignKey: 'categoryId', as: 'defaultContent' });

EmailTemplate.hasMany(EmailTemplateContent, { foreignKey: "EmailTemplateId", onDelete: 'cascade', hooks: true });
EmailTemplate.hasOne(EmailTemplateContent, { foreignKey: "EmailTemplateId", onDelete: 'cascade', hooks: true, as: "emailContent" });
EmailTemplate.hasOne(EmailTemplateContent, { foreignKey: "EmailTemplateId", onDelete: 'cascade', hooks: true, as: "content" });
EmailTemplate.hasOne(EmailTemplateContent, { foreignKey: "EmailTemplateId", onDelete: 'cascade', hooks: true, as: "defaultContent" });

NotificationTemplate.hasMany(NotificationTemplateContent, { foreignKey: "notificationTemplateId", onDelete: 'cascade', hooks: true });
NotificationTemplate.hasOne(NotificationTemplateContent, { foreignKey: "notificationTemplateId", onDelete: 'cascade', hooks: true, as: "content" });
NotificationTemplate.hasOne(NotificationTemplateContent, { foreignKey: "notificationTemplateId", onDelete: 'cascade', hooks: true, as: "defaultContent" });

CategoryType.hasMany(CategoryTypeContent, {foreignKey: "categorytypeId",onDelete: 'cascade', hooks:true});
CategoryType.hasOne(CategoryTypeContent,{foreignKey:'categorytypeId',as:'content'});
CategoryType.hasOne(CategoryTypeContent,{foreignKey:'categorytypeId',as:'defaultContent'});

Faq.hasMany(FaqContent, {foreignKey: "faqId",onDelete: 'cascade', hooks:true});
Faq.hasOne(FaqContent,{foreignKey:'faqId',as:'content'});
Faq.hasOne(FaqContent,{foreignKey:'faqId',as:'defaultContent'});

Post.hasMany(PostContent,{foreignKey:'postId'})
Post.hasMany(PostMedia,{foreignKey:'postId'})
Post.hasOne(PostMedia,{foreignKey:'postId',as:'postImage'})
Post.hasOne(PostMedia,{foreignKey:'postId',as:'postVideo'}),
Post.hasOne(PostContent,{foreignKey:'postId',as:'content'})
Post.hasOne(PostContent,{foreignKey:'postId',as:'defaultContent'}),


Faq.belongsTo(User,{foreignKey:'userId',as:'author'});
Faq.belongsTo(User,{foreignKey:'lastUpdatedBy',as:'updatedBy'});
Faq.belongsTo(Category,{foreignKey:'categoryId',as:'category'});

FaqContent.belongsTo(Faq, {foreignKey: "faqId"});
FaqContent.belongsTo(Language, { foreignKey: "languageId"});

CategoryTypeContent.belongsTo(CategoryType, {foreignKey: "categorytypeId"});
CategoryTypeContent.belongsTo(Language, { foreignKey: "languageId"});

CategoryType.belongsTo(User,{foreignKey:'userId',as:'author'});
CategoryType.belongsTo(User,{foreignKey:'lastUpdatedBy',as:'updatedBy'});

UserProfile.belongsTo(User, { foreignKey: 'userId' });
UserProfile.belongsTo(Attachment, { foreignKey: "attachmentId", as: 'profileAttachment' });

Role.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Role.belongsTo(User, { foreignKey: 'lastUpdatedBy', as: 'updatedBy' });

RoleContent.belongsTo(Role, { foreignKey: "roleId" });
RoleContent.belongsTo(Language, { foreignKey: "languageId" });

Permission.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Permission.belongsTo(User, { foreignKey: 'lastUpdatedBy', as: 'updatedBy' });

PermissionContent.belongsTo(PermissionContent, { foreignKey: "permissionId" });
PermissionContent.belongsTo(Language, { foreignKey: "languageId" });

Category.belongsTo(CategoryType, { foreignKey: "categorytypeId", as: 'categorytype' });
Category.belongsTo(Attachment, { foreignKey: 'imageId', as: "categoryImage" })
Category.belongsTo(User, { foreignKey: 'userId', as: 'author' });
Category.belongsTo(User, { foreignKey: 'lastUpdatedBy', as: 'updatedBy' });
Category.belongsTo(Category, { foreignKey: 'parentId', as: 'parent' }),

CategoryContent.belongsTo(Category, { foreignKey: "categoryId" });
CategoryContent.belongsTo(Language, { foreignKey: "languageId" });

EmailTemplate.belongsTo(User, { foreignKey: 'userId', as: 'author' });
EmailTemplate.belongsTo(User, { foreignKey: 'lastUpdatedBy', as: 'updatedBy' });

EmailTemplateContent.belongsTo(EmailTemplate, { foreignKey: "EmailTemplateId" });
EmailTemplateContent.belongsTo(Language, { foreignKey: "languageId" });
EmailTemplateContent.belongsTo(EmailTemplate, { foreignKey: "EmailTemplateId" });
EmailTemplateContent.belongsTo(Language, { foreignKey: "languageId" });

NotificationTemplateContent.belongsTo(Language, { foreignKey: "languageId" });

Post.belongsTo(Category,{foreignKey:'categoryId',as:'category'});
Post.belongsTo(User,{foreignKey:'userId',as:'author'});
Post.belongsTo(User,{foreignKey:'lastUpdatedBy',as:'updatedBy'});

PostContent.belongsTo(Post, { foreignKey: "postId"});
PostContent.belongsTo(Language, { foreignKey: "languageId"});
PostContent.belongsTo(Attachment, {foreignKey: "imageId",as:'postImage'});
PostContent.belongsTo(Attachment, {foreignKey: "videoId",as:'postVideo'});

PostMedia.belongsTo(Post, { foreignKey: "postId"});
PostMedia.belongsTo(Language, { foreignKey: "languageId"});
PostMedia.belongsTo(Attachment, {foreignKey: "fileId"});

EmailTemplate.belongsToMany(Attachment, { through: 'email_templates_attachment', foreignKey: "EmailTemplateId", otherKey: "attachmentId" });

User.belongsToMany(Role, { through: "user_roles", foreignKey: "userId", otherKey: "roleId" });
User.belongsToMany(Role, { through: "user_roles", foreignKey: "userId", otherKey: "roleId", as: "conditional" });

Role.belongsToMany(User, { through: "user_roles", foreignKey: "roleId", otherKey: "userId" });
Role.belongsToMany(Permission, { through: "role_permissions", foreignKey: "roleId", otherKey: "permissionId" });

Permission.belongsToMany(Role, { through: "role_permissions", foreignKey: "permissionId", otherKey: "roleId" });




AttributeOption.hasMany(AttributeOptionContent, {foreignKey: "attributeOptionId", onDelete: "cascade", onUpdate: "cascade", hooks: true});
AttributeOption.hasOne(AttributeOptionContent, {foreignKey: "attributeOptionId", as: "content"});
AttributeOption.hasOne(AttributeOptionContent, {foreignKey: "attributeOptionId", as: "defaultContent"});



AttributeOptionContent.belongsTo(AttributeOption, { foreignKey: "attributeOptionId" });
AttributeOptionContent.belongsTo(Language, { foreignKey: "languageId" });

Attribute.belongsToMany(Category, { through: "attribute_categories", foreignKey: "attributeId", otherKey: "categoryId" });
Category.belongsToMany(Attribute, { through: "attribute_categories", foreignKey: "categoryId", otherKey: "attributeId" });

Attribute.hasMany(AttributeContent, {foreignKey: "attributeId", onDelete: "cascade", onUpdate: "cascade", hooks: true });
Attribute.hasOne(AttributeContent, {foreignKey: "attributeId", as: "content" });
Attribute.hasOne(AttributeContent, {foreignKey: "attributeId", as: "defaultContent"});

Attribute.hasMany(AttributeOption, {foreignKey: "attributeId"})

AttributeContent.belongsTo(Language, {foreignKey: "languageId"});

SupportTicket.hasMany(SupportMessage, { foreignKey: 'supportTicketId', as: 'messages' });
SupportMessage.belongsTo(SupportTicket, { foreignKey: 'supportTicketId', as: 'ticket' });


let Models = {
    AppVersion,
    Attachment,
    Language,
    User,
    UserProfile,
    UserAccount,
    Permission,
    PermissionContent,
    Role,
    RoleContent,
    Token,
    EmailTemplate,
    EmailTemplateContent,
    Address,
    CategoryType,
    CategoryTypeContent,
    Category,
    CategoryContent,
    Faq,
    FaqContent,
    Post,
    PostContent,
    PostMedia,
    AttributeOption,
    AttributeOptionContent,
    Notification,
    NotificationTemplate,
    NotificationTemplateContent,
    Attribute,
    AttributeContent,
    LostAndFound,
    Inquiry,
    SupportTicket,
    SupportMessage,

}

export { Models, Sequelize, sequelize };