interface ShopInterface {
    id?: number;
    code?: string;
    userId?: number;
    accountId?: number;
    contactName?: string;
    contactEmail?: string;
    contactCountryCode?: string;
    contactPhone?: string;
    shopUrl?: string;
    isVerified?: boolean;
    isfeatured?: number;
    lastUpdatedBy?: number;
    status?: number;
    bankAccountId?: number;
    documentId?: number;
    isRevision?: boolean
    revisionId?: number | null;
    settings?: any;
    slots?: any;
    attachments?: any;
    searchIndex?: string;
    meta?: any;
    social?: any;
    shopContents?: ShopContentInterface[];
}

interface ShopContentInterface {
    id?: number;
    shopId?: number;
    languageId?: number;
    name?: string;
    description?: string;
}

export { ShopInterface, ShopContentInterface }