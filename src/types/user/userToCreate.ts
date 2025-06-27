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
    managerToken?: string; // Token d'invitation du manager
    isManager: boolean;
    password: string;
}