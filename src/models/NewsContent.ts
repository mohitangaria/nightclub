"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {NewsContentInterface} from '../config/interfaces/news'

interface NewsContentInstance extends Model<NewsContentInterface >,NewsContentInterface {}
const NewsContent = sequelize.define<NewsContentInstance>(
        "NewsContent",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            newsId:{ type: DataTypes.INTEGER, allowNull: false,unique:'news-content',comment: "Ref to category content table"},
            languageId: { type: DataTypes.INTEGER, allowNull: false,unique:'news-content', comment: "language for which content has been created"},
            title: { type: DataTypes.TEXT, allowNull: false,comment: "title of the news" },
            excerpt: { type: DataTypes.TEXT, allowNull: false,comment: "excerpt for the news" },
            description: { type: DataTypes.BLOB, allowNull: false, comment: "description for news in HTML format" },
            descriptionText: { type: DataTypes.BLOB, allowNull: false, comment: "description for news in plain text format" }
        },
        {
            paranoid: true,
            underscored: true,
            tableName: "communities_news_content",
            indexes:[
                {name:'ref-communities_news_content',fields:['news_id']},
                {name: 'name', fields: ['title'],type: 'FULLTEXT'},
                {name: 'language', fields: ['language_id']},
            ]
        }
    );
    export default NewsContent;

  
