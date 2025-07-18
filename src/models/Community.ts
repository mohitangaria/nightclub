"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { CommunityInterface } from '../config/interfaces/community'
interface CommunityInstance extends Model<CommunityInterface>, CommunityInterface {
    setAttachments(arg0: number[], arg1: { transaction: import("sequelize").Transaction; }): unknown;
}

const Community = sequelize.define<CommunityInstance>(
    "Community",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        slug: { type: DataTypes.STRING, allowNull: false, unique: 'category-type-code', comment: "unique code for categoryType created, generated from title" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor of the record" },
        communityLogo: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Community logo" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Last user who has updated the record" },
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "If redord is revision?" },
        revisionId: { type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of CategoryType. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "communities",
        indexes: [
            { name: 'id-revision', fields: ['id', 'is_revision'] },
        ]
    }
);
export default Community;