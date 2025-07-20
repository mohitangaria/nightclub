interface FaqInterface {
    id?: number;
    accountId?: number;
    userId?: number;
    lastUpdatedBy?: number | null;
    isRevision?: boolean;
    revisionId?: number | null;
    sortOrder?: number;
    status?: number,
    categoryId?: number;
    searchIndex?: string;
    FaqContents?: FaqContentInterface[]
}

interface FaqContentInterface {
    id?: number;
    faqId?: number;
    languageId?: number;
    question?: string;
    questionText?: string;
    answer?: string;
    answerText?: string;
}

export { FaqInterface, FaqContentInterface }