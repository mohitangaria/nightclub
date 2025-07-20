// Email list interface for email list model
interface IdentityInterface {
    id?: number;
    userId: number;
    accountId: number | null;
    lastUpdatedBy: number;
    email: string;
    status:number
}
export { IdentityInterface }