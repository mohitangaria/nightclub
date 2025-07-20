"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ProductGalleryInterface } from '../config/interfaces/product'

interface ProductGalleryInstance extends Model<ProductGalleryInterface>, ProductGalleryInterface { }

const ProductGallery = sequelize.define<ProductGalleryInstance>(
    "ProductGallery",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        productId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Product id" },
        attachmentId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Attachment id" },
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "product_gallery",
        
    }
);

export default ProductGallery;

