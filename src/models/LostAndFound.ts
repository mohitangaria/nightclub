"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { LostAndFoundInterface } from '../config/interfaces/lostAndFound'
import Bcrypt from "bcrypt";
import * as Constants from "../constants";

interface LostAndFoundInstance extends Model<LostAndFoundInterface>, LostAndFoundInterface { }
const LostAndFound = sequelize.define<LostAndFoundInstance>(
    "LostAndFound",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        type: { 
            type: DataTypes.INTEGER, 
            allowNull: false, 
            comment: "Lost | Found" 
        },
        itemName: {type: DataTypes.STRING, allowNull:false, comment:'Item Name'},
        lostOrFoundDate:{type:DataTypes.DATE, allowNull: false, comment:"Lost or found Date"},
        bookingId: {type: DataTypes.INTEGER, allowNull: true, comment:"Booking Id of the lost or found item"},
        eventId: {type: DataTypes.INTEGER, allowNull: false, comment:"Event Id of the lost or found item"},
        slot: {type:DataTypes.STRING, allowNull: true, comment:"Slot of the event"},
        attachmentId:{type: DataTypes.INTEGER, allowNull: false, comment:"Attachment Id of lost or found item"} ,
        ownerFound:{type: DataTypes.BOOLEAN, allowNull:false, defaultValue:false, comment:"Owner Found"},
        state: { type: DataTypes.INTEGER, defaultValue: Constants.USER_STATUS.ACTIVE, comment: "State of ticket INTIATED|FOUND OWNER|DELEIVERED TO OWNER|OWNER NOT FOUND" },
        itemBelongsTo: {type: DataTypes.INTEGER, defaultValue:null, allowNull: true, comment:"item belong to whom"},
        proofOfOwner:{type:DataTypes.STRING, defaultValue:null, allowNull:true, comment:"proof of owner"},
        comment:{type:DataTypes.TEXT,allowNull:true, defaultValue:null,comment:"Remark or comment if needed by admin"},
        reportedBy:{type:DataTypes.INTEGER, allowNull:false, comment:"Reported By whom"},
        itemDescription:{type:DataTypes.TEXT, allowNull:true, defaultValue:null, comment:"Descriptionn of the item"},
        status: { type: DataTypes.INTEGER, defaultValue: Constants.USER_STATUS.ACTIVE, comment: "Status of user. 0-> Inactive, 1-> Active, 2-> not verified" },
        contactCountryCode: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "" },
        contactNumber: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "" },
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "lost_and_founds",
        indexes: [
            { name: 'id', fields: ['id'] },
            { name: 'reported_by', fields: ['reported_by'] },
            {name: 'event_id', fields:['event_id']},
            {name: 'booking_id', fields:['booking_id']},
            {name: 'item_name', fields:['item_name']},


        ]
    }
);

export default LostAndFound;