import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    leftIcon?: ReactNode;
}

const Input = ({label, error, hint, leftIcon, id, className = "", ...props}: InputProps) => {
    return (
        <div className="w-full">
            {label && (
                <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text">{label}</label>
            )}

            <div className="relative">
                {leftIcon && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                        {leftIcon}
                    </div>
                )}

                <input
                    id={id}
                    className={[
                        "h-10 w-full rounded-md border",
                        "bg-surface",
                        "text-sm text-text",
                        "placeholder:text-text-muted",
                        "outline-none",
                        "transition-colors",
                        "border-border",
                        "focus:border-accent",
                        "focus:ring-2",
                        "focus:ring-accent/15",
                        "disabled:cursor-not-allowed",
                        "disabled:opacity-50",
                        leftIcon ? "pl-10" : "px-3",
                        error
                            ? "border-danger focus:border-danger focus:ring-danger/15"
                            : "",
                        className,
                    ].join(" ")}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                        error
                            ? `${id}-error`
                            : hint
                              ? `${id}-hint`
                              : undefined
                    }
                    {...props}
                />
            </div>

            {error && (
                <p id={`${id}-error`} className="mt-1.5 text-xs text-danger">{error}</p>
            )}

            {!error && hint && (
                <p id={`${id}-hint`} className="mt-1.5 text-xs text-text-muted">{hint}</p>
            )}
        </div>
    );
};

export default Input;