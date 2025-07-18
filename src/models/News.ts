"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { NewsInterface, NewsContentInterface } from '../config/interfaces/news'
interface NewsInstance extends Model<NewsInterface>, NewsInterface { 
    setAttachments(arg0: number[], arg1: { transaction: import("sequelize").Transaction; }): unknown;
}

const News = sequelize.define<NewsInstance>(
    "News",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        slug: { type: DataTypes.STRING, allowNull: false, unique: 'news', comment: "unique code for news created, generated from title" },
        communityId: { type: DataTypes.INTEGER, allowNull: false, unique: 'news', comment: "Community in which news is posted" },
        newsFeaturedImage: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "News featured image" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor of the record" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Last user who has updated the record" },
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "If redord is revision?" },
        revisionId: { type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of news. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "communities_news",
        indexes: [
            { name: 'id-revision', fields: ['id', 'is_revision'] },
        ]
    }
);
export default News;