export class LeadOwnerEntity {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<LeadOwnerEntity>) {
        Object.assign(this, partial);
    }
}
