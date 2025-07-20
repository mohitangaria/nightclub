interface AttributeInterface {
    id?: number;
    code: string;
    type: number;
    isVariant: number;
    userId: number;
    accountId: number;
    lastUpdatedBy: number|null;
    orderSequence?: string;
    status?: number;
    AttributeContents?: AttributeContentInterface[]
}

interface AttributeContentInterface {
    id?: number;
    attributeId?: number;
    languageId: number;
    name: string;
    dataDump?: object;
}

interface AttributeOptionInterface {
    id?: number;
    attributeId?: number;
    code: string;
    AttributeOptionContents?: AttributeOptionContentInterface[]
}

interface AttributeOptionContentInterface {
    id?: number;
    attributeOptionId?: number;
    languageId: number;
    name: string;
    dataDump?: object;
}

export {
    AttributeInterface,
    AttributeContentInterface,
    AttributeOptionInterface,
    AttributeOptionContentInterface
}