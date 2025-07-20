"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { AttributeOptionInterface } from '../config/interfaces/attribute'

interface AttributeOptionInstance extends Model<AttributeOptionInterface>, AttributeOptionInterface { }

const AttributeOption = sequelize.define<AttributeOptionInstance>(
    "AttributeOption",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        code: { type: DataTypes.STRING, allowNull: false, unique: 'attribute-option-code', comment: "unique code for option created, generated from option name" },
        attributeId: { type: DataTypes.INTEGER, allowNull: false, unique: 'attribute-option-code', comment: "Attribute id" },
        
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "attribute_options",
        
    }
);

export default AttributeOption;

