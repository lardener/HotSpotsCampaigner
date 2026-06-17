import React, { useState } from 'react';
import {
    useFloating,
    useInteractions,
    useRole,
    useDismiss,
    FloatingPortal,
    FloatingOverlay,
    FloatingFocusManager,
} from '@floating-ui/react';

export interface TerminalOverlayProps {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: (val?: string) => void | Promise<void>; // Updated to allow optional string arg and async return
    onCancel?: () => void;
    variant?: 'alert' | 'info';
    themeClass?: string;
    loading?: boolean;
    showInputField?: boolean;
    inputPlaceholder?: string;
    inputInitialValue?: string;
    inputType?: string;
    inputLabel?: string;
    children?: React.ReactNode;
    headerActions?: React.ReactNode;
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
    loading = false, // Added loading prop
    showInputField = false,
    inputPlaceholder = '',
    inputInitialValue = '',
    inputType = 'text',
    inputLabel = 'INPUT',
    children,
    headerActions
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
    const [inputValue, setInputValue] = useState(inputInitialValue);

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
                            <div className="flex-between w-100">
                                <span><span className="blink-fast">▶</span> {title}</span>
                                {headerActions && <div className="overlay-header-actions">{headerActions}</div>}
                            </div>
                        </div>
                        <div style={{ border: `1px solid var(${variant === 'alert' ? '--terminal-alert' : '--terminal-border'})`, margin: '0 10px 10px 10px', padding: '15px', backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
                            <div className="overlay-body">
                                <p className="mb-10">{message}</p>
                                {showInputField && (
                                    <div className="status-bar theme-amber mt-10">
                                        <label htmlFor="terminal-overlay-input" className="restricted-text sm-text" style={{ minWidth: '100px', marginRight: '10px' }}>{inputLabel}</label>
                                        <input
                                            id="terminal-overlay-input"
                                            type={inputType}
                                            className="table-input w-100"
                                            style={{ border: 'none', padding: '0 5px' }}
                                            autoFocus
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && !loading && onConfirm(inputValue)}
                                            aria-label="Response input"
                                            placeholder={inputPlaceholder}
                                            title="Enter text and press Enter or CONFIRM"
                                        />
                                    </div>
                                )}
                                {children}
                            </div>
                            <div className="overlay-footer">
                                {onCancel && (
                                    <button type="button" className="mode-btn" onClick={onCancel} disabled={loading}>
                                        {cancelLabel}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    className={`mode-btn ${variant === 'alert' ? 'btn-alert' : 'btn-primary'}`}
                                    onClick={() => !loading && onConfirm(showInputField ? inputValue : undefined)}
                                    disabled={loading}
                                >
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