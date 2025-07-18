"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {PollContentInterface} from '../config/interfaces/poll'

interface PollContentInstance extends Model<PollContentInterface >,PollContentInterface {}
const PollContent = sequelize.define<PollContentInstance>(
        "PollContent",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            pollId:{ type: DataTypes.INTEGER, allowNull: false,unique:'category-type-name',comment: "Ref to category content table"},
            languageId: { type: DataTypes.INTEGER, allowNull: false,unique:'category-type-name', comment: "language for which content has been created"},
            title: { type: DataTypes.TEXT, allowNull: false,comment: "Name of the categorytype" },
            description: { type: DataTypes.BLOB, allowNull: false, comment: "description for category type in HTML format" },
            descriptionText: { type: DataTypes.BLOB, allowNull: false, comment: "description for category type in plain text format" }
        },
        {
            paranoid: true,
            underscored: true,
            tableName: "communities_polls_content",
            indexes:[
                {name:'ref-communities_polls_content',fields:['poll_id']},
                {name: 'name', fields: ['title'],type: 'FULLTEXT'},
                {name: 'language', fields: ['language_id']},
            ]
        }
    );
    export default PollContent;

  
