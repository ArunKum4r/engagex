import { useQuery } from "@tanstack/react-query";
import { getPlatformAccounts } from "../../api/integrations";
import { getAutomations } from "../../api/automation";
import { useWorkspaceStore } from "../../stores/workspace.store";
import { queryKeys } from "../../lib/query-keys";

const DashboardPage = () => {
    const currentWorkspace = useWorkspaceStore(
        (state) => state.currentWorkspace,
    );

    const workspaceName =
        currentWorkspace?.workspace.name ??
        "your workspace";

    const workspaceId =
    currentWorkspace?.workspace.id;

    const {
        data: platformAccounts = [],
        isLoading: isLoadingIntegrations,
    } = useQuery({
        queryKey: workspaceId
            ? queryKeys.integrations.all(workspaceId)
            : ["integrations", "none"],
        queryFn: () =>
            getPlatformAccounts(workspaceId as string),
        enabled: Boolean(workspaceId),
    });

    const {
        data: automations = [],
        isLoading: isLoadingAutomations,
    } = useQuery({
        queryKey: workspaceId
            ? queryKeys.automations.all(workspaceId)
            : ["automations", "none"],
        queryFn: () =>
            getAutomations(workspaceId as string),
        enabled: Boolean(workspaceId),
    });

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm font-medium text-accent">
                    Dashboard
                </p>

                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text">
                    Welcome back
                </h1>

                <p className="mt-2 text-sm text-text-secondary">
                    Here's what's happening in{" "}
                    <span className="font-medium text-text">
                        {workspaceName}
                    </span>
                    .
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="mt-2 text-2xl font-semibold text-text">
                        {isLoadingAutomations ? "..." : automations.length}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-text">
                        —
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                        Total automations
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="mt-2 text-2xl font-semibold text-text">
                        {isLoadingIntegrations
                            ? "..."
                            : platformAccounts.length}
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-text">
                        —
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                        Platform accounts
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-surface p-5">
                    <p className="text-sm text-text-secondary">
                        Messages
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-text">
                        —
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                        Coming with messaging
                    </p>
                </div>
            </div>

            <section className="rounded-xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                    <h2 className="text-sm font-semibold text-text">
                        Getting started
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        Set up your workspace to start
                        building automations.
                    </p>
                </div>

                <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-border bg-surface-muted p-4">
                        <p className="text-sm font-medium text-text">
                            Connect a platform
                        </p>

                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                            Connect Instagram or another
                            supported platform.
                        </p>
                    </div>

                    <div className="rounded-lg border border-border bg-surface-muted p-4">
                        <p className="text-sm font-medium text-text">
                            Create an automation
                        </p>

                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                            Build your first automated
                            workflow.
                        </p>
                    </div>

                    <div className="rounded-lg border border-border bg-surface-muted p-4">
                        <p className="text-sm font-medium text-text">
                            Invite your team
                        </p>

                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                            Collaborate with your
                            workspace members.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;