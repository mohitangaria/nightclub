interface SurveyInterface {
    id?: number;
    communityId: number;
    slug: string;
    surveyType:number;
    userId: number;
    lastUpdatedBy: number;
    isRevision?: Boolean;
    revisionId?: number | null;
    status: number;
    surveyFeaturedImage?:number;
    surveyUrl:string;
    surveyAttachments?:number[];
    SurveyContents?: SurveyContentInterface[];
}

interface SurveyContentInterface {
    id?: number;
    surveyId?: number;
    languageId: number;
    title: string;
    excerpt:string;
    description: string;
    descriptionText: string;
}

export { SurveyInterface, SurveyContentInterface }