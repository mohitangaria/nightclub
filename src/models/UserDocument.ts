"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {UserDocumentInterface} from '../config/interfaces/document'


interface UserDocumentInstance extends Model<UserDocumentInterface>,UserDocumentInterface{}

let UserDocument = sequelize.define<UserDocumentInstance>(
  "UserDocument",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    documentId: { type: DataTypes.INTEGER,allowNull:false,comment:""},
    userId: { type: DataTypes.INTEGER, allowNull: false,comment: ""},
    attachmentId: { type: DataTypes.INTEGER, allowNull: true,comment: ""},
    agreement: { type: DataTypes.JSON, allowNull: true, defaultValue: null, comment: "" },
    isSigned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "" },
    signAttachmentId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "" },
    docCreatedDate: { type: DataTypes.DATE, allowNull: true, defaultValue: null, comment: "" },
    docSignedDate: { type: DataTypes.DATE, allowNull: true, defaultValue: null, comment: "" },
    linkedHtml: { type: DataTypes.TEXT, allowNull: false, defaultValue: false, comment: "" },
    lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Last user who has updated the record"},
    accountId:{ type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Account for which role has been created"},
    isRevision: { type: DataTypes.BOOLEAN, allowNull: false,defaultValue:false,comment: "Revision of updates"},
    revisionId:{ type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
    status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of role. 0-> Inactive, 1-> Active" }
  },
  {
    paranoid: true,
    underscored: true,
    tableName: "user_documents"
  }
);

  export default UserDocument;
  
