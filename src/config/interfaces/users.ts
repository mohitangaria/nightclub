import { RoleInterface } from './roles';

interface UserInterface {
    id?: number;
    email: string | null;
    username: string | null;
    countryCode?: string;
    mobile: string | null;
    password: string | null;
    status: number | null;
    userProfile?: UserProfileInterface,
    sellerProfile?: SellerProfileInterface,
    Roles?: RoleInterface[],
    createdAt?: Date,
    updatedAt?: Date,
    googleLogin?: Boolean;
    facebookLogin?: Boolean;
    searchIndex?: string | null;
}

interface UserAccountInterface {
    id?: number;
    userId?: number;
    accountId: number | null;
    isDefault: boolean;

}

interface UserProfileInterface {
    id?: number;
    userId?: number;
    name?: string;
    referralCode?: string;
    attachmentId?: number | null;
    generalNotifications?: boolean | null;
    paymentNotifications?: boolean | null;
    reminderNotifications?: boolean | null;
}

interface SellerProfileInterface {
    id?: number;
    userId?: number;
    name?: string;
    attachmentId?: number | null;
    isStripeConnected?: boolean;
    isVerifiedProfile?: boolean;
    hasSellerAccount?: boolean;
    isVerifiedDocuments?: boolean;
    contactEmail?: string;
    contactCountryCode?: string;
    contactPhone?: string;
    storeUrl?: string;
    socialMediaLink?: string;
    comment?: string;
    currentStatus?: number;
    status?: number;
}

interface ShopRequestInterface {
    id?: number;
    userId?: number;
    accountId?: number;
    shopName?: string;
    requestObject?: any;
    status?: number;
}

export { UserInterface, UserAccountInterface, UserProfileInterface, SellerProfileInterface, ShopRequestInterface }