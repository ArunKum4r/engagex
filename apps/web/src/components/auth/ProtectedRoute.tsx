import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuthStore();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        const returnTo = `${location.pathname}${location.search}`;

        return (
            <Navigate
                to={`/login?returnTo=${encodeURIComponent(returnTo)}`}
                replace
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;