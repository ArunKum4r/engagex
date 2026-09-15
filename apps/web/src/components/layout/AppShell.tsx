import { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import Sidebar from "./Sidebar";

const AppShell = () => {
    const [sidebarOpen, setSidebarOpen] =
        useState(true);

    const [mobileSidebarOpen, setMobileSidebarOpen] =
        useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-background">
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

            <div className="flex min-w-0 flex-1 flex-col">
                <Header
                    onMenuClick={() =>
                        setMobileSidebarOpen(true)
                    }
                />

                <main className="min-h-0 flex-1 p-4 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppShell;