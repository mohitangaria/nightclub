"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { FaqInterface } from '../config/interfaces/faqs';
import Bcrypt from "bcrypt";
import * as Constants from "../constants";

interface FaqInstance extends Model<FaqInterface>, FaqInterface {};

const Faq = sequelize.define<FaqInstance>(
    "Faq",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        categoryId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "category of the faq" },
        accountId: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Aurthor account identity"},
        userId: { type: DataTypes.INTEGER, allowNull: false,comment: "User who have created the faq" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Last user who has updated the record"},
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false,defaultValue:false,comment: "If redord is revision?"},
        revisionId:{ type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        sortOrder: { type: DataTypes.INTEGER, defaultValue: 0, comment: "order number" },
        searchIndex: { type: DataTypes.TEXT, allowNull: true, defaultValue: null },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of Category. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "faqs",
        indexes: [
            { name: 'id', fields: ['id'] },
            { name: 'faqs_searchIndex', fields: ['search_index'], type: 'FULLTEXT' }
        ]
    }
);

export default Faq;