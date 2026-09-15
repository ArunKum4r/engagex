import {
    useEffect,
    type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: ReactNode;
    className?: string;
    showCloseButton?: boolean;
}

const Modal = ({
    open,
    onClose,
    title,
    description,
    children,
    className = "",
    showCloseButton = true,
}: ModalProps) => {
    useEffect(() => {
        if (!open) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown,
        );

        const originalOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );

            document.body.style.overflow =
                originalOverflow;
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={
                title
                    ? "modal-title"
                    : undefined
            }
        >
            <button
                type="button"
                aria-label="Close modal"
                onClick={onClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            />

            <div
                className={[
                    "relative z-10 w-full max-w-md",
                    "max-h-[calc(100vh-2rem)] overflow-y-auto",
                    "rounded-xl border border-border",
                    "bg-surface shadow-2xl",
                    className,
                ].join(" ")}
                onClick={(event) =>
                    event.stopPropagation()
                }
            >
                {(title || description || showCloseButton) && (
                    <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
                        <div className="min-w-0">
                            {title && (
                                <h2
                                    id="modal-title"
                                    className="text-lg font-semibold text-text"
                                >
                                    {title}
                                </h2>
                            )}

                            {description && (
                                <p className="mt-1 text-sm leading-6 text-text-secondary">
                                    {description}
                                </p>
                            )}
                        </div>

                        {showCloseButton && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
                                aria-label="Close modal"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                )}

                <div className="px-6 py-5">
                    {children}
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default Modal;