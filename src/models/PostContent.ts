"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { PostContentInterface } from '../config/interfaces/posts';

interface PostContentInstance extends Model<PostContentInterface>, PostContentInterface {}

const PostContent = sequelize.define<PostContentInstance>(
    "PostContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        postId:{ type: DataTypes.INTEGER, allowNull: false,comment: "Ref to post table"},
        languageId: { type: DataTypes.INTEGER, allowNull: false,comment: "Language for which content has been created"},
        title: { type: DataTypes.TEXT, allowNull: false,comment: "Title of the post" },
        titleText: { type: DataTypes.TEXT, allowNull: false,comment: "Title of the post in text format" },
        description: { type: DataTypes.TEXT, allowNull: false,comment: "Description of the post" },
        descriptionText: { type: DataTypes.TEXT, allowNull: false,comment: "Descriotion of the post in text format" },
        excerpt: { type: DataTypes.TEXT, allowNull: true, defaultValue: null, comment: "Excerpt of the post" },
        excerptText: { type: DataTypes.TEXT, allowNull: false,comment: "Excerpt of the post in text format"}
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "posts_content",
        indexes: [
            {name:'ref-post-content',fields:['post_id']},
            {name: 'postdata', fields: ['title_text','description_text','excerpt_text'],type: 'FULLTEXT'},
        ]
    }
);

export default PostContent;