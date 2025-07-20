"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ShopContentInterface } from '../config/interfaces/shop'

interface ShopContentInstance extends Model<ShopContentInterface>, ShopContentInterface { }

const ShopContent = sequelize.define<ShopContentInstance>(
    "ShopContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        shopId: { type: DataTypes.INTEGER, allowNull: false, comment: "" },
        languageId: { type: DataTypes.INTEGER, allowNull: false, comment: "" },
        name: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "" },
        description: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "" },
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "shop_contents",
        indexes: [

        ]
    }
);

export default ShopContent;