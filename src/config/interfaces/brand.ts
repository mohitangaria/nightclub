interface BrandContentInterface{
    id?: number;
    brandId?: number;
    name: string;
    languageId: number
}

interface BrandInterface{
    id?: number;
    code: string;
    userId: number;
    attachmentId: number;
    accountId: number;
    lastUpdatedBy: number|null;
    status?: number;
    BrandContents?: BrandContentInterface[]
}

export { 
    BrandInterface,
    BrandContentInterface
}