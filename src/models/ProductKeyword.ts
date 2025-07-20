"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ProductKeywordInterface } from '../config/interfaces/product'

interface ProductKeywordInstance extends Model<ProductKeywordInterface>, ProductKeywordInterface { }

const ProductKeyword = sequelize.define<ProductKeywordInstance>(
    "ProductKeyword",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        productId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Product id" },
        code: { type: DataTypes.STRING, allowNull: false, comment: "unique code for keyword created, generated from title" },
        
        
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "product_keywords",
        
    }
);

export default ProductKeyword;

