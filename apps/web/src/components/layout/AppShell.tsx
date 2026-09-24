import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

const AppShell = () => {
    const location = useLocation();

    const [sidebarOpen, setSidebarOpen] =
        useState(true);

    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    const isInbox =
        location.pathname === "/inbox";

    return (
        <div className="flex h-dvh min-h-0 overflow-hidden bg-background">
            <Sidebar
                open={sidebarOpen}
                mobileOpen={mobileSidebarOpen}
                onToggle={() =>
                    setSidebarOpen((value) => !value)
                }
                onClose={() =>
                    setMobileSidebarOpen(false)
                }
            />

            <div className="flex min-w-0 min-h-0 flex-1 flex-col">
                <Header
                    onMenuClick={() =>
                        setMobileSidebarOpen(true)
                    }
                />

                <main
                    className={[
                        "min-h-0 min-w-0 flex-1",
                        isInbox
                            ? "overflow-hidden"
                            : "overflow-y-auto overscroll-contain",
                    ].join(" ")}
                >
                    {isInbox ? (
                        <div className="h-full min-h-0 w-full p-2 sm:p-3">
                            <Outlet />
                        </div>
                    ) : (
                        <div className="w-full px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-6">
                            <Outlet />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AppShell;