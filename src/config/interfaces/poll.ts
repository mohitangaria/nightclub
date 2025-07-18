interface PollInterface {
    id?: number;
    communityId: number;
    slug: string;
    userId: number;
    lastUpdatedBy: number;
    isRevision?: Boolean;
    revisionId?: number | null;
    status: number;
    pollFeaturedImage?:number;
    pollUrl:string;
    pollAttachments?:number[];
    PollContents?: PollContentInterface[];
}

interface PollContentInterface {
    id?: number;
    pollId?: number;
    languageId: number;
    title: string;
    description: string;
    descriptionText: string;
}

export { PollInterface, PollContentInterface }