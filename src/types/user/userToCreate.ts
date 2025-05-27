import { Language } from '../enums/Language';

export interface UserToCreate {
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    languages: Language[];
    managerId?: string | null;
    isManager: boolean;
    password: string;
}