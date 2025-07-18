"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { PollInterface, PollContentInterface } from '../config/interfaces/poll'
interface PollInstance extends Model<PollInterface>, PollInterface { 
    setAttachments(arg0: number[], arg1: { transaction: import("sequelize").Transaction; }): unknown;
}

const Poll = sequelize.define<PollInstance>(
    "Poll",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        slug: { type: DataTypes.STRING, allowNull: false, unique: 'poll', comment: "unique code for categoryType created, generated from title" },
        communityId: { type: DataTypes.INTEGER, allowNull: false, unique: 'poll', comment: "Community in which poll is posted" },
        pollFeaturedImage: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Poll fetaured image" },
        pollUrl: { type: DataTypes.TEXT, allowNull: false, comment: "Poll url" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor of the record" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Last user who has updated the record" },
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "If redord is revision?" },
        revisionId: { type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of CategoryType. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "communities_polls",
        indexes: [
            { name: 'id-revision', fields: ['id', 'is_revision'] },
        ]
    }
);
export default Poll;