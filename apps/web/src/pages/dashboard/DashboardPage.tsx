import { useQuery } from "@tanstack/react-query";
import {
    Activity,
    Bot,
    Boxes,
    MessageCircle,
    Users,
} from "lucide-react";

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
        <div className="mx-auto w-full max-w-[1600px] space-y-5 sm:space-y-6">
            {/* Page introduction */}
            <section>
                <p className="text-sm font-medium text-accent">
                    Dashboard
                </p>

                <div className="mt-1 flex flex-col gap-1">
                    <h1 className="text-xl font-semibold tracking-tight text-text sm:text-3xl">
                        Welcome back
                    </h1>

                    <p className="text-sm text-text-secondary">
                        Here's what's happening in{" "}
                        <span className="font-medium text-text">
                            {workspaceName}
                        </span>
                        .
                    </p>
                </div>
            </section>

            {/* Overview */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong">
                    <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                            <Bot size={18} />
                        </div>

                        <Activity
                            size={16}
                            className="text-text-muted"
                        />
                    </div>

                    <p className="mt-5 text-2xl font-semibold tracking-tight text-text">
                        {isLoadingAutomations
                            ? "..."
                            : automations.length}
                    </p>

                    <p className="mt-1 text-sm font-medium text-text">
                        Automations
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                        Total automations in this workspace
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong">
                    <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                            <Boxes size={18} />
                        </div>

                        <Activity
                            size={16}
                            className="text-text-muted"
                        />
                    </div>

                    <p className="mt-5 text-2xl font-semibold tracking-tight text-text">
                        {isLoadingIntegrations
                            ? "..."
                            : platformAccounts.length}
                    </p>

                    <p className="mt-1 text-sm font-medium text-text">
                        Platform accounts
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                        Connected accounts across platforms
                    </p>
                </div>

                <div className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-border-strong">
                    <div className="flex items-center justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-text-secondary">
                            <MessageCircle size={18} />
                        </div>

                        <span className="rounded-full bg-surface-muted px-2 py-1 text-[11px] font-medium text-text-muted">
                            Soon
                        </span>
                    </div>

                    <p className="mt-5 text-2xl font-semibold tracking-tight text-text">
                        —
                    </p>

                    <p className="mt-1 text-sm font-medium text-text">
                        Messages
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                        Messaging analytics will appear here
                    </p>
                </div>
            </section>

            {/* Getting started */}
            <section className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-5 sm:px-6">
                    <h2 className="text-sm font-semibold text-text">
                        Getting started
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        Set up your workspace to start
                        building automations.
                    </p>
                </div>

                <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
                    <div className="bg-surface p-5 transition-colors hover:bg-surface-muted">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                            <Boxes size={18} />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-text">
                            Connect a platform
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                            Connect Instagram or another
                            supported platform.
                        </p>
                    </div>

                    <div className="bg-surface p-5 transition-colors hover:bg-surface-muted">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                            <Bot size={18} />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-text">
                            Create an automation
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                            Build your first automated
                            workflow.
                        </p>
                    </div>

                    <div className="bg-surface p-5 transition-colors hover:bg-surface-muted">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                            <Users size={18} />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-text">
                            Invite your team
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                            Collaborate with your
                            workspace members.
                        </p>
                    </div>
                </div>
            </section>

            {/* Activity */}
            <section className="rounded-xl border border-border bg-surface">
                <div className="px-5 py-5 sm:px-6">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <h2 className="text-sm font-semibold text-text">
                                Recent activity
                            </h2>

                            <p className="mt-1 text-sm text-text-secondary">
                                Activity from your workspace will
                                appear here.
                            </p>
                        </div>

                        <div className="hidden h-9 w-9 items-center justify-center rounded-lg bg-surface-muted text-text-muted sm:flex">
                            <Activity size={17} />
                        </div>
                    </div>

                    <div className="mt-5 rounded-lg border border-dashed border-border-strong px-4 py-8 text-center">
                        <p className="text-sm font-medium text-text">
                            No recent activity
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                            Automation and workspace activity
                            will appear here.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DashboardPage;