"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { InvitationInterface } from '../config/interfaces/invitations'
interface InvitationInstance extends Model<InvitationInterface>, InvitationInterface { 
    
}

const Invitation = sequelize.define<InvitationInstance>(
    "Invitation",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        communityId: { type: DataTypes.INTEGER, allowNull: false, unique: 'news', comment: "Community in which news is posted" },
        userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Aurthor of the record" },
        lastUpdatedBy: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Last user who has updated the record" },
        subject: { type: DataTypes.STRING, allowNull: false, comment: "Subject for the invitation sent to the user" },
        description: { type: DataTypes.TEXT, defaultValue: null, comment: "ref to entity, If its a revision" },
        descriptionText: { type: DataTypes.TEXT, defaultValue: null, comment: "ref to entity, If its a revision" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "communities_invitiations",
        indexes: [
            { name: 'community-id', fields: ['community_id'] },
        ]
    }
);
export default Invitation;