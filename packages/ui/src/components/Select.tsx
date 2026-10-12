import type { SelectHTMLAttributes } from 'react';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ children, className = '', ...props }: SelectProps) {
    return (
        <select className={`ui-select ${className}`.trim()} {...props}>
            {children}
        </select>
    );
}
