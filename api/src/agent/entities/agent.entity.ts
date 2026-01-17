export class AgentEntity {
    id: string;
    name: string;
    organisationId: string;
    slug: string;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(partial: Partial<AgentEntity>) {
        Object.assign(this, partial);
    }
}
