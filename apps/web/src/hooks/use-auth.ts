import { useEffect } from "react";

import { getMe } from "../api/auth";
import { useAuthStore } from "../stores/auth.store";

export const useAuth = () => {
    const setUser = useAuthStore(
        (state) => state.setUser,
    );

    const setLoading = useAuthStore(
        (state) => state.setLoading,
    );

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const response = await getMe();

                setUser(response.user);
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, [setUser, setLoading]);
};