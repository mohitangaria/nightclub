interface NewsInterface {
    id?: number;
    communityId: number;
    slug: string;
    userId: number;
    lastUpdatedBy: number;
    isRevision?: Boolean;
    revisionId?: number | null;
    status: number;
    newsFeaturedImage?:number;
    newsAttachments?:number[];
    NewsContents?: NewsContentInterface[];
}

interface NewsContentInterface {
    id?: number;
    newsId?: number;
    languageId: number;
    title: string;
    excerpt:string;
    description: string;
    descriptionText: string;
}

export { NewsInterface, NewsContentInterface }