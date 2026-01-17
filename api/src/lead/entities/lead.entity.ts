export class LeadEntity {
    id: string;
    organisationId: string;
    agentId: string;
    zohoId: string | null;
    ownerId: string | null;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    source: string | null;
    status: string | null;
    disposition: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    reasonForCold: string | null;
    isTransferred: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
    owner?: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        email: string | null;
    } | null;

    constructor(partial: Partial<LeadEntity>) {
        Object.assign(this, partial);
    }
}
