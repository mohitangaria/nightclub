"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ProductAttributeInterface } from '../config/interfaces/product'

interface ProductAttributeInstance extends Model<ProductAttributeInterface>, ProductAttributeInterface { }

const ProductAttribute = sequelize.define<ProductAttributeInstance>(
    "ProductAttribute",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        productId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Product id" },
        attributeId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Attribute id" },
        code: { type: DataTypes.STRING, allowNull: true, defaultValue: null,  comment: "Slug of attribute value" },
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "product_attributes",
        
    }
);

export default ProductAttribute;

