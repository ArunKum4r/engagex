import {
    Bot,
    Boxes,
    ChevronLeft,
    ChevronRight,
    CreditCard,
    LayoutDashboard,
    Settings,
    X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import WorkspaceSelector from "./WorkspaceSelector";

interface SidebarProps {
    open: boolean;
    mobileOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
}

const navigation = [
    {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Automations",
        href: "/automations",
        icon: Bot,
    },
    {
        label: "Integrations",
        href: "/integrations",
        icon: Boxes,
    },
];

const Sidebar = ({
    open,
    mobileOpen,
    onToggle,
    onClose,
}: SidebarProps) => {
    return (
        <>
            {mobileOpen && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    onClick={onClose}
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                />
            )}

            <aside
                className={[
                    "fixed inset-y-0 left-0 z-50 flex flex-col",
                    "border-r border-border bg-surface",
                    "transition-all duration-200",
                    "lg:static lg:z-auto",
                    mobileOpen
                        ? "translate-x-0"
                        : "-translate-x-full lg:translate-x-0",
                    open
                        ? "w-64"
                        : "w-16",
                ].join(" ")}
            >
                {/* Header */}

                <div
                    className={[
                        "flex h-16 shrink-0 items-center border-b border-border",
                        open
                            ? "justify-between px-4"
                            : "justify-center",
                    ].join(" ")}
                >
                    <NavLink
                        to="/dashboard"
                        onClick={onClose}
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
                            E
                        </div>

                        {open && (
                            <span className="text-lg font-semibold tracking-tight text-text">
                                EngageX
                            </span>
                        )}
                    </NavLink>

                    {open && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="hidden h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text lg:flex"
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}

                    {!open && (
                        <button
                            type="button"
                            onClick={onToggle}
                            className="absolute right-[-14px] top-5 hidden h-7 w-7 items-center justify-center rounded-full border border-border bg-surface text-text-muted shadow-sm hover:text-text lg:flex"
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight size={15} />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-5 flex h-8 w-8 items-center justify-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Workspace selector */}

                {open && <WorkspaceSelector />}

                {/* Navigation */}

                <nav className="flex-1 overflow-y-auto px-2 py-4">
                    {open && (
                        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-text-muted">
                            Workspace
                        </p>
                    )}

                    <div className="space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    onClick={onClose}
                                    title={
                                        open
                                            ? undefined
                                            : item.label
                                    }
                                    className={({ isActive }) =>
                                        [
                                            "flex items-center rounded-md py-2.5 text-sm font-medium transition-colors",
                                            open
                                                ? "gap-3 px-3"
                                                : "justify-center px-0",
                                            isActive
                                                ? "bg-accent/10 text-accent"
                                                : "text-text-secondary hover:bg-surface-muted hover:text-text",
                                        ].join(" ")
                                    }
                                >
                                    <Icon size={18} />
                                    {open && item.label}
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom area */}

                <div className="shrink-0 border-t border-border p-2">
                    {/* Plan */}

                    <div
                        className={
                            open
                                ? "mb-2 rounded-lg border border-border bg-surface-muted p-3"
                                : "mb-2 flex justify-center"
                        }
                    >
                        {open ? (
                            <>
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="text-xs font-semibold text-text">
                                            Pro Plan
                                        </p>

                                        <p className="mt-1 text-xs text-text-muted">
                                            12 days remaining
                                        </p>
                                    </div>

                                    <CreditCard
                                        size={16}
                                        className="text-accent"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="mt-3 text-xs font-medium text-accent hover:text-accent-hover"
                                >
                                    Manage plan
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                title="Manage plan"
                                className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted hover:text-text"
                            >
                                <CreditCard size={18} />
                            </button>
                        )}
                    </div>

                    {/* Settings */}

                    <NavLink
                        to="/settings"
                        onClick={onClose}
                        title={
                            open
                                ? undefined
                                : "Settings"
                        }
                        className={({ isActive }) =>
                            [
                                "mb-2 flex items-center rounded-md py-2.5 text-sm font-medium transition-colors",
                                open
                                    ? "gap-3 px-3"
                                    : "justify-center px-0",
                                isActive
                                    ? "bg-accent/10 text-accent"
                                    : "text-text-secondary hover:bg-surface-muted hover:text-text",
                            ].join(" ")
                        }
                    >
                        <Settings size={18} />
                        {open && "Settings"}
                    </NavLink>

                    {/* User */}

                    <button
                        type="button"
                        className={[
                            "flex w-full items-center rounded-lg transition-colors hover:bg-surface-muted",
                            open
                                ? "gap-3 p-2"
                                : "justify-center p-1",
                        ].join(" ")}
                    >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                            AK
                        </div>

                        {open && (
                            <div className="min-w-0 flex-1 text-left">
                                <p className="truncate text-sm font-medium text-text">
                                    Arun Kumar
                                </p>

                                <p className="truncate text-xs text-text-muted">
                                    arun@example.com
                                </p>
                            </div>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;