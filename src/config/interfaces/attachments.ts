// Attachment interface is used by Attachment model
interface Attachment {
    id?: number;
    fileName: string;
    userId: number;
    accountId: number;
    extension: string;
    uniqueName: string;
    filePath: string;
    type: number;
    size: number;
    dataKey?: Text | null;
    status: number;
}

export {
    Attachment
}