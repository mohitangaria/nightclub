"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {SurveyContentInterface} from '../config/interfaces/survey'

interface SurveyContentInstance extends Model<SurveyContentInterface >,SurveyContentInterface {}
const SurveyContent = sequelize.define<SurveyContentInstance>(
        "SurveyContent",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            surveyId:{ type: DataTypes.INTEGER, allowNull: false,unique:'survey-title',comment: "Ref to survey table"},
            languageId: { type: DataTypes.INTEGER, allowNull: false,unique:'survey-title', comment: "language for which content has been created"},
            title: { type: DataTypes.TEXT, allowNull: false,comment: "Title of the survey" },
            excerpt: { type: DataTypes.TEXT, allowNull: false,comment: "excerpt for the survey" },
            description: { type: DataTypes.BLOB, allowNull: false, comment: "description for survey in HTML format" },
            descriptionText: { type: DataTypes.BLOB, allowNull: false, comment: "description for survey in plain text format" }
        },
        {
            paranoid: true,
            underscored: true,
            tableName: "communities_surveys_content",
            indexes:[
                {name:'ref-communities_surveys_content',fields:['survey_id']},
                {name: 'name', fields: ['title'],type: 'FULLTEXT'},
                {name: 'language', fields: ['language_id']},
            ]
        }
    );
    export default SurveyContent;

  
