interface CommunityInterface {
    id?: number;
    slug: string;
    userId: number;
    lastUpdatedBy: number;
    isRevision?: Boolean;
    revisionId?: number | null;
    status: number;
    communityLogo?: number;
    CommunityAttachments?: number[];
    CommunityContents?: CommunityContentInterface[];
}

interface CommunityContentInterface {
    id?: number;
    communityId?: number;
    languageId: number;
    name: string;
    description: string;
    descriptionText: string;
}

export { CommunityInterface, CommunityContentInterface }