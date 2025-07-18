"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { Email } from '../config/interfaces/email';

interface EmailInstance extends Model<Email>, Email { }
const Email = sequelize.define<EmailInstance>(
    "Email",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        from: { type: DataTypes.STRING, allowNull: false, comment: "Email is sent from" },
        to: { type: DataTypes.STRING, allowNull: false, comment: "Email is sent to" },
        subject: { type: DataTypes.TEXT, allowNull: false, comment: "Subject of email" },
        htmlContent: { type: DataTypes.TEXT, allowNull: false, comment: "HTML content of email" },
        textContent: { type: DataTypes.TEXT, allowNull: false, comment: "Text of email" },
        type: { type: DataTypes.STRING, allowNull: false, comment: "Type of email" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "emails",
        indexes: []
    }
);

export default Email