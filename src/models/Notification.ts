"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {Notification} from '../config/interfaces/notificationTemplates'

interface NotificationInstance extends Model<Notification>,Notification{}

let Notification = sequelize.define<NotificationInstance>("Notification", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    type: { 
        type: DataTypes.STRING, allowNull: false, unique: 'notification-template',
        comment: 'The unique type or category of the notification (e.g., "account_approved", "message_received")'
    },
    replacements: { 
        type: DataTypes.JSON, allowNull: true, defaultValue: null,
        comment: 'Placeholder replacements for the notification content (e.g., "{{name}}", "{{date}}")'
    },
    userId: { 
        type: DataTypes.INTEGER, allowNull: true, defaultValue: null, 
        comment: 'The ID of the user who created or owns this record'
    },
    notificationTemplateId: { 
        type: DataTypes.INTEGER, allowNull: true, defaultValue: null, 
        comment: 'The ID of the associated notification template'
    },
    title: { 
        type: DataTypes.TEXT, allowNull: false,
        comment: 'The title of the notification template before replacements are applied'
    },
    content: { 
        type: DataTypes.TEXT, allowNull: false,
        comment: 'The content of the notification template before replacements are applied'
    },
    compiledTitle: { 
        type: DataTypes.TEXT, allowNull: false,
        comment: 'The title of the notification with placeholders replaced by actual values'
    },
    compiledContent: { 
        type: DataTypes.TEXT, allowNull: false,
        comment: 'The content of the notification with placeholders replaced by actual values'
    },
    notificationObject: { 
        type: DataTypes.JSON, allowNull: true,
        comment: 'A JSON object that stores additional data relevant to the notification (e.g., actions, metadata)'
    }
    },
    {
    paranoid: true,
    underscored: true,
    tableName: "notifications"
    }
);

export default Notification;
 
  
