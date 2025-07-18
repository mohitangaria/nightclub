"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {DiaryContentInterface} from '../config/interfaces/diary'

interface DiaryContentInstance extends Model<DiaryContentInterface >,DiaryContentInterface {}
const DiaryContent = sequelize.define<DiaryContentInstance>(
        "DiaryContent",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            diaryId:{ type: DataTypes.INTEGER, allowNull: false,unique:'diary-name',comment: "Ref to diary content table"},
            languageId: { type: DataTypes.INTEGER, allowNull: false,unique:'diary-name', comment: "language for which content has been created"},
            title: { type: DataTypes.TEXT, allowNull: false,comment: "Title of the diary" },
            excerpt: { type: DataTypes.TEXT, allowNull: false,comment: "excerpt for the diary" },
            description: { type: DataTypes.BLOB, allowNull: false, comment: "description for diary in HTML format" },
            descriptionText: { type: DataTypes.BLOB, allowNull: false, comment: "description for diary in plain text format" }
        },
        {
            paranoid: true,
            underscored: true,
            tableName: "communities_diaries_content",
            indexes:[
                {name:'ref-communities_diaries_content',fields:['diary_id']},
                {name: 'name', fields: ['title'],type: 'FULLTEXT'},
                {name: 'language', fields: ['language_id']},
            ]
        }
    );
    export default DiaryContent;

  
