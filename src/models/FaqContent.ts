"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { FaqContentInterface } from '../config/interfaces/faqs';

interface FaqContentInstance extends Model<FaqContentInterface>, FaqContentInterface {};

const FaqContent = sequelize.define<FaqContentInstance>(
    "FaqContent",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        faqId:{ type: DataTypes.INTEGER, allowNull: false,unique:'unique-faq',comment: "Ref to faq table"},
        languageId: { type: DataTypes.INTEGER, allowNull: false,unique:'unique-faq', comment: "language for which content has been created"},
        question: { type: DataTypes.TEXT, allowNull: false,comment: "Question" },
        questionText: { type: DataTypes.TEXT, allowNull: false,comment: "Question" },
        answer: { type: DataTypes.TEXT, allowNull: false,comment: "Answer to the question" },
        answerText: { type: DataTypes.TEXT, allowNull: false,comment: "Answer to the question" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "faqs_content",
        indexes: [
            { name: 'id', fields: ['id'] }
        ]
    }
);

export default FaqContent;