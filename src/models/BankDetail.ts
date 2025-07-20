"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { BankDetailInterface } from '../config/interfaces/bankDetails';
import * as Constants from "../constants";

interface BankDetailInstance extends Model<BankDetailInterface>, BankDetailInterface {}

const BankDetail = sequelize.define<BankDetailInstance>(
    "BankDetail",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: { type: DataTypes.INTEGER, allowNull: false, comment: "User ref id" },
        details: { type: DataTypes.JSON, allowNull: false, comment: "" },
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false,defaultValue:false,comment: "Revision of updates"},
        revisionId:{ type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        status: { type: DataTypes.INTEGER, defaultValue: Constants.USER_STATUS.ACTIVE, comment: "Status of user. 0-> Inactive, 1-> Active, 2-> not verified" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "bank_details",
        indexes: [
            { name: 'id', fields: ['id'] }
        ]
    }
);

export default BankDetail;