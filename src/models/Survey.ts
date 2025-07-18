"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { SurveyInterface, SurveyContentInterface } from '../config/interfaces/survey'
interface SurveyInstance extends Model<SurveyInterface>, SurveyInterface { 
    setAttachments(arg0: number[], arg1: { transaction: import("sequelize").Transaction; }): unknown;
}

const Survey = sequelize.define<SurveyInstance>(
    "Survey",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        slug: { type: DataTypes.STRING, allowNull: false, unique: 'survey', comment: "unique code for categoryType created, generated from title" },
        communityId: { type: DataTypes.INTEGER, allowNull: false, unique: 'survey', comment: "Community in which survey is posted" },
        surveyFeaturedImage: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Survey fetaured image" },
        surveyType: { type: DataTypes.INTEGER, allowNull: false, comment: "Type of survey" },
        surveyUrl: { type: DataTypes.TEXT, allowNull: false, comment: "Survey url" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor of the record" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Last user who has updated the record" },
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "If redord is revision?" },
        revisionId: { type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of CategoryType. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "communities_surveys",
        indexes: [
            { name: 'id-revision', fields: ['id', 'is_revision'] },
        ]
    }
);
export default Survey;