interface InquiryInterface {
    id?: number;
    contactCountryCode?: string;
    contactNumber?: string | null;
    eventId?: number;
    bookingId?: number | null;
    inquiredBy?: number;
    status?: number;
    partySize?: string;
    date?:Date | null;
    message?: Text;
    name?: string; 
    slot?: string | null;
}



export { InquiryInterface }