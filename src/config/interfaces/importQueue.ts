// Email list interface for email list model
interface ImportQueueInterface {
    id?: number;
    userId: number;
    accountId: number | null;
    fileId: number;
    emailListId: number;
    totalRecords: number;
    successRecords: number;
    failedRecords: number;
    status: number;
}

export { ImportQueueInterface }