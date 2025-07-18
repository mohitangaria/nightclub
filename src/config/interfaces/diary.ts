interface DiaryInterface {
    id?: number;
    communityId: number;
    slug: string;
    userId: number;
    lastUpdatedBy: number;
    isRevision?: Boolean;
    revisionId?: number | null;
    status: number;
    diaryFeaturedImage?:number | null;
    diaryAttachments?:number[];
    DiaryContents?: DiaryContentInterface[];
}

interface DiaryContentInterface {
    id?: number;
    diaryId?: number;
    languageId: number;
    title: string;
    excerpt:string;
    description: string;
    descriptionText: string;
}

interface DiaryEntryInterface {
    id?: number;
    diaryId: number;
    userId: number;
    lastUpdatedBy: number;
    entry: string;
    entryFeaturedImage?:number | null;
    entryAttachments?:number[];
    status: number;
}

export { DiaryInterface,DiaryEntryInterface, DiaryContentInterface }