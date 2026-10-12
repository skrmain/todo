import { useEffect, useRef } from 'react';

import { Button } from './Button';

export interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const cancelButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (open) {
            cancelButton.current?.focus();
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onCancel();
            }
        }
        window.addEventListener('keydown', closeOnEscape);
        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [onCancel, open]);

    if (!open) {
        return null;
    }

    return (
        <div className="ui-dialog-backdrop" onMouseDown={onCancel}>
            <section
                className="ui-dialog"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="ui-dialog-title"
                aria-describedby="ui-dialog-description"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <span className="ui-dialog-icon" aria-hidden="true">!</span>
                <h2 id="ui-dialog-title">{title}</h2>
                <p id="ui-dialog-description">{message}</p>
                <div className="ui-dialog-actions">
                    <Button ref={cancelButton} variant="subtle" onClick={onCancel}>
                        Keep task
                    </Button>
                    <Button variant="danger" onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </section>
        </div>
    );
}
