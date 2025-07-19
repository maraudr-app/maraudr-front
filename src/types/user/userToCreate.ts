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
    languages: string[]; // Correspond au backend List<string>
    managerToken?: string; // Token d'invitation du manager (obligatoire si IsManager = false)
    isManager: boolean; // true = création de manager, false = création d'utilisateur
    password: string;
}