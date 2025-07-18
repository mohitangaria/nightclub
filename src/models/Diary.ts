"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { DiaryInterface } from '../config/interfaces/diary'
interface DiaryInstance extends Model<DiaryInterface>, DiaryInterface { 
    setAttachments(arg0: number[], arg1: { transaction: import("sequelize").Transaction; }): unknown;
}

const Diary = sequelize.define<DiaryInstance>(
    "Diary",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        slug: { type: DataTypes.STRING, allowNull: false, unique: 'topic', comment: "unique code for categoryType created, generated from title" },
        communityId: { type: DataTypes.INTEGER, allowNull: false, unique: 'topic', comment: "Community in which topic is posted" },
        diaryFeaturedImage: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Community logo" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor of the record" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Last user who has updated the record" },
        isRevision: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, comment: "If redord is revision?" },
        revisionId: { type: DataTypes.INTEGER, defaultValue: null, comment: "ref to entity, If its a revision" },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of CategoryType. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "communities_diaries",
        indexes: [
            { name: 'id-revision', fields: ['id', 'is_revision'] },
        ]
    }
);
export default Diary;