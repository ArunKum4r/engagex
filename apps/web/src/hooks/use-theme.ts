import { useEffect } from "react";
import { useUiStore, type Theme } from "../stores/ui.store";

function getSystemTheme(): "light" | "dark" {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
    const theme = useUiStore((state) => state.theme);

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (value: Theme) => {
            const resolvedTheme = value === "system" ? getSystemTheme() : value;
            root.dataset.theme = resolvedTheme;
        };

        applyTheme(theme);

        if (theme !== "system") {
            return;
        }

        const mediaQuery = window.matchMedia(
            "(prefers-color-scheme: dark)",
        );

        const handleChange = () => {
            applyTheme("system");
        };

        mediaQuery.addEventListener(
            "change",
            handleChange,
        );

        return () => {
            mediaQuery.removeEventListener(
                "change",
                handleChange,
            );
        };
    }, [theme]);
}