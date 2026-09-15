import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

const Card = ({children, className = "", ...props}: CardProps) => {
    return (
        <div
            className={[
                "rounded-lg border border-border",
                "bg-surface",
                "shadow-sm",
                className,
            ].join(" ")}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;