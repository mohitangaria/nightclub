"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ProductContentInterface } from '../config/interfaces/product'

interface ProductContentInstance extends Model<ProductContentInterface>, ProductContentInterface { }

const ProductContent = sequelize.define<ProductContentInstance>(
    "ProductContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        productId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Store id" },
        languageId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Category id" },
        originalName: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "Product name as entered" },
        name: { type: DataTypes.TEXT, allowNull: true, defaultValue: null,  comment: "Product name with extra information" },
        description: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null,  comment: "Product description" },
        descriptionText: { type: DataTypes.TEXT('long'), allowNull: true, defaultValue: null,  comment: "Product description" },
        keywords: { type: DataTypes.TEXT, allowNull: true, defaultValue: false, comment: "keywords" },
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "product_contents",
        
    }
);

export default ProductContent;

