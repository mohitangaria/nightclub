interface EmailTemplate {
    id?: number;
    code: string;
    replacements: string;
    userId: number;
    accountId: number | null;
    lastUpdatedById: number | null;
    isRevision: boolean | null;
    revisionId: number | null;
    status: number;
    EmailTemplateContents?: EmailTemplateContent[]
}

interface EmailTemplateContent {
    id?: number;
    EmailTemplateId?: number;
    languageId: number;
    title: Text;
    message: Text;
    messageText: Text;
    subject: Text;
}

interface Email {
    id?: number;
    from: string;
    to: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    type: string
}
export { EmailTemplate, EmailTemplateContent, Email }