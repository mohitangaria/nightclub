interface InvitationInterface {
    id?: number;
    communityId: number;
    userId: number;
    lastUpdatedBy: number;
    subject: string;
    description: Text;
    descriptionText:Text
    Members?: string[];
}

interface InvitedMemberInterface {
    id?: number;
    invitationId?: number;
    email: string;
    status:string;
}

export { InvitationInterface, InvitedMemberInterface }