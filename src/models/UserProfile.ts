"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {UserProfileInterface} from '../config/interfaces'

interface UserProfileInstance extends Model<UserProfileInterface>,UserProfileInterface{}

const UserProfile = sequelize.define<UserProfileInstance>(
    "UserProfile",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: { type: DataTypes.INTEGER, allowNull: false, unique:'user-profile',comment: "User ref id" },
        name: { type: DataTypes.STRING, allowNull: true, defaultValue:null,comment: "User  name"},
        imageId: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "User Profile image"}
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "users_profile",
        indexes:[
            
        ]
    }
);
export default UserProfile;