export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
}

export interface DecodedToken {
    sub: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    exp: number;
}

export interface ContactInfo {
    email: string;
    phoneNumber: string;
}

export interface Address {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export interface User {
    role: number;
    team: any[];
    id: string;
    firstname: string;
    lastname: string;
    createdAt: string;
    lastLoggedIn: string;
    isActive: boolean;
    contactInfo: ContactInfo;
    address: Address;
    passwordHash: string;
    biography: string | null;
    languages: string[];
} 