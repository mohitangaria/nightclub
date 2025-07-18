"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { InvitedMemberInterface } from '../config/interfaces/invitations'
interface InvitationMemberInstance extends Model<InvitedMemberInterface>, InvitedMemberInterface { 
    
}
const InvitatedMember = sequelize.define<InvitationMemberInstance>(
    "InvitatedMember",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        invitationId: { type: DataTypes.INTEGER, allowNull: false, unique: 'news', comment: "Community in which news is posted" },
        email: { type: DataTypes.STRING, allowNull: false, comment: "Email of invited member"},
        status: { type: DataTypes.INTEGER, defaultValue: 1, comment: "Status of invitation. 0-> Inactive, 1-> Active,2->Accepted" }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "communities_invitied_members",
        indexes: [
            { name: 'invitationId', fields: ['invitation_id'] },
        ]
    }
);
export default InvitatedMember;