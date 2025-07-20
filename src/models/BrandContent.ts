"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { BrandContentInterface } from '../config/interfaces/brand'

interface BrandContentInstance extends Model<BrandContentInterface>, BrandContentInterface { }

const BrandContent = sequelize.define<BrandContentInstance>(
    "BrandContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        brandId: { type: DataTypes.INTEGER, allowNull: false, comment: "Brand id" },
        languageId: { type: DataTypes.INTEGER, allowNull: false, comment: "Language id" },
        name: { type: DataTypes.STRING, allowNull: false, comment: "Name of the brand" },
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "brand_contents",
        
    }
);

export default BrandContent;

