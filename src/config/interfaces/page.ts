interface PageInterface {
    id?: number;
    communityId: number;
    slug: string;
    userId: number;
    lastUpdatedBy: number;
    isRevision?: Boolean;
    revisionId?: number | null;
    status: number;
    pageFeaturedImage?:number;
    pageAttachments?:number[];
    PageContents?: PageContentInterface[];
}

interface PageContentInterface {
    id?: number;
    pageId?: number;
    languageId: number;
    title: string;
    excerpt:string;
    description: string;
    descriptionText: string;
}

export { PageInterface, PageContentInterface }