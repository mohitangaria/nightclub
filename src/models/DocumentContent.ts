"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { DocumentContentInterface } from '../config/interfaces/document';

interface DocumentContentInstance extends Model<DocumentContentInterface>, DocumentContentInterface {}

const DocumentContent = sequelize.define<DocumentContentInstance>(
    "DocumentContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        documentId:{ type: DataTypes.INTEGER, allowNull: false,comment: "Ref to post table"},
        languageId: { type: DataTypes.INTEGER, allowNull: false,comment: "Language for which content has been created"},
        title: { type: DataTypes.TEXT, allowNull: false,comment: "Title of the post" },
        titleText: { type: DataTypes.TEXT, allowNull: false,comment: "Title of the post in text format" },
        description: { type: DataTypes.TEXT, allowNull: false,comment: "Description of the post" },
        descriptionText: { type: DataTypes.TEXT, allowNull: false,comment: "Descriotion of the post in text format" },
        excerpt: { type: DataTypes.TEXT, allowNull: false,comment: "Excerpt of the post" },
        excerptText: { type: DataTypes.TEXT, allowNull: false,comment: "Excerpt of the post in text format"}
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "document_contents",
        indexes: [
        ]
    }
);

export default DocumentContent;