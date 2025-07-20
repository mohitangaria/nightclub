// Email list interface for email list model
interface EmailListInterface {
    id?: number;
    userId: number;
    accountId: number | null;
    lastUpdatedBy: number | null;
    slug: string;
    title: string;
    keys?: Text | null;
    description: Text;
    descriptionText: Text;
    status: number;
    totalRecords?: number;
    totalSubscribed?:number;
    totalUnsubscribed?:number;

}

interface EmailRecordInterface {
    id?: number;
    emailListId: number;
    userId: number;
    accountId: number | null;
    lastUpdatedBy: number | null;
    email: string;
    firstName: string;
    lastName: string;
    metadata: JSON;
    status?: number;
    isSubscribed?: boolean;
    isBounced?: boolean;
    isBlocked?: boolean;
    lastEmailSentAt?: Date;
}

export { EmailListInterface, EmailRecordInterface }