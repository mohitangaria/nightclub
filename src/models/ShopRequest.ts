"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ShopRequestInterface } from '../config/interfaces/users'

interface ShopRequestInstance extends Model<ShopRequestInterface>, ShopRequestInterface { }

const ShopRequest = sequelize.define<ShopRequestInstance>(
    "ShopRequest",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: { type: DataTypes.INTEGER, allowNull: false, comment: "User ref id" },
        accountId: { type: DataTypes.INTEGER, allowNull: false, comment: "User ref id" },
        shopName: { type: DataTypes.STRING, allowNull: false, comment: "User  name" },
        requestObject: { type: DataTypes.JSON, allowNull: true, defaultValue: null, comment: "User  name" },
        status: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Status of user. 0-> Inactive, 1-> Active, 2-> not verified" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "shop_requests",
        indexes: []
    }
);

export default ShopRequest;