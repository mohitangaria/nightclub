"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ShopInterface } from '../config/interfaces/shop'

interface ShopInstance extends Model<ShopInterface>, ShopInterface { }

const Shop = sequelize.define<ShopInstance>(
    "Shop",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        code: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "" },
        userId: { type: DataTypes.INTEGER, allowNull: false, comment: "User ref id" },
        accountId: { type: DataTypes.INTEGER, allowNull: true, comment: "User ref id" },
        contactName: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "" },
        contactEmail: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "" },
        contactCountryCode: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "" },
        contactPhone: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "" },
        shopUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "" },
        isfeatured: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, comment: "" },
        isVerified: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "" },
        settings: { type: DataTypes.JSON, allowNull: false, defaultValue: {}, comment: "" },
        slots: { type: DataTypes.JSON, allowNull: false, defaultValue: {}, comment: "" },
        attachments: { type: DataTypes.JSON, allowNull: false, defaultValue: [], comment: "" },
        social: { type: DataTypes.JSON, allowNull: false, defaultValue: {}, comment: "" },
        bankAccountId: { type: DataTypes.INTEGER, allowNull: true },
        documentId: { type: DataTypes.INTEGER, allowNull: true },
        searchIndex: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
        meta: { type: DataTypes.JSON, allowNull: false, defaultValue: [], comment: "" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "" },
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "If redord is revision?" },
        revisionId: { type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        status: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Status of user. 0-> Inactive, 1-> Active, 2-> not verified" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "shops",
        indexes: [
            { name: 'shops_searchIndex', fields: ['search_index'], type: 'FULLTEXT' }
        ]
    }
);

export default Shop;