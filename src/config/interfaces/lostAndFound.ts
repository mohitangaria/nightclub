interface LostAndFoundInterface {
    id?: number;
    type?: number;
    state?: number;
    itemBelongsTo?: number | null;
    eventId?: number;
    contactCountryCode?: string;
    proofOfOwner?: string;
    comment?: string;
    ownerFound?: boolean;
    bookingId?: number | null;
    reportedBy?: number;
    status?: number;
    attachmentId?: number;
    slot?: string;
    lostOrFoundDate?:Date | null;
    itemDescription?: string;
    itemName?: string; 
    contactPhone?: string | null;
    contactNumber?: string | null;
}



export { LostAndFoundInterface }