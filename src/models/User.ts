"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {UserInterface} from '../config/interfaces'


interface UserInstance extends Model<UserInterface>,UserInterface{
    setRoles(arg0: number[], arg1: { transaction: import("sequelize").Transaction; }): unknown;
}

const User = sequelize.define<UserInstance>(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        email: { type: DataTypes.STRING, allowNull: true,defaultValue:null, unique:'email',comment: "User's Email id" },
        countryCode: { type: DataTypes.STRING, allowNull: true,defaultValue:null,comment: "Country code" },
        mobile: { type: DataTypes.STRING, allowNull: true, defaultValue:null,comment: "User's mobile no"},
        password: { type: DataTypes.STRING, allowNull: true,comment: "Encrypted user password"},
        status: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Status of user. 0-> Inactive, 1-> Active" },
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "users",
        indexes:[
            
        ]
    }
);
export default User;