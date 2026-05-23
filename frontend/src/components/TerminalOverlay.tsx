import React from 'react';
import {
    useFloating,
    useInteractions,
    useRole,
    useDismiss,
    FloatingPortal,
    FloatingOverlay,
    FloatingFocusManager,
} from '@floating-ui/react';

interface TerminalOverlayProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'alert' | 'info';
    themeClass?: string;
    children?: React.ReactNode;
}

export const TerminalOverlay: React.FC<TerminalOverlayProps> = ({
    title,
    message,
    confirmLabel = 'CONFIRM',
    cancelLabel = 'ABORT',
    onConfirm,
    onCancel,
    variant = 'info',
    themeClass = '',
    children
}) => {
    const { refs, context } = useFloating({
        open: true,
        onOpenChange: (open: boolean) => {
            if (!open && onCancel) onCancel();
        },
    });

    const dismiss = useDismiss(context);
    const role = useRole(context, { role: 'dialog' });
    const { getFloatingProps } = useInteractions([dismiss, role]);

    return (
        <FloatingPortal>
            <FloatingOverlay
                className={`terminal-overlay-backdrop ${themeClass}`}
                lockScroll
                style={{ zIndex: 9999, display: 'grid', placeItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.97)' }}
            >
                <FloatingFocusManager context={context}>
                    <div
                        className={`terminal-overlay-panel ${variant === 'alert' ? 'border-alert' : ''}`}
                        ref={refs.setFloating}
                        {...getFloatingProps()}
                    >
                        <div className="overlay-header">
                            <span className="blink-fast">▶</span> {title}
                        </div>
                        <div style={{ border: `1px solid var(${variant === 'alert' ? '--terminal-alert' : '--terminal-border'})`, margin: '0 10px 10px 10px', padding: '15px', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                            <div className="overlay-body">
                                <p>{message}</p>
                                {children}
                            </div>
                            <div className="overlay-footer">
                                {onCancel && (
                                    <button type="button" className="mode-btn" onClick={onCancel}>
                                        {cancelLabel}
                                    </button>
                                )}
                                <button type="button" className={`mode-btn ${variant === 'alert' ? 'btn-alert' : 'btn-primary'}`} onClick={onConfirm}>
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </FloatingFocusManager>
            </FloatingOverlay>
        </FloatingPortal>
    );
};