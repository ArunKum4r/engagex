import {
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    getPlatformAccount,
} from "../../api/integrations";
import { useWorkspaceStore } from "../../stores/workspace.store";

const IntegrationAccountPage = () => {
    const navigate = useNavigate();

    const {
        integrationSlug,
        accountId,
    } = useParams<{
        integrationSlug: string;
        accountId: string;
    }>();

    const currentWorkspace = useWorkspaceStore(
        (state) => state.currentWorkspace,
    );

    const workspaceId =
        currentWorkspace?.workspace.id;

    const {
        data: account,
        isLoading,
        isError,
    } = useQuery({
        queryKey: [
            "platform-account",
            workspaceId,
            accountId,
        ],
        queryFn: () =>
            getPlatformAccount(
                workspaceId!,
                accountId!,
            ),
        enabled:
            Boolean(workspaceId) &&
            Boolean(accountId),
    });

    const handleBack = () => {
        navigate(
            `/integrations/${integrationSlug}`,
        );
    };

    if (isLoading) {
        return (
            <div className="text-sm text-muted-foreground">
                Loading account...
            </div>
        );
    }

    if (isError || !account) {
        return (
            <div className="space-y-6">
                <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Account not found
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        We couldn't load this connected
                        account.
                    </p>
                </div>
            </div>
        );
    }

    const isConnected =
        account.status.toUpperCase() === "ACTIVE";

    return (
        <div className="space-y-8">
            {/* Back */}
            <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Instagram
            </button>

            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-background">
                    <span className="text-base font-semibold">
                        {account.platform.toUpperCase() ===
                        "INSTAGRAM"
                            ? "IG"
                            : account.platform.charAt(
                                  0,
                              ).toUpperCase()}
                    </span>
                </div>

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {account.username
                            ? `@${account.username}`
                            : account.name ??
                              "Connected account"}
                    </h1>

                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {account.platform}
                        </span>

                        <span className="text-muted-foreground">
                            ·
                        </span>

                        <span
                            className={
                                isConnected
                                    ? "flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400"
                                    : "text-sm text-muted-foreground"
                            }
                        >
                            {isConnected && (
                                <CheckCircle2 className="h-4 w-4" />
                            )}

                            {isConnected
                                ? "Connected"
                                : account.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Account */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold">
                        Account
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Information about this connected
                        account.
                    </p>
                </div>

                <div className="rounded-xl border bg-card">
                    <div className="grid gap-0 sm:grid-cols-2">
                        <AccountField
                            label="Username"
                            value={
                                account.username
                                    ? `@${account.username}`
                                    : "—"
                            }
                        />

                        <AccountField
                            label="Name"
                            value={
                                account.name ?? "—"
                            }
                        />

                        <AccountField
                            label="Platform"
                            value={account.platform}
                        />

                        <AccountField
                            label="Status"
                            value={account.status}
                        />

                        <AccountField
                            label="Connected"
                            value={formatDate(
                                account.createdAt,
                            )}
                        />
                    </div>
                </div>
            </section>

            {/* Automation */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold">
                        Automation
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Automations and content using this
                        account.
                    </p>
                </div>

                <div className="rounded-xl border border-dashed bg-card p-6">
                    <p className="text-sm text-muted-foreground">
                        Account automations will appear here.
                    </p>
                </div>
            </section>

            {/* Danger Zone */}
            <section className="space-y-4">
                <div>
                    <h2 className="text-sm font-semibold">
                        Danger zone
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Actions that affect this connected
                        account.
                    </p>
                </div>

                <div className="rounded-xl border border-destructive/30 bg-card p-5">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-medium">
                                Disconnect account
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Remove this account from
                                EngageX.
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled
                            className="rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive opacity-60"
                        >
                            Disconnect
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

interface AccountFieldProps {
    label: string;
    value: string;
}

const AccountField = ({
    label,
    value,
}: AccountFieldProps) => {
    return (
        <div className="border-b p-5 last:border-b-0 sm:nth-[2n]:border-l">
            <p className="text-xs font-medium text-muted-foreground">
                {label}
            </p>

            <p className="mt-1 text-sm font-medium">
                {value}
            </p>
        </div>
    );
};

const formatDate = (value: string) => {
    return new Intl.DateTimeFormat(
        undefined,
        {
            dateStyle: "medium",
        },
    ).format(new Date(value));
};

export default IntegrationAccountPage;