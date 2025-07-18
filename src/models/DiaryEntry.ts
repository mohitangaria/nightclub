"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { DiaryEntryInterface } from '../config/interfaces/diary'
interface DiaryEntryInstance extends Model<DiaryEntryInterface>, DiaryEntryInterface { 
    setAttachments(arg0: number[], arg1: { transaction: import("sequelize").Transaction; }): unknown;
}

const DiaryEntry = sequelize.define<DiaryEntryInstance>(
    "DiaryEntry",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        diaryId: { type: DataTypes.INTEGER, allowNull: false, comment: "Community in which topic is posted" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor of the record" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Last user who has updated the record" },
        entry: { type: DataTypes.TEXT, allowNull: false, comment: "Entry of the diary" },
        entryFeaturedImage: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Community logo" },
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of CategoryType. 0-> Inactive, 1-> Active" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "communities_diary_entries",
        indexes: [
            { name: 'diary_entry', fields: ['diary_id'] },
        ]
    }
);
export default DiaryEntry;