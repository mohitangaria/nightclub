"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {NotificationTemplateContent} from '../config/interfaces/notificationTemplates'

interface NotificationTemplateContentInstance extends Model<NotificationTemplateContent>,NotificationTemplateContent{}

    let NotificationTemplateContent = sequelize.define<NotificationTemplateContentInstance>(
      "NotificationTemplateContent",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        notificationTemplateId: { type: DataTypes.INTEGER,allowNull:false,unique:'unique-language-content'},
        languageId:{type: DataTypes.INTEGER,allowNull:false,unique:'unique-language-content'},
        title: { type: DataTypes.TEXT,allowNull:false},
        content: { type: DataTypes.TEXT,allowNull:false}
      },
      {
        paranoid: true,
        underscored: true,
        tableName: "notification_template_content",
        indexes:[
            {name: 'name', fields: ['title','content'],type: 'FULLTEXT'}
          ]
      }
    );

    export default NotificationTemplateContent;