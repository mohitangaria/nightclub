"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { UserProfileInterface } from '../config/interfaces/users'

interface UserProfileInstance extends Model<UserProfileInterface>, UserProfileInterface { }

const UserProfile = sequelize.define<UserProfileInstance>(
    "UserProfile",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: { type: DataTypes.INTEGER, allowNull: false, unique: 'user-profile', comment: "User ref id" },
        name: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "User  name" },
        dob: {type: DataTypes.STRING, allowNull: true, comment: "DOB" },
        attachmentId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "User Profile image" },
        referralCode: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "Refferal code of the user" },
        generalNotifications:{type: DataTypes.BOOLEAN, allowNull:false, defaultValue:true, comment:'notifications enable disable'},
        paymentNotifications:{type: DataTypes.BOOLEAN, allowNull:false, defaultValue:true, comment:'notifications enable disable'},
        reminderNotifications:{type: DataTypes.BOOLEAN, allowNull:false, defaultValue:true, comment:'notifications enable disable'}
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "user_profiles",
        indexes: [
            { name: 'id', fields: ['id'] },
            { name: 'name', fields: ['name'] },
        ]
    }
);

UserProfile.addHook('beforeCreate', (userProfile: UserProfileInstance) => {
    userProfile.referralCode = `REF-${userProfile.userId}`;
});

export default UserProfile;