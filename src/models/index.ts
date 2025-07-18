"use strict";
import { Dialect, Sequelize } from 'sequelize'
import * as Fs from 'file-system';
import * as path from 'path';
const {DB_NAME,DB_USER_NAME,DB_PASSWORD,DB_HOST} = require(__dirname + '/../config/config')[process.env.NODE_ENV!];
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


import Attachment  from './Attachment';
import Language from './Language';
import AppVersion from './AppVersion';

import EmailTemplate from './EmailTemplate';
import EmailTemplateContent from './EmailTemplateContent';
import SystemEmails from './Emails';

import User from "./User";
import UserProfile from "./UserProfile";
import UserAccount from "./UserAccount";

import Role from './Role';
import RoleContent from './RoleContent';

import Permission from './Permission';
import PermissionContent from './PermissionContent';

import CategoryType from './CategoryType';
import CategoryTypeContent from './CategoryTypeContent';
import Category from './Category';
import CategoryContent from './CategoryContent';

import Token from './Token';

import Community from './Community';
import CommunityContent from './CommunityContent';
import Topic from './Topic';
import TopicContent from './TopicContent';
import Reply from './Reply';
import Page from './Page';
import PageContent from "./PageContent"
import News from './News';
import NewsContent from "./NewsContent"
import Poll from './Poll';
import PollContent from "./PollContent"
import Survey from './Survey';
import SurveyContent from "./SurveyContent"

import Diary from './Diary';
import DiaryContent from "./DiaryContents"
import DiaryEntry from './DiaryEntry';

import Invitation from './Invitation';
import InvitatedMember from './InvitatedMember';

Community.belongsTo(User,{foreignKey:"userId",as:"createdBy"})
Community.belongsTo(User,{foreignKey:"lastUpdatedBy",as:"updatedBy"})
Community.hasMany(CommunityContent,{foreignKey:"communityId"});
Community.belongsTo(Attachment, { foreignKey: "communityLogo",as:"logo" });
Community.belongsToMany(Attachment, { through: "communities_attachments",foreignKey: "communityId",otherKey: "attachmentId"});
Community.belongsToMany(Attachment, { through: "communities_attachments",foreignKey: "communityId",otherKey: "attachmentId",as:"communityAttachments" });
Community.hasOne(CommunityContent,{foreignKey:'communityId',as:'content'});
Community.hasOne(CommunityContent,{foreignKey:'communityId',as:'defaultContent'});
CommunityContent.belongsTo(Language, { foreignKey: "languageId"});
Community.hasMany(Topic,{foreignKey:'communityId',as:'topics',onDelete: 'cascade'});

Topic.belongsTo(User,{foreignKey:"userId",as:"createdBy"})
Topic.belongsTo(User,{foreignKey:"lastUpdatedBy",as:"updatedBy"})
Topic.hasMany(TopicContent,{foreignKey:"topicId"});
Topic.hasOne(TopicContent,{foreignKey:'topicId',as:'content'});
Topic.hasOne(TopicContent,{foreignKey:'topicId',as:'defaultContent'});
TopicContent.belongsTo(Language, { foreignKey: "languageId"});
Topic.belongsTo(Attachment, { foreignKey: "topicFeaturedImage",as:"topicImage" });
Topic.belongsToMany(Attachment, { through: "communities_topics_attachments",foreignKey: "topicId",otherKey: "attachmentId"});
Topic.belongsToMany(Attachment, { through: "communities_topics_attachments",foreignKey: "topicId",otherKey: "attachmentId",as:"topicAttachments" });
Topic.hasMany(Reply,{foreignKey:'topicId',as:'replies'});
Reply.belongsTo(User,{foreignKey:"userId",as:"createdBy"})
Reply.belongsToMany(Attachment, { through: "communities_topics_replies_attachments",foreignKey: "replyId",otherKey: "attachmentId"});
Reply.belongsToMany(Attachment, { through: "communities_topics_replies_attachments",foreignKey: "replyId",otherKey: "attachmentId",as:"replyAttachments" });


Page.belongsTo(User,{foreignKey:"userId",as:"createdBy"})
Page.belongsTo(User,{foreignKey:"lastUpdatedBy",as:"updatedBy"})
Page.hasMany(PageContent,{foreignKey:"pageId"});
Page.hasOne(PageContent,{foreignKey:'pageId',as:'content'});
Page.hasOne(PageContent,{foreignKey:'pageId',as:'defaultContent'});
PageContent.belongsTo(Language, { foreignKey: "languageId"});
Page.belongsTo(Attachment, { foreignKey: "pageFeaturedImage",as:"pageImage" });
Page.belongsToMany(Attachment, { through: "communities_pages_attachments",foreignKey: "pageId",otherKey: "attachmentId"});
Page.belongsToMany(Attachment, { through: "communities_pages_attachments",foreignKey: "pageId",otherKey: "attachmentId",as:"pageAttachments" });

News.belongsTo(User,{foreignKey:"userId",as:"createdBy"})
News.belongsTo(User,{foreignKey:"lastUpdatedBy",as:"updatedBy"})
News.hasMany(NewsContent,{foreignKey:"newsId"});
News.hasOne(NewsContent,{foreignKey:'newsId',as:'content'});
News.hasOne(NewsContent,{foreignKey:'newsId',as:'defaultContent'});
NewsContent.belongsTo(Language, { foreignKey: "languageId"});
News.belongsTo(Attachment, { foreignKey: "newsFeaturedImage",as:"newsImage" });
News.belongsToMany(Attachment, { through: "communities_news_attachments",foreignKey: "newsId",otherKey: "attachmentId"});
News.belongsToMany(Attachment, { through: "communities_news_attachments",foreignKey: "newsId",otherKey: "attachmentId",as:"newsAttachments" });


Poll.belongsTo(User,{foreignKey:"userId",as:"createdBy"})
Poll.belongsTo(User,{foreignKey:"lastUpdatedBy",as:"updatedBy"})
Poll.hasMany(PollContent,{foreignKey:"pollId"});
Poll.hasOne(PollContent,{foreignKey:'pollId',as:'content'});
Poll.hasOne(PollContent,{foreignKey:'pollId',as:'defaultContent'});
PollContent.belongsTo(Language, { foreignKey: "languageId"});
Poll.belongsTo(Attachment, { foreignKey: "pollFeaturedImage",as:"pollImage" });
Poll.belongsToMany(Attachment, { through: "communities_polls_attachments",foreignKey: "pollId",otherKey: "attachmentId"});

Survey.belongsTo(User,{foreignKey:"userId",as:"createdBy"})
Survey.belongsTo(User,{foreignKey:"lastUpdatedBy",as:"updatedBy"})
Survey.hasMany(SurveyContent,{foreignKey:"surveyId"});
Survey.hasOne(SurveyContent,{foreignKey:'surveyId',as:'content'});
Survey.hasOne(SurveyContent,{foreignKey:'surveyId',as:'defaultContent'});
SurveyContent.belongsTo(Language, { foreignKey: "languageId"});
Survey.belongsTo(Attachment, { foreignKey: "SurveyFeaturedImage",as:"surveyImage" });
Survey.belongsToMany(Attachment, { through: "communities_survey_attachments",foreignKey: "surveyId",otherKey: "attachmentId"});

Diary.belongsTo(User,{foreignKey:"userId",as:"createdBy"})
Diary.belongsTo(User,{foreignKey:"lastUpdatedBy",as:"updatedBy"})
Diary.hasMany(DiaryContent,{foreignKey:"diaryId"});
Diary.hasOne(DiaryContent,{foreignKey:'diaryId',as:'content'});
Diary.hasOne(DiaryContent,{foreignKey:'diaryId',as:'defaultContent'});
DiaryContent.belongsTo(Language, { foreignKey: "languageId"});
Diary.belongsTo(Attachment, { foreignKey: "diaryFeaturedImage",as:"diaryImage" });
Diary.belongsToMany(Attachment, { through: "communities_diary_attachments",foreignKey: "diaryId",otherKey: "attachmentId"});
Diary.belongsToMany(Attachment, { through: "communities_diary_attachments",foreignKey: "diaryId",otherKey: "attachmentId",as:"diaryAttachments" });

DiaryEntry.belongsTo(Diary,{foreignKey:"diary"})
DiaryEntry.belongsTo(User,{foreignKey:"userId",as:"createdBy"})
DiaryEntry.belongsTo(User,{foreignKey:"lastUpdatedBy",as:"updatedBy"})
DiaryEntry.belongsTo(Attachment, { foreignKey: "entryFeaturedImage",as:"diaryEntryImage" });
DiaryEntry.belongsToMany(Attachment, { through: "communities_diary_entry_attachments",foreignKey: "diaryEntryId",otherKey: "attachmentId"});
DiaryEntry.belongsToMany(Attachment, { through: "communities_diary_entry_attachments",foreignKey: "diaryEntryId",otherKey: "attachmentId",as:"diaryEntryAttachments" });


Category.hasMany(CategoryContent, {foreignKey: "categoryId",onDelete: 'cascade', hooks:true});
Category.hasOne(CategoryContent,{foreignKey:'categoryId',as:'content'});
Category.hasOne(CategoryContent,{foreignKey:'categoryId',as:'defaultContent'});
Category.belongsTo(CategoryType, {foreignKey: "categorytypeId",as:'categorytype'});
Category.belongsTo(Attachment,{foreignKey:'imageId',as:"categoryImage"})
Category.belongsTo(User,{foreignKey:'userId',as:'author'});
Category.belongsTo(User,{foreignKey:'lastUpdatedBy',as:'updatedBy'});
Category.belongsTo(Category,{foreignKey:'parentId',as:'parent'}),
Category.hasMany(Category, {foreignKey: "parentId",onDelete: 'cascade', hooks:true,as:'children'});
Category.hasMany(PermissionContent, {foreignKey: "categoryId",onDelete: 'cascade', hooks:true});

CategoryContent.belongsTo(Category, {foreignKey: "categoryId"});
CategoryContent.belongsTo(Language, { foreignKey: "languageId"});

CategoryType.hasMany(CategoryTypeContent, {foreignKey: "categoryTypeId",onDelete: 'cascade', hooks:true})
CategoryType.hasOne(CategoryTypeContent,{foreignKey:'categoryTypeId',as:'content'})
CategoryType.hasOne(CategoryTypeContent,{foreignKey:'categoryTypeId',as:'defaultContent'})
CategoryType.belongsTo(User,{foreignKey:'userId',as:'author'})
CategoryType.belongsTo(User,{foreignKey:'lastUpdatedBy',as:'updatedBy'});

CategoryTypeContent.belongsTo(CategoryType, {foreignKey: "categorytypeId"});
CategoryTypeContent.belongsTo(Language, { foreignKey: "languageId"});



Language.belongsTo(CategoryTypeContent, { foreignKey: "languageId" });


EmailTemplate.hasMany(EmailTemplateContent, { foreignKey: "EmailTemplateId", onDelete: 'cascade',hooks:true});
EmailTemplate.hasMany(EmailTemplateContent, { foreignKey: "EmailTemplateId", onDelete: 'cascade', hooks:true, as:"content"});
EmailTemplate.hasMany(EmailTemplateContent, { foreignKey: "EmailTemplateId", onDelete: 'cascade', hooks:true, as:"defaultContent" });

EmailTemplateContent.belongsTo(EmailTemplate, { foreignKey: "EmailTemplateId"});
EmailTemplateContent.belongsTo(Language, { foreignKey: "languageId"});
EmailTemplateContent.belongsTo(EmailTemplate, { foreignKey: "EmailTemplateId"});
EmailTemplateContent.belongsTo(Language, { foreignKey: "languageId"});


User.hasOne(UserProfile, { foreignKey: "userId", as: "userProfile", onDelete: 'cascade',hooks:true });
User.hasMany(UserAccount, { foreignKey: "userId", as: "userAccounts", onDelete: "cascade", hooks: true });
User.hasOne(UserAccount, { foreignKey: "userId", as: "userAccount" });
User.belongsToMany(Role, { through: "user_roles", foreignKey: "userId",otherKey: "roleId"});



UserProfile.belongsTo(User, {foreignKey: 'userId'});
UserProfile.belongsTo(Attachment, {foreignKey: "imageId",as:'profileAttachment'});

Role.belongsToMany(User, { through: "user_roles",foreignKey: "roleId",otherKey: "userId" });
Role.belongsToMany(Permission, { through: "role_permissions",foreignKey: "roleId",otherKey: "permissionId" });
Role.hasMany(RoleContent,{foreignKey:'roleId'})
Role.hasOne(RoleContent,{foreignKey:'roleId',as:'content'})
Role.hasOne(RoleContent,{foreignKey:'roleId',as:'defaultContent'}),
Role.belongsTo(User,{foreignKey:'userId',as:'author'});
Role.belongsTo(User,{foreignKey:'lastUpdatedBy',as:'updatedBy'});

RoleContent.belongsTo(Role, { foreignKey: "roleId"});
RoleContent.belongsTo(Language, { foreignKey: "languageId"});

Permission.belongsToMany(Role, { through: "role_permissions",foreignKey: "permissionId",otherKey: "roleId" });
Permission.hasMany(PermissionContent,{foreignKey:'permissionId'})
Permission.hasOne(PermissionContent,{foreignKey:'permissionId',as:'content'})
Permission.hasOne(PermissionContent,{foreignKey:'permissionId',as:'defaultContent'})
Permission.belongsTo(User,{foreignKey:'userId',as:'author'});
Permission.belongsTo(User,{foreignKey:'lastUpdatedBy',as:'updatedBy'});

PermissionContent.belongsTo(PermissionContent, { foreignKey: "permissionId"});
PermissionContent.belongsTo(Language, { foreignKey: "languageId"});

Invitation.hasMany(InvitatedMember, { foreignKey: "invitationId", onDelete: 'cascade',hooks:true });


let Models={
    Attachment,
    EmailTemplate,
    EmailTemplateContent,
    Language,
    SystemEmails,
    User,
    UserProfile,
    UserAccount,
    Permission,
    PermissionContent,
    Role,
    RoleContent,
    Token,
    Category,
    CategoryContent,
    CategoryType,
    CategoryTypeContent,
    AppVersion,
    Community,
    CommunityContent,
    Topic,
    TopicContent,
    Reply,
    Page,
    PageContent,
    News,
    NewsContent,
    Poll,
    PollContent,
    Survey,
    SurveyContent,
    Diary,
    DiaryContent,
    DiaryEntry,
    Invitation,
    InvitatedMember
}

export {Models,Sequelize, sequelize };