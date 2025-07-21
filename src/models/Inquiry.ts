"use strict";
import { sequelize } from '.';
import { Model, Optional, DataTypes } from 'sequelize';
import { InquiryInterface } from '../config/interfaces/inquiry'
import Bcrypt from "bcrypt";
import * as Constants from "../constants";

interface InquiryInstance extends Model<InquiryInterface>, InquiryInterface { }
const Inquiry = sequelize.define<InquiryInstance>(
    "Inquiry",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {type: DataTypes.STRING, allowNull:false, comment:'Item Name'},
        date:{type:DataTypes.DATE, allowNull: false, comment:"Lost or found Date"},
        bookingId: {type: DataTypes.INTEGER, allowNull: true, defaultValue: true, comment:"Booking Id of the lost or found item"},
        eventId: {type: DataTypes.INTEGER, allowNull: true, defaultValue:true, comment:"Event Id of the lost or found item"},
        slot: {type:DataTypes.STRING, allowNull: true, comment:"Slot of the event"},
        partySize:{type:DataTypes.STRING, defaultValue:null, allowNull:true, comment:"party size"},
        inquiredBy:{type:DataTypes.INTEGER, allowNull:false, comment:"Reported By whom"},
        message:{type:DataTypes.TEXT, allowNull:true, defaultValue:null, comment:"Descriptionn of the item"},
        status: { type: DataTypes.INTEGER, defaultValue: Constants.USER_STATUS.ACTIVE, comment: "Status of user. 0-> Inactive, 1-> Active, 2-> not verified" },
        contactCountryCode: { type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "country code" },
        contactNumber: { type: DataTypes.STRING, allowNull: false, comment: "mobile number" },
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "inquires",
        indexes: [
            { name: 'id', fields: ['id'] },
            { name: 'inquired_by', fields: ['inquired_by'] },
            {name: 'event_id', fields:['event_id']},
            {name: 'booking_id', fields:['booking_id']},
            {name: 'name', fields:['name']},
            {name: 'contact_number', fields:['contact_number']},


        ]
    }
);

export default Inquiry;