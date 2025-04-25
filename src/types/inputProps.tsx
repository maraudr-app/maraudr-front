import { ChangeEvent } from "react";

export interface InputProps {
    placeholder?: string;
    type?: string;
    className?: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    name?: string;
    id?: string;
    required?: boolean;
    autoComplete?: string;
}



