export enum Language {
  FRENCH = 'FRENCH',
  ENGLISH = 'ENGLISH',
  SPANISH = 'SPANISH',
  GERMAN = 'GERMAN',
  ITALIAN = 'ITALIAN'
}

export interface CreateUserDto {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  languages?: Language[];
  managerId?: string;
  isManager: boolean;
  password: string;
} 