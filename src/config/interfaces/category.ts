//Category interface is used by Category, CategotyType and Category Content model
interface CategoryInterface {
    id?: number;
    code: string;
    categorytypeId: number;
    parentId: number | null;
    userId: number | null;
    accountId: number | null;
    adminOnly?: Boolean;
    lastUpdatedBy: number | null;
    isRevision?: boolean;
    imageId: number | null;
    revisionId?: number | null;
    orderSequence?: string;
    level?: number;
    status?: number;
    parent?: {
        id: number,
        code: string,
        name: string
    }
    CategoryContents?: CategoryContentInterface[]
    CategoryType?: CategoryTypeInterface,
    name?:string;
    filePath?:string|null;
}


interface CategoryContentInterface {
    id?: number;
    categoryId?: number;
    languageId: number;
    name: string;

}

interface CategoryTypeInterface {
    id?: number;
    code: string;
    userId: number;
    lastUpdatedBy: number;
    isRevision?: Boolean;
    revisionId?: number;
    status: number;
    CategoryTypeContents?: CategoryTypeContentInterface[];
}

interface CategoryTypeContentInterface {
    id?: number;
    categorytypeId?: number;
    languageId: number;
    name: string;
    description: string;
    descriptionText: string;
}

interface CategoryAttributeInterface {
    id?: number;
    code: string;
    categoryId: number;
    type: number;
    isVariant: number;
    userId: number;
    accountId: number;
    lastUpdatedBy: number|null;
    orderSequence?: string;
    status?: number;
    CategoryAttributeContents?: CategoryAttributeContentInterface[]
}

interface CategoryAttributeContentInterface {
    id?: number;
    categoryAttributeId?: number;
    languageId: number;
    name: string;
    dataDump?: object;
}

interface CategoryAttributeOptionInterface {
    id?: number;
    categoryAttributeId?: number;
    code: string;
    CategoryAttributeOptionContents?: CategoryAttributeOptionContentInterface[]
}

interface CategoryAttributeOptionContentInterface {
    id?: number;
    categoryAttributeOptionId?: number;
    languageId: number;
    name: string;
    dataDump?: object;
}

export {
    CategoryInterface,
    CategoryContentInterface,
    CategoryTypeInterface,
    CategoryTypeContentInterface,
    CategoryAttributeInterface,
    CategoryAttributeContentInterface,
    CategoryAttributeOptionInterface,
    CategoryAttributeOptionContentInterface
}