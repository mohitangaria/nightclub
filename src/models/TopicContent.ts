"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {TopicContentInterface} from '../config/interfaces/topic'

interface TopicContentInstance extends Model<TopicContentInterface >,TopicContentInterface {}
const TopicContent = sequelize.define<TopicContentInstance>(
        "TopicContent",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            topicId:{ type: DataTypes.INTEGER, allowNull: false,unique:'category-type-name',comment: "Ref to category content table"},
            languageId: { type: DataTypes.INTEGER, allowNull: false,unique:'category-type-name', comment: "language for which content has been created"},
            title: { type: DataTypes.TEXT, allowNull: false,comment: "Name of the categorytype" },
            excerpt: { type: DataTypes.TEXT, allowNull: false,comment: "excerpt for the topic" },
            description: { type: DataTypes.BLOB, allowNull: false, comment: "description for category type in HTML format" },
            descriptionText: { type: DataTypes.BLOB, allowNull: false, comment: "description for category type in plain text format" }
        },
        {
            paranoid: true,
            underscored: true,
            tableName: "communities_topics_content",
            indexes:[
                {name:'ref-communities_topics_content',fields:['topic_id']},
                {name: 'name', fields: ['title'],type: 'FULLTEXT'},
                {name: 'language', fields: ['language_id']},
            ]
        }
    );
    export default TopicContent;

  
