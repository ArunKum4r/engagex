import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";

interface HeaderProps {
    onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
    const location = useLocation();

    const getPageTitle = () => {
        if (location.pathname === "/dashboard") {
            return "Dashboard";
        }

        if (location.pathname === "/contacts") {
            return "Contacts";
        }

        if (location.pathname.startsWith("/contacts/")) {
            return "Contact Details";
        }

        if (location.pathname === "/automations") {
            return "Automations";
        }

        if (location.pathname === "/integrations") {
            return "Integrations";
        }

        if (location.pathname === "/settings") {
            return "Settings";
        }

        if (location.pathname === "/inbox") {
            return "Inbox";
        }

        return "Dashboard";
    };

    return (
        <header className="flex h-16 shrink-0 items-center border-b border-border bg-surface px-4 sm:px-5 lg:px-6">
            <button
                type="button"
                onClick={onMenuClick}
                className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 lg:hidden"
                aria-label="Open sidebar"
            >
                <Menu size={20} strokeWidth={2} />
            </button>

            <div className="min-w-0 flex-1">
                <h1 className="truncate text-base font-semibold tracking-tight text-text">
                    {getPageTitle()}
                </h1>
            </div>

            <div className="ml-4 flex shrink-0 items-center">
                <button
                    type="button"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent transition-colors hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30"
                    aria-label="Open profile"
                >
                    AK
                </button>
            </div>
        </header>
    );
};

export default Header;