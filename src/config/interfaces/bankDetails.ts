interface BankDetailInterface {
    id?: number;
    userId?: number;
    details?: {
        accountHolderName: string;
        routingNumber: string;
        accountNumber: string;
        confirmAccountNumber: string;
    };
    isRevision?: boolean;
    revisionId?: number | null;
    status?: number;
}

export {BankDetailInterface}