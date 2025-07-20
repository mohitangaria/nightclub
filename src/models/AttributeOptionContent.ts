"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { AttributeOptionContentInterface } from '../config/interfaces/attribute'

interface AttributeOptionContentInstance extends Model<AttributeOptionContentInterface>, AttributeOptionContentInterface { }

const AttributeOptionContent = sequelize.define<AttributeOptionContentInstance>(
    "AttributeOptionContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        attributeOptionId: { type: DataTypes.INTEGER, allowNull: false, comment: "Attribute option id" },
        languageId: { type: DataTypes.INTEGER, allowNull: false, comment: "Language id" },
        name: { type: DataTypes.STRING, allowNull: false, comment: "Name of the attribute option" },
        dataDump: { type: DataTypes.JSON, comment: "Original Payload" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "attribute_option_contents",
        
    }
);

export default AttributeOptionContent;

