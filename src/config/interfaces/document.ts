interface DocumentInterface {
    id?: number;
    userId?: number;
    documentType?: string;
    lastUpdatedBy?: number | null;
    accountId?: number | null;
    isRevision?: boolean;
    revisionId?: number | null;
    status?: number;
    content?: DocumentContentInterface;
    defaultContent?: DocumentContentInterface;
}

interface DocumentContentInterface {
    id?: number;
    documentId?: number;
    languageId?: number;
    title?: string;
    titleText?: string;
    description?: string | null;
    descriptionText?: string | null;
    excerpt?: string | null;
    excerptText?: string | null;
}

interface AgreementInterface {
    comissionRate: number;
    creditCardProcessingFee: number;
    orderExecutionTime: string;
    shippingPenality48to96h: number;
    shippingPenality96hAbove: number;
    compensation: number;
    payoutDuration: number;
    terminationDuration: number;
    businessName: string;
    companyAddress: string;
    phone: string;
    taxIdNumber: string;
    contactName: string;
    contactEmail: string;
    contactDirectDial: string;
}

interface UserDocumentInterface {
    id?: number;
    userId?: number;
    documentId?: number;
    agreement?: AgreementInterface | null;
    attachmentId?: number | null;
    signAttachmentId?: number | null;
    isSigned?: boolean;
    linkedHtml?: string | null;
    lastUpdatedBy?: number | null;
    accountId?: number | null;
    isRevision?: boolean;
    revisionId?: number | null;
    status?: number;
    docCreatedDate?: string | null;
    docSignedDate?: string | null;
}

export { DocumentInterface, DocumentContentInterface, UserDocumentInterface, AgreementInterface }