import { forwardRef, type ButtonHTMLAttributes } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'subtle' | 'danger';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { children, className = '', type = 'button', variant = 'primary', ...props },
    ref,
) {
    return (
        <button
            ref={ref}
            className={`ui-button ui-button-${variant} ${className}`.trim()}
            type={type}
            {...props}
        >
            {children}
        </button>
    );
});
