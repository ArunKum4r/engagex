import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: ReactNode;
    loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-accent text-accent-foreground hover:bg-accent-hover",
    secondary: "border border-border bg-surface text-text hover:bg-surface-muted",
    ghost: "text-text-secondary hover:bg-surface-muted hover:text-text",
    danger: "bg-danger text-white hover:opacity-90",
};

const sizeClasses: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-9 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
};

const Button = ({variant = "primary", size = "md", children, loading = false, disabled, className = "", ...props}: ButtonProps) => {
    return (
        <button
            disabled={disabled || loading}
            className={[
                "inline-flex shrink-0 items-center justify-center gap-2",,
                "rounded-md",
                "font-medium",
                "transition-colors",
                "whitespace-nowrap",
                "focus-visible:outline-none",
                "focus-visible:ring-2",
                "focus-visible:ring-accent",
                "focus-visible:ring-offset-2",
                "focus-visible:ring-offset-background",
                "disabled:pointer-events-none",
                "disabled:opacity-50",
                variantClasses[variant],
                sizeClasses[size],
                className,
            ].join(" ")}
            {...props}
        >
            {loading ? (
                <>
                    <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                        aria-hidden="true"
                    />

                    <span>Loading...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;