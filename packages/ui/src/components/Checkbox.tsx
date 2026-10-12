import type { InputHTMLAttributes } from 'react';

export type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function Checkbox({ className = '', ...props }: CheckboxProps) {
    return <input className={`ui-checkbox ${className}`.trim()} type="checkbox" {...props} />;
}
