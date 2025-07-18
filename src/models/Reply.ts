"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { ReplyInterface } from '../config/interfaces/reply'
interface ReplyInstance extends Model<ReplyInterface>, ReplyInterface { 
    setAttachments(arg0: number[], arg1: { transaction: import("sequelize").Transaction; }): unknown;
}

const Reply = sequelize.define<ReplyInstance>(
    "Reply",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        topicId: { type: DataTypes.INTEGER, allowNull: false, comment: "Topic for which response has been recorded" },
        inResponseTo: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "If reply is posted for a reply" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor of the record" },
        reply:{ type: DataTypes.TEXT, allowNull: false, comment: "Reply posted" },
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "If redord is revision?" },
        revisionId: { type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of reply. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "communities_topics_replies",
        indexes: [
            { name: 'id-revision', fields: ['id', 'is_revision'] },
            { name: 'topic', fields: ['topic_id','is_revision'] }
        ]
    }
);
export default Reply;