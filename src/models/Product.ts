"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ProductInterface } from '../config/interfaces/product'

interface ProductInstance extends Model<ProductInterface>, ProductInterface { }

const Product = sequelize.define<ProductInstance>(
    "Product",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        storeId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Store id" },
        categoryId: { type: DataTypes.INTEGER, allowNull: false,  comment: "Category id" },
        brandId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null,  comment: "Category id" },
        parentProductId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: false,  comment: "Parent product id" },
        code: { type: DataTypes.STRING, allowNull: false, comment: "unique code for brand created, generated from title" },
        attachmentId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null,  comment: "Product main image" },
        basePrice: { type: DataTypes.DECIMAL(10,2), allowNull: false, defaultValue: 0,  comment: "Product base price" },
        sku: { type: DataTypes.STRING, allowNull: false, comment: "unique sku" },

        rentalDurationType: { type: DataTypes.TINYINT, defaultValue: 0, comment: "" },
        rentalDuration: { type: DataTypes.INTEGER, defaultValue: 0, comment: "" },
        rentalPrice: { type: DataTypes.DECIMAL(10,2), defaultValue: 0, comment: "" },
        securityDeposit: { type: DataTypes.DECIMAL(10,2), defaultValue: 0, comment: "" },
        prepDays: { type: DataTypes.INTEGER, defaultValue: 0, comment: "" },
        preLovedPrice: { type: DataTypes.DECIMAL(10,2), defaultValue: 0, comment: "" },

        dimmensions: { type: DataTypes.INTEGER, defaultValue: 0, comment: "" },
        weight: { type: DataTypes.INTEGER, defaultValue: 0, comment: "" },
        weightUnit: { type: DataTypes.INTEGER, defaultValue: 0, comment: "" },

        productType: { type: DataTypes.TINYINT, allowNull: true, defaultValue: null, comment: "1=>Rent, 2=>Buy, 3=>preloved" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor account identity" },
        accountId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor account identity" },
        approvalStatus: { type: DataTypes.TINYINT, defaultValue: 0, comment: "Status of Product. 0-> Inactive, 1-> Active" },
        status: { type: DataTypes.TINYINT, defaultValue: 0, comment: "Status of Product. 0-> Inactive, 1-> Active" },
        reason: { type: DataTypes.TEXT, allowNull: true, defaultValue: null, comment: "Reason for rejection" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Last user who has updated the record" }
        
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "products",
        
    }
);

export default Product;

