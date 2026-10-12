import type { InputHTMLAttributes } from 'react';

export type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function TextInput({ className = '', ...props }: TextInputProps) {
    return <input className={`ui-input ${className}`.trim()} type="text" {...props} />;
}
