"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ProductKeywordContentInterface } from '../config/interfaces/product'

interface ProductKeywordContentInstance extends Model<ProductKeywordContentInterface>, ProductKeywordContentInterface { }

const ProductKeywordContent = sequelize.define<ProductKeywordContentInstance>(
    "ProductKeywordContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        productKeywordId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Product keyword id" },
        languageId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Lanuage id" },
        value: { type: DataTypes.STRING, allowNull: true, defaultValue: null,  comment: "Keyword value" },
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "product_keyword_contents",
        
    }
);

export default ProductKeywordContent;