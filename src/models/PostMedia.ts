"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { PostMediaInterface } from '../config/interfaces/posts';

interface PostMediaInstance extends Model<PostMediaInterface>, PostMediaInterface {}

const PostMedia = sequelize.define<PostMediaInstance>(
    "PostMedia",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        postId:{ type: DataTypes.INTEGER, allowNull: false,comment: "Ref to post table"},
        languageId: { type: DataTypes.INTEGER, allowNull: false,comment: "Language for which media has been created"},
        type: { type: DataTypes.STRING, allowNull: false,comment: "Media type (image,video)" },
        fileId:{type:DataTypes.INTEGER,allowNull: false,comment: "Attachment identifier" },
        isFeatured:{type:DataTypes.BOOLEAN,allowNull: false,defaultValue:false,comment: "Attachment identifier" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "posts_media",
        indexes: [
            {name:'ref-post-media',fields:['post_id']}
        ]
    }
);

export default PostMedia;