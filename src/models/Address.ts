"use strict";
import { sequelize } from '.';
import { Model, Optional,DataTypes } from 'sequelize';
import {AddressInterface} from '../config/interfaces/address';

interface AddressInstance extends Model<AddressInterface>,AddressInterface{}

const Address = sequelize.define<AddressInstance>(
    "Address",
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false, comment: "Unique identifier for the address record" },
        userId: { 
            type: DataTypes.INTEGER, allowNull: false, comment: "Reference ID for the associated user" 
        },
        accountId: { 
            type: DataTypes.INTEGER, allowNull: true, comment: "Optional reference ID for the associated account" 
        },
        shopId: { 
            type: DataTypes.INTEGER, allowNull: true, comment: "Optional reference ID for the associated shop" 
        },
        mapAddress: { 
            type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "Google Maps address representation" 
        },
        address: { 
            type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "Manually entered address" 
        },
        city: { 
            type: DataTypes.STRING, defaultValue: null, comment: "City of the address" 
        },
        state: { 
            type: DataTypes.STRING, defaultValue: null, comment: "State or region of the address" 
        },
        zipCode: { 
            type: DataTypes.STRING, defaultValue: null, comment: "Postal or ZIP code" 
        },
        country: { 
            type: DataTypes.STRING, defaultValue: null, comment: "Country of the address" 
        },
        landmark: { 
            type: DataTypes.STRING, defaultValue: null, comment: "Notable landmark near the address" 
        },
        latitude: { 
            type: DataTypes.DOUBLE, defaultValue: null, comment: "Latitude coordinate of the address location" 
        },
        longitude: { 
            type: DataTypes.DOUBLE, defaultValue: null, comment: "Longitude coordinate of the address location" 
        },
        geoLocation: {
            type: DataTypes.GEOMETRY, defaultValue: null, comment: "Longitude coordinate of the address location" 
        },
        addressLine1: { 
            type: DataTypes.STRING, defaultValue: null, comment: "First line of the address" 
        },
        addressLine2: { 
            type: DataTypes.STRING, defaultValue: null, comment: "Second line of the address (optional)" 
        },
        countryCode: { 
            type: DataTypes.STRING, defaultValue: null, comment: "International country code for the address" 
        },
        phone: { 
            type: DataTypes.STRING, defaultValue: null, comment: "Contact phone number associated with the address" 
        },
        name: { 
            type: DataTypes.STRING, defaultValue: null, comment: "Name of the person or entity associated with the address" 
        },
        entityType: { 
            type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "Specifies the type of entity associated with the address (e.g., buyer, seller, store)" 
        },
        addressType: {
            type: DataTypes.STRING, allowNull: true, defaultValue: null, comment: "Specifies whether the address is a pickup or return location" 
        },
        status: { 
            type: DataTypes.INTEGER, defaultValue: 1, comment: "Status flag indicating the address's availability (1 = active, 0 = inactive)" 
        }
    },
    {
        paranoid: true,
        underscored: true,
        tableName: "addresses",
        indexes:[]
    }
);
export default Address;