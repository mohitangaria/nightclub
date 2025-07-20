interface PostInterface {
    id?: number;
    slug?: string;
    postType?: string;
    categoryId?: number;
    userId?: number;
    lastUpdatedBy?: number | null;
    accountId?: number | null;
    isRevision?: boolean;
    revisionId?: number | null;
    status?: number;
    PostContents?: PostContentInterface[] | null;
    PostMedia?: PostMediaInterface[] | null;
}

interface PostContentInterface {
    id?: number;
    postId?: number;
    languageId?: number;
    title?: string;
    titleText?: string;
    description?: string | null;
    descriptionText?: string | null;
    excerpt?: string | null;
    excerptText?: string | null;
}

interface PostMediaInterface {
    id?: number;
    postId?: number;
    languageId?: number;
    type?: string;
    fileId?: number;
    isFeatured?: boolean;
}



export { PostInterface, PostContentInterface, PostMediaInterface }