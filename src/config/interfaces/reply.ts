interface ReplyInterface {
    id?: number;
    topicId: number;
    inResponseTo?: number | null;
    userId: number;
    reply: string;
    replyAttachments?: number[];
    isRevision?: Boolean;
    revisionId?: number | null;
    status: number;
}
export { ReplyInterface }