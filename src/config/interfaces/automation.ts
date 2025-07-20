import { Json } from "sequelize/types/utils";

interface AutomationInterface {
    id?: number;
    userId: number;
    accountId: number | null;
    lastUpdatedBy: number;
    title: string;
    slug: string;
    description: Text;
    descriptionText: Text;
    status: number;
    totalSent?: number;
    delivered?: number;
    openCount?:number|null;
    clickCount?:number|null;
    AutomationSchedules?: AutomationScheduleInterface[];
    AutomationEmailLists?: AutomationEmailListInterface[]
}

interface AutomationScheduleInterface {
    id?: number;
    userId: number;
    accountId: number | null;
    lastUpdatedBy: number;
    automationId: number;
    intervalType: number;
    calculateFrom: number;
    fromName: string;
    fromEmail: string;
    totalSent?: number;
    delivered?: number;
    openCount?:number|null;
    clickCount?:number|null;
    status: number;
    AutomationScheduleIntervals?: AutomationScheduleIntervalInterface[]
}

interface AutomationScheduleIntervalInterface {
    id?: number;
    automationScheduleId: number;
    interval: number;
    emailTemplateId: number;
    parentInterval?:number|null;
    condition?:number|null;
}

interface AutomationEmailListInterface {
    id?: number;
    automationId: number;
    emailListId: number;
}

interface AutomationScheduleEmailRecordInterface {
    id?: number;
    automationId: number;
    automationScheduleId: number;
    emailListId: number;
    emailListRecordId: number;
}

interface AutomationLogInterface {
    id?: number;
    automationId: number;
    automationScheduleId: number;
    automationScheduleIntervalId: number;
    emailListId:number;
    emailListRecordId: number;
    messageId?:string|null;
    deliveryStatus?:number|null;
    complaintStatus?:number|null;
    openCount?:number|null;
    clickCount?:number|null;
    message?:Json|null
}

export {
    AutomationInterface,
    AutomationScheduleInterface,
    AutomationEmailListInterface,
    AutomationScheduleIntervalInterface,
    AutomationScheduleEmailRecordInterface,
    AutomationLogInterface
}