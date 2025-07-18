"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {PageContentInterface} from '../config/interfaces/page'

interface PageContentInstance extends Model<PageContentInterface >,PageContentInterface {}
const PageContent = sequelize.define<PageContentInstance>(
        "PageContent",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            pageId:{ type: DataTypes.INTEGER, allowNull: false,unique:'page-content',comment: "Ref to category content table"},
            languageId: { type: DataTypes.INTEGER, allowNull: false,unique:'page-content', comment: "language for which content has been created"},
            title: { type: DataTypes.TEXT, allowNull: false,comment: "title of the page" },
            excerpt: { type: DataTypes.TEXT, allowNull: false,comment: "excerpt for the page" },
            description: { type: DataTypes.BLOB, allowNull: false, comment: "description for page in HTML format" },
            descriptionText: { type: DataTypes.BLOB, allowNull: false, comment: "description for page in plain text format" }
        },
        {
            paranoid: true,
            underscored: true,
            tableName: "communities_pages_content",
            indexes:[
                {name:'ref-communities_pages_content',fields:['page_id']},
                {name: 'name', fields: ['title'],type: 'FULLTEXT'},
                {name: 'language', fields: ['language_id']},
            ]
        }
    );
    export default PageContent;

  
