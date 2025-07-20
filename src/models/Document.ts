"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {DocumentInterface} from '../config/interfaces/document'


interface DocumentInstance extends Model<DocumentInterface>,DocumentInterface{}

let Document = sequelize.define<DocumentInstance>(
  "Document",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    documentType: { type: DataTypes.STRING,allowNull:false,comment:""},
    userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Aurthor of role, null means system default"},
    lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Last user who has updated the record"},
    accountId:{ type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Account for which role has been created"},
    isRevision: { type: DataTypes.BOOLEAN, allowNull: false,defaultValue:false,comment: "Revision of updates"},
    revisionId:{ type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
    status: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Status of role. 0-> Inactive, 1-> Active" }
  },
  {
    paranoid: true,
    underscored: true,
    tableName: "documents"
  }
);

  export default Document;
  
