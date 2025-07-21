export interface SupportTicketInterface {
    id?: number;
    userId?: number;
    accountId?: number;
    subject?: string;
    message?: string;
    status?: number,
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
}

export interface SupportMessageInterface {
   id?: number;
   supportTicketId?: number;
   senderType?: number;
   message: string;
   createdAt?: Date;
   updatedAt?: Date;
}
  
  