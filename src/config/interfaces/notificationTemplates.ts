interface Notification{
    id?: number;
    userId?: number;
    notificationTemplateId?: number;
    type?: string;
    title:string;
    content:string;
    replacements:any;
    compiledTitle?: string;
    compiledContent?: string;
    notificationObject?: any;
}

interface NotificationTemplate{
    id?: number;
    type?: string;
    replacements:string;
    userId:number;
    accountId:number | null;
    lastUpdatedById:number | null;
    isRevision:boolean | null;
    revisionId:number | null;
    status:number;
    content?: NotificationTemplateContent
    defaultContent?: NotificationTemplateContent
}

interface NotificationTemplateContent{
    id?: number;
    notificationTemplateId?: number;
    languageId:number;
    title:string;
    content:string;
}

export { NotificationTemplate, NotificationTemplateContent, Notification }