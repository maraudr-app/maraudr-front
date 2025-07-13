import { Language } from '../enums/Language';

export interface User {
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
    languages: string[];
    managerId?: string | null;
    isManager: boolean;
    createdAt: string;
    updatedAt: string;
}
