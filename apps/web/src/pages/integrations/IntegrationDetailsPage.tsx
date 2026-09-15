import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Plus,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import { getPlatformAccounts } from "../../api/integrations";
import {
    integrations,
} from "../integrations/integrations";
import { useWorkspaceStore } from "../../stores/workspace.store";

const IntegrationDetailsPage = () => {
    const navigate = useNavigate();

    const { integrationSlug } = useParams<{
        integrationSlug: string;
    }>();

    const currentWorkspace = useWorkspaceStore(
        (state) => state.currentWorkspace,
    );

    const workspaceId =
        currentWorkspace?.workspace.id;

    const integration = integrations.find(
        (item) => item.slug === integrationSlug,
    );

    const {
        data: accounts = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: [
            "platform-accounts",
            workspaceId,
        ],
        queryFn: () =>
            getPlatformAccounts(workspaceId!),
        enabled:
            Boolean(workspaceId) &&
            integration?.status === "AVAILABLE",
    });

    const connectedAccounts = accounts.filter(
        (account) =>
            account.platform.toUpperCase() ===
            integrationSlug?.toUpperCase(),
    );

    const handleConnect = () => {
        if (
            !workspaceId ||
            integrationSlug !== "instagram"
        ) {
            return;
        }

        const apiUrl =
            import.meta.env.VITE_API_URL ??
            "http://localhost:3000";

        window.location.href =
            `${apiUrl}/workspaces/${workspaceId}` +
            `/integrations/instagram/connect`;
    };

    if (!integration) {
        return (
            <div className="space-y-6">
                <BackButton
                    onClick={() =>
                        navigate("/integrations")
                    }
                />

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Integration not found
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        The integration you're looking for
                        doesn't exist.
                    </p>
                </div>
            </div>
        );
    }

    const isAvailable =
        integration.status === "AVAILABLE";

    return (
        <div className="space-y-8">
            {/* Back */}
            <BackButton
                onClick={() =>
                    navigate("/integrations")
                }
            />

            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-background">
                    <span className="text-base font-semibold">
                        {integration.slug === "instagram"
                            ? "IG"
                            : integration.name.charAt(
                                  0,
                              )}
                    </span>
                </div>

                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            {integration.name}
                        </h1>

                        {!isAvailable && (
                            <span className="rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                Coming soon
                            </span>
                        )}
                    </div>

                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        {integration.description}
                    </p>
                </div>
            </div>

            {!isAvailable ? (
                <ComingSoonState />
            ) : (
                <>
                    {/* Connected Accounts */}
                    <section className="space-y-4">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Connected accounts
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Manage the accounts connected
                                    to EngageX.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleConnect}
                                className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
                            >
                                <Plus className="h-4 w-4" />
                                Connect account
                            </button>
                        </div>

                        <div className="overflow-hidden rounded-xl border bg-card">
                            {isLoading ? (
                                <div className="p-5 text-sm text-muted-foreground">
                                    Loading connected
                                    accounts...
                                </div>
                            ) : isError ? (
                                <div className="p-5 text-sm text-destructive">
                                    Failed to load connected
                                    accounts.
                                </div>
                            ) : connectedAccounts.length ===
                              0 ? (
                                <div className="p-6">
                                    <p className="text-sm text-muted-foreground">
                                        No accounts connected
                                        yet.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={
                                            handleConnect
                                        }
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Connect Instagram
                                    </button>
                                </div>
                            ) : (
                                connectedAccounts.map(
                                    (account) => (
                                        <div
                                            key={account.id}
                                            className="flex items-center justify-between gap-4 border-b p-5 last:border-b-0"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-background">
                                                    <span className="text-xs font-semibold">
                                                        {integration.slug ===
                                                        "instagram"
                                                            ? "IG"
                                                            : integration.name.charAt(
                                                                  0,
                                                              )}
                                                    </span>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium">
                                                        {account.username
                                                            ? `@${account.username}`
                                                            : account.name ??
                                                              "Connected account"}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                                        {integration.name}{" "}
                                                        account
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Connected
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/integrations/${integrationSlug}/accounts/${account.id}`,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                                >
                                                    Manage
                                                    <ArrowRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ),
                                )
                            )}
                        </div>
                    </section>

                    {/* Capabilities */}
                    <section className="space-y-4">
                        <div>
                            <h2 className="text-sm font-semibold">
                                Capabilities
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                What you can do with this
                                integration in EngageX.
                            </p>
                        </div>

                        <div className="rounded-xl border bg-card p-5">
                            <div className="grid gap-4 sm:grid-cols-2">
                                {integration.capabilities.map(
                                    (capability) => (
                                        <div
                                            key={
                                                capability
                                            }
                                            className="flex items-center gap-3"
                                        >
                                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />

                                            <span className="text-sm">
                                                {capability}
                                            </span>
                                        </div>
                                    ),
                                )}
                            </div>
                        </div>
                    </section>

                    {/* About */}
                    <section className="space-y-4">
                        <div>
                            <h2 className="text-sm font-semibold">
                                About this integration
                            </h2>
                        </div>

                        <div className="rounded-xl border bg-card p-5">
                            <p className="text-sm leading-6 text-muted-foreground">
                                Connect your{" "}
                                {integration.name}{" "}
                                account to EngageX to use
                                the available automation and
                                platform features.
                            </p>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

interface BackButtonProps {
    onClick: () => void;
}

const BackButton = ({
    onClick,
}: BackButtonProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
            <ArrowLeft className="h-4 w-4" />
            Back to integrations
        </button>
    );
};

const ComingSoonState = () => {
    return (
        <div className="rounded-xl border border-dashed bg-card p-8 text-center">
            <h2 className="font-medium">
                Coming soon
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                This integration is planned for EngageX
                but isn't available yet.
            </p>
        </div>
    );
};

export default IntegrationDetailsPage;