interface TopicInterface {
    id?: number;
    communityId: number;
    slug: string;
    userId: number;
    lastUpdatedBy: number;
    isRevision?: Boolean;
    revisionId?: number | null;
    status: number;
    topicFeaturedImage?:number;
    topicAttachments?:number[];
    TopicContents?: TopicContentInterface[];
}

interface TopicContentInterface {
    id?: number;
    topicId?: number;
    languageId: number;
    title: string;
    excerpt:string;
    description: string;
    descriptionText: string;
}

export { TopicInterface, TopicContentInterface }