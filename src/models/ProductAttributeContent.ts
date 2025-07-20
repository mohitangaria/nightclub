"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ProductAttributeContentInterface } from '../config/interfaces/product'

interface ProductAttributeContentInstance extends Model<ProductAttributeContentInterface>, ProductAttributeContentInterface { }

const ProductAttributeContent = sequelize.define<ProductAttributeContentInstance>(
    "ProductAttributeContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        productAttributeId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Product attribute id" },
        languageId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Lanuage id" },
        value: { type: DataTypes.STRING, allowNull: true, defaultValue: null,  comment: "Attribute value" },
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "product_attribute_contents",
        
    }
);

export default ProductAttributeContent;

