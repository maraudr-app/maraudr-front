import { ReactNode } from 'react';

export interface OptionElementProps {
    value: string | number | readonly string[] | undefined;
    children: ReactNode;
} 