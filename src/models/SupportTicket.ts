import { sequelize } from '.';
import { Model, DataTypes } from 'sequelize';
import { SupportTicketInterface } from '../config/interfaces/support';

interface SupportTicketInstance extends Model<SupportTicketInterface>, SupportTicketInterface {}

const SupportTicket = sequelize.define<SupportTicketInstance>(
  "SupportTicket",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "User ID who raised the ticket" },
    accountId: { type: DataTypes.INTEGER, allowNull: true, defaultValue: null, comment: "Account ID (optional if needed)" },
    subject: { type: DataTypes.STRING, allowNull: false, comment: "Ticket subject" },
    message: { type: DataTypes.TEXT, allowNull: false, comment: "User's message" },
    status: { 
      type: DataTypes.INTEGER, 
      defaultValue: 0, 
      comment: "Ticket status: 0->Open, 1->In Progress, 2->Closed" 
    }
  },
  {
    paranoid: true,
    underscored: true,
    tableName: "support_tickets",
    indexes: []
  }
);

export default SupportTicket;


  