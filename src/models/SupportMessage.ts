import { sequelize } from '.';
import { Model, DataTypes } from 'sequelize';
import { SupportMessageInterface } from '../config/interfaces/support';

interface SupportMessageInstance extends Model<SupportMessageInterface>, SupportMessageInterface {}

const SupportMessage = sequelize.define<SupportMessageInstance>(
  "Support",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
    supportTicketId: { type: DataTypes.INTEGER, allowNull: false, comment: "Ticket ID" },
    senderType: { type: DataTypes.INTEGER, allowNull: false, comment: "Sender user type" },
    message: { type: DataTypes.TEXT, allowNull: false, comment: "Ticket message" },
  },
  {
    paranoid: true,
    underscored: true,
    tableName: "support_messages",
    indexes: []
  }
);

export default SupportMessage;


  