interface EmailTemplate{
    id?: number;
    code: string;
    replacements:string;
    userId:number;
    accountId:number | null;
    lastUpdatedById:number | null;
    isRevision:boolean | null;
    revisionId:number | null;
    status:number;
    message?: string;
    subject?: string;
    EmailTemplateContents?:EmailTemplateContent[];
    emailContent?:EmailTemplateContent
}

interface EmailTemplateContent{
    id?: number;
    EmailTemplateId?: number;
    languageId:number;
    title:Text;
    message:Text;
    messageText:Text;
    subject:Text;
}

interface SystemEmail{
    id?: number;
    from:string;
    to:string;
    subject:string;
    htmlContent:string;
    textContent:string ;
    type:string
 
}

interface Email{
    id: number;
    userId: number;
    accountId:number;
    isRevision:boolean;
    revisionId:number;
    EmailTemplateId:number;
    status:number;
}

export { EmailTemplate, EmailTemplateContent, SystemEmail, Email }
// export { EmailTemplate, EmailTemplateContent,Email }