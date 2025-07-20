interface AddressInterface{
    id?:number;
    userId?:number;
    shopId?:number;
    accountId?:number;
    mapAddress?:string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string | null;
    country?: string;
    landmark?: string;
    addressLine1?: string;
    addressLine2?: string;
    latitude?: number;
    longitude?: number;
    geoLocation?: any;
    status?:number;
    name?: string | null;
    countryCode?: string | null;
    phone?: string | null;
    entityType?: string | null;
    addressType?: string | null;
}

export { AddressInterface }