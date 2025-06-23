export interface TeamMember {
    id: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    languages: (string | number)[];
    managerId?: string | null;
    isManager: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface TeamResponse {
    members: TeamMember[];
    totalCount: number;
}

export interface AddTeamMemberRequest {
    userId: string;
}

export interface RemoveTeamMemberRequest {
    userId: string;
} 