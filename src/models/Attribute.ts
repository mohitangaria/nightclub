"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { AttributeInterface } from '../config/interfaces/attribute'

interface AttributeInstance extends Model<AttributeInterface>, AttributeInterface {
    setCategories(arg0: number[], arg1: { transaction: import("sequelize").Transaction; }): unknown;
 }

const Attribute = sequelize.define<AttributeInstance>(
    "Attribute",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        code: { type: DataTypes.STRING, allowNull: false, unique: 'category-attribute-code', comment: "unique code for categorytype created, generated from title" },
        type: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1,  comment: "Parent of category" },
        isVariant: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 0, comment: "Aurthor of the record" },
        accountId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor account identity" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor account identity" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Last user who has updated the record" },
        orderSequence: { type: DataTypes.TEXT, allowNull: true, defaultValue: null, comment: "Order sequence for tree structure" },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of Category. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "attributes",
        
    }
);

export default Attribute;

