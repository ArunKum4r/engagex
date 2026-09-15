import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark" | "system";

export type AccentColor = "blue" | "violet" | "green" | "orange" | "pink" | "red" | "yelloe";

interface UiState{
    theme: Theme;
    accentColor: AccentColor;
    sidebarCollapsed: boolean;

    setTheme: (theme: Theme) => void;
    setAccentColor: (accentColor: AccentColor) => void;
    toggleSidebar: () => void;
}

export const useUiStore = create<UiState>()(
    persist(
        (set) => ({
            theme: "system",
            accentColor: "blue",
            sidebarCollapsed: false,

            setTheme: (theme) => {
                set({ theme });
            },
            setAccentColor: (accentColor) => {
                set({ accentColor });
            },
            toggleSidebar: () => {
                set((state) => ({
                    sidebarCollapsed:
                        !state.sidebarCollapsed,
                }));
            },
        }),
        {
            name: "engagex-ui",
        },
    ),
);