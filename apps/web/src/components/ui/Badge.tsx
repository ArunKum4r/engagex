import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "accent";

interface BadgeProps {
    children: ReactNode;
    variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
    default: "bg-surface-muted text-text-secondary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    accent: "bg-accent-soft text-accent",
};

const Badge = ({ children, variant = "default" }: BadgeProps) => {
    return (
        <span
            className={[
                "inline-flex items-center",
                "rounded-full",
                "px-2 py-0.5",
                "text-xs font-medium",
                variantClasses[variant],
            ].join(" ")}
        >
            {children}
        </span>
    );
};

export default Badge;