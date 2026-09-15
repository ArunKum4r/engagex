import { Menu } from "lucide-react";

interface HeaderProps {
    onMenuClick: () => void;
}

const Header = ({
    onMenuClick,
}: HeaderProps) => {
    return (
        <header className="flex h-16 shrink-0 items-center border-b border-border bg-surface px-4 sm:px-6">
            <button
                type="button"
                onClick={onMenuClick}
                className="mr-3 flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-surface-muted hover:text-text lg:hidden"
                aria-label="Open sidebar"
            >
                <Menu size={20} />
            </button>

            <div className="flex-1">
                <p className="text-sm font-medium text-text">
                    Dashboard
                </p>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                    AK
                </div>
            </div>
        </header>
    );
};

export default Header;