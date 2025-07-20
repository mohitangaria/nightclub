interface ProductContentInterface{
    id?: number;
    productId?: number;
    languageId: number
    originalName: string;
    name?: string;
    description: string;
    descriptionText: string;
    keywords?: string;
}

interface ProductInterface{
    id?: number;
    storeId: number;
    categoryId: number;
    brandId?: number|null;
    parentProductId?: number;
    code: string;
    attachmentId: number;
    basePrice: number;
    sku: string;

    rentalDurationType?: number;
    rentalDuration?: number;
    rentalPrice?: number;
    securityDeposit?: number;
    prepDays?: number;
    preLovedPrice?: number;
    productType?: number;

    dimmensions?: number;
    weight?: number;
    weightUnit?: number;

    userId: number;
    accountId: number;
    approvalStatus?: number;
    rent?: number;
    buy?: number;
    preloved?: number;
    status?: number;
    lastUpdatedBy: number|null;
    reason?: string|null;
    ProductContents?: ProductContentInterface[]
}

interface ProductAttributeInterface{
    id?: number;
    productId: number;
    attributeId: number;
    code: string;
    ProductAttributeContents?: ProductAttributeContentInterface[]
}

interface ProductKeywordInterface{
    id?: number;
    productId: number;
    code: string;
    ProductKeywordContents?: ProductKeywordContentInterface[]
}

interface ProductKeywordContentInterface{
    id?: number;
    productKeywordId?: number;
    languageId: number;
    value: string;
}

interface ProductAttributeContentInterface{
    id?: number;
    productAttributeId?: number;
    languageId: number;
    value: string;
}

interface ProductGalleryInterface{
    id?: number;
    productId: number;
    attachmentId: number;
}



export { 
    ProductInterface,
    ProductContentInterface,
    ProductAttributeInterface,
    ProductAttributeContentInterface,
    ProductGalleryInterface,
    ProductKeywordInterface,
    ProductKeywordContentInterface
}