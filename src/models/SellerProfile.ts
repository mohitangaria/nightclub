"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { SellerProfileInterface } from '../config/interfaces/users'

interface SellerProfileInstance extends Model<SellerProfileInterface>, SellerProfileInterface { }

const SellerProfile = sequelize.define<SellerProfileInstance>(
    "SellerProfile",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: { type: DataTypes.INTEGER, allowNull: false, unique: 'user-profile', comment: "User ref id" },
        name: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "User  name" },
        contactEmail: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "User  name" },
        contactCountryCode: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "User  name" },
        contactPhone: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "User  name" },
        storeUrl: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "User  name" },
        socialMediaLink: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "User  name" },
        hasSellerAccount: { type: DataTypes.BOOLEAN, defaultValue: false, comment: "user enrolled for seller or not" },
        attachmentId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "User Profile image" },
        isStripeConnected: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false, comment: "User Profile image" },
        isVerifiedDocuments: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false, comment: "User Profile image" },
        isVerifiedProfile: { type: DataTypes.BOOLEAN, allowNull: true, defaultValue: false, comment: "User Profile image" },
        comment: { type: DataTypes.TEXT, allowNull: true, defaultValue: null, comment: "" },
        currentStatus: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 0, comment: "" },
        status: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Status of user. 0-> Inactive, 1-> Active, 2-> not verified" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "seller_profile",
        indexes: [

        ]
    }
);

export default SellerProfile;