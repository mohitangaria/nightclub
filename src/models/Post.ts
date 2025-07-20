"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { PostInterface } from '../config/interfaces/posts';


interface PostInstance extends Model<PostInterface>, PostInterface {}

const Post = sequelize.define<PostInstance>(
    "Post",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        slug: { type: DataTypes.STRING, allowNull: false, unique:'post',comment: "unique slig for the post created, generated from title"},
        postType:{ type: DataTypes.STRING, allowNull: false,comment: "Post type page or post"},
        categoryId:{ type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Category of the post"},
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Aurthor of role, null means system default"},
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Last user who has updated the record"},
        accountId:{ type: DataTypes.INTEGER, allowNull: true, defaultValue:null,comment: "Account for which role has been created"},
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false,defaultValue:false,comment: "Revision of updates"},
        revisionId:{ type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        status: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Status of role. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "posts",
        indexes: [
            { name: 'id', fields: ['id'] },
            { name: 'slug', fields: ['slug'] },
        ]
    }
);

export default Post;