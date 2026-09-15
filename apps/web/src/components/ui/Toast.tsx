import {
    createContext,
    useCallback,
    useContext,
    useState,
    type ReactNode,
} from "react";
import { Check, Info, TriangleAlert, X } from "lucide-react";

type ToastType =
    | "success"
    | "error"
    | "info"
    | "warning";

interface ToastItem {
    id: number;
    type: ToastType;
    message: string;
}

interface ToastContextValue {
    toast: (
        message: string,
        type?: ToastType,
    ) => void;
}

const ToastContext =
    createContext<ToastContextValue | null>(null);

let toastId = 0;

const ToastProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [toasts, setToasts] =
        useState<ToastItem[]>([]);

    const toast = useCallback(
        (
            message: string,
            type: ToastType = "info",
        ) => {
            const id = ++toastId;

            setToasts((current) => [
                ...current,
                {
                    id,
                    type,
                    message,
                },
            ]);

            window.setTimeout(() => {
                setToasts((current) =>
                    current.filter(
                        (item) => item.id !== id,
                    ),
                );
            }, 4000);
        },
        [],
    );

    const dismiss = (id: number) => {
        setToasts((current) =>
            current.filter(
                (item) => item.id !== id,
            ),
        );
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}

            <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
                {toasts.map((item) => (
                    <ToastItem
                        key={item.id}
                        toast={item}
                        onDismiss={() =>
                            dismiss(item.id)
                        }
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

interface ToastItemProps {
    toast: ToastItem;
    onDismiss: () => void;
}

const ToastItem = ({
    toast,
    onDismiss,
}: ToastItemProps) => {
    const config = {
        success: {
            icon: Check,
            iconClass:
                "bg-success/10 text-success",
        },
        error: {
            icon: TriangleAlert,
            iconClass:
                "bg-danger/10 text-danger",
        },
        warning: {
            icon: TriangleAlert,
            iconClass:
                "bg-warning/10 text-warning",
        },
        info: {
            icon: Info,
            iconClass:
                "bg-accent-soft text-accent",
        },
    }[toast.type];

    const Icon = config.icon;

    return (
        <div className="pointer-events-auto flex items-start gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg">
            <div
                className={[
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    config.iconClass,
                ].join(" ")}
            >
                <Icon size={16} />
            </div>

            <p className="flex-1 pt-1 text-sm text-text">
                {toast.message}
            </p>

            <button
                type="button"
                onClick={onDismiss}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-muted hover:text-text"
                aria-label="Dismiss notification"
            >
                <X size={15} />
            </button>
        </div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error(
            "useToast must be used inside ToastProvider",
        );
    }

    return context.toast;
};

export default ToastProvider;