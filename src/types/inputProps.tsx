import { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
  borderColor?: string;
  focusBorderColor?: string;
}