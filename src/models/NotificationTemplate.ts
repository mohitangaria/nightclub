"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {NotificationTemplate} from '../config/interfaces/notificationTemplates'

interface NotificationTemplateInstance extends Model<NotificationTemplate>,NotificationTemplate{}

    let NotificationTemplate = sequelize.define<NotificationTemplateInstance>(
      "NotificationTemplate",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        type: { type: DataTypes.STRING,allowNull:false, unique:'notification-template'},
        replacements: { type: DataTypes.STRING,allowNull:false, defaultValue:''},
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null, comment: "Aurthor of the record"},
        accountId: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null, comment: "Aurthor account id"},
        lastUpdatedById: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null, comment: "Last user who has updated the record"},
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false,defaultValue:false, comment: "If redord is revision?"},
        revisionId:{ type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of email Template. 0-> Inactive, 1-> Active" }
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "notification_templates"
      }
    );

    export default NotificationTemplate;
 
  
