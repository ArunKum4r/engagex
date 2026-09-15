import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

import {
    acceptWorkspaceInvitation,
    getWorkspace,
} from "../../api/workspace";
import { queryKeys } from "../../lib/query-keys";
import Button from "../../components/ui/Button";
import { useWorkspaceStore } from "../../stores/workspace.store";

const AcceptInvitationPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { setCurrentWorkspace } = useWorkspaceStore();

    const token = searchParams.get("token");

    const [isLoading, setIsLoading] = useState(false);
    const [needsAuth, setNeedsAuth] = useState(false);
    const [error, setError] = useState("");

    const getReturnTo = () => {
        return `/invitations/accept?token=${encodeURIComponent(
            token ?? "",
        )}`;
    };

    const handleLogin = () => {
        navigate(
            `/login?returnTo=${encodeURIComponent(getReturnTo())}`,
        );
    };

    const handleRegister = () => {
        navigate(
            `/register?returnTo=${encodeURIComponent(getReturnTo())}`,
        );
    };

    const handleAcceptInvitation = async () => {
        if (!token) {
            setError("Invalid invitation link.");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            setNeedsAuth(false);

            const result = await acceptWorkspaceInvitation({
                token,
            });

            const workspace = await getWorkspace(
                result.workspaceId,
            );

            setCurrentWorkspace(workspace);

            await queryClient.invalidateQueries({
                queryKey: queryKeys.workspaces.all,
            });

            navigate("/");
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.status === 401) {
                    setNeedsAuth(true);
                    return;
                }

                const message = err.response?.data?.message;

                setError(
                    typeof message === "string"
                        ? message
                        : "Unable to accept invitation.",
                );

                return;
            }

            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to accept invitation.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
                <h1 className="text-xl font-semibold">
                    Workspace invitation
                </h1>

                <p className="mt-2 text-sm text-muted-foreground">
                    Accept this invitation to join the workspace.
                </p>

                {error && (
                    <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                        <p className="text-sm text-red-500">
                            {error}
                        </p>
                    </div>
                )}

                {needsAuth ? (
                    <div className="mt-6 space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Sign in or create an account to accept this
                            invitation.
                        </p>

                        <div className="flex gap-3">
                            <Button
                                className="flex-1"
                                onClick={handleLogin}
                            >
                                Login
                            </Button>

                            <Button
                                className="flex-1"
                                variant="secondary"
                                onClick={handleRegister}
                            >
                                Create account
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        className="mt-6 w-full"
                        onClick={handleAcceptInvitation}
                        disabled={isLoading || !token}
                    >
                        {isLoading
                            ? "Accepting..."
                            : "Accept invitation"}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default AcceptInvitationPage;