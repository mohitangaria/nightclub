"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { CommunityContentInterface } from '../config/interfaces/community'

interface CommunityContentInstance extends Model<CommunityContentInterface>, CommunityContentInterface { }
const CommunityContent = sequelize.define<CommunityContentInstance>(
    "CommunityContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        communityId: { type: DataTypes.INTEGER, allowNull: false, unique: 'community-name', comment: "Ref to community table" },
        languageId: { type: DataTypes.INTEGER, allowNull: false, unique: 'community-name', comment: "language for which content has been created" },
        name: { type: DataTypes.TEXT, allowNull: false, comment: "Name of the community" },
        description: { type: DataTypes.BLOB, allowNull: false, comment: "description for community in HTML format" },
        descriptionText: { type: DataTypes.BLOB, allowNull: false, comment: "description for community in plain text format" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "communities_content",
        indexes: [
            { name: 'ref-community-content', fields: ['community_id'] },
            { name: 'name', fields: ['name'], type: 'FULLTEXT' },
            { name: 'language', fields: ['language_id'] },
        ]
    }
);
export default CommunityContent;


