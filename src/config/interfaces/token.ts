interface TokenInterface {
    id?: number;
    type: string;
    email: string | null;
    username: string | null;
    countryCode: string | null;
    mobile: string | null;
    userId: number | null;
    accountId: number | null;
    token: string;
    code?: string;
    status: number;
    allowedAttempts?: number;
    verificationsAttempts?: number;
}

export { TokenInterface }