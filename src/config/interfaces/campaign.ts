import { Json } from "sequelize/types/utils";
interface CampaignInterface {
    id?: number;
    userId: number;
    accountId: number | null;
    lastUpdatedBy: number;
    title: string;
    slug: string;
    description: Text;
    descriptionText: Text;
    totalSent?: number;
    delivered?: number;
    status: number;
    CampaignSchedules?: CampaignScheduleInterface[]
}

interface CampaignScheduleInterface {
    id?: number;
    userId: number;
    accountId: number | null;
    lastUpdatedBy: number;
    campaignId: number;
    emailTemplateId: number;
    condition?:number|null;
    sendAt: Date;
    sentOn?: Date | null;
    fromEmail: string;
    totalSent?: number;
    delivered?: number;
    status: number;
    CampaignScheduleEmailLists?: CampaignScheduleEmailListInterface[]
}
interface CampaignScheduleEmailListInterface {
    id?: number;
    campaignId: number;
    campaignScheduleId?: number;
    emailListId: number;
    totalSent?: number;
    delivered?: number;
}

interface CampaignScheduleEmailListRecordInterface {
    id?: number;
    campaignId: number;
    campaignScheduleId: number;
    emailListId: number;
    emailListRecordId: number;
    status: number;
    messageId?: string;
    hasOpened?: boolean;
    hasClicked?: boolean;
    hasBounced?: boolean;
}

interface CampaignLogInterface {
    id?: number;
    campaignId: number;
    campaignScheduleId: number;
    emailListId:number;
    emailListRecordId: number;
    messageId?:string|null;
    deliveryStatus?:number|null;
    complaintStatus?:number|null;
    openStatus?:number|null;
    clickStatus?:number|null;
    message?:Json|null
}

export { CampaignInterface, CampaignScheduleInterface, CampaignScheduleEmailListInterface, CampaignScheduleEmailListRecordInterface,CampaignLogInterface }