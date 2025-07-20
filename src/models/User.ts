"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { UserInterface } from '../config/interfaces/users';
import Bcrypt from "bcrypt";
import * as Constants from "../constants";


interface UserInstance extends Model<UserInterface>, UserInterface {
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
        email: { 
            type: DataTypes.STRING, 
            allowNull: false, 
            unique: 'email',
            set(value: string) {
                // convert email to lowercase before saving
                this.setDataValue('email', value.toLowerCase());
            }, 
            comment: "User's Email id" 
        },
        username: {
            type: DataTypes.STRING, allowNull: true, comment: "User's Email id" 
        },
        countryCode: { type: DataTypes.STRING, allowNull: true, comment: "Country code" },
        mobile: { type: DataTypes.STRING, allowNull: true, comment: "User's mobile no" },
        password: {
            type: DataTypes.STRING, 
            allowNull: true,
            set(value: string) {
                // Encrypt the password before saving
                if(value) {
                    const rounds = parseInt(process.env.HASH_ROUNDS!);
                    const hash = Bcrypt.hashSync(value, rounds);
                    this.setDataValue('password', hash);
                }
            }, 
            comment: "Encrypted user password" 
        },
        googleLogin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "User's mobile no" },
        facebookLogin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "User's mobile no" },
        searchIndex: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.USER_STATUS.ACTIVE, comment: "Status of user. 0-> Inactive, 1-> Active, 2-> not verified" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "users",
        indexes: [
            { name: 'id', fields: ['id'] },
            { name: 'email', fields: ['email'] },
            { name: 'users_searchIndex', fields: ['search_index'], type: 'FULLTEXT' }
        ]
    }
);

export default User;