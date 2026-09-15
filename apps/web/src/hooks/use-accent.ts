import { useEffect } from "react";
import { useUiStore } from "../stores/ui.store";

export function useAccent() {
    const accentColor = useUiStore((state) => state.accentColor);

    useEffect(() => {
        document.documentElement.dataset.accent =
            accentColor;
    }, [accentColor]);

    return accentColor;
}