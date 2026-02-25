export class OrganisationEntity {
    id: string;
    name: string;
    slug: string;
    availableIndianChannels: number;
    availableInternationalChannels: number;
    credits: number;
    chatCredits: number;
    callCredits: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<OrganisationEntity>) {
        Object.assign(this, partial);
    }
}
