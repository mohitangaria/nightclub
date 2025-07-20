"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { AttributeContentInterface } from '../config/interfaces/attribute'

interface AttributeContentInstance extends Model<AttributeContentInterface>, AttributeContentInterface { }

const AttributeContent = sequelize.define<AttributeContentInstance>(
    "AttributeContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        attributeId: { type: DataTypes.INTEGER, allowNull: false, comment: "Attribute id" },
        languageId: { type: DataTypes.INTEGER, allowNull: false, comment: "Language id" },
        name: { type: DataTypes.STRING, allowNull: false, comment: "Name of the attribute" },
        dataDump: { type: DataTypes.JSON, comment: "Original Payload" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "attribute_contents",
        
    }
);

export default AttributeContent;

