"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { BrandInterface } from '../config/interfaces/brand'

interface BrandInstance extends Model<BrandInterface>, BrandInterface { }

const Brand = sequelize.define<BrandInstance>(
    "Brand",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        code: { type: DataTypes.STRING, allowNull: false, unique: 'brand-code', comment: "unique code for brand created, generated from title" },
        attachmentId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null,  comment: "Brand logo" },
        accountId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor account identity" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor account identity" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Last user who has updated the record" },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of Brand. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "brands",
        
    }
);

export default Brand;

