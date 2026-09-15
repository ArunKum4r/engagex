import { useQuery } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";

import {
    getWorkspaceMembers,
} from "../../api/workspace";

import { queryKeys } from "../../lib/query-keys";
import { useWorkspaceStore } from "../../stores/workspace.store";
import Button from "../../components/ui/Button";
import { useState } from "react";
import InviteMemberModal from "../../components/workspaces/InviteMemberModal";

const WorkspaceMembersPage = () => {
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const currentWorkspace = useWorkspaceStore(
        (state) => state.currentWorkspace,
    );

    const workspaceId =
        currentWorkspace?.workspace.id;

    const {
        data: members = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: workspaceId
            ? queryKeys.workspaces.members(
                  workspaceId,
              )
            : ["members", "none"],

        queryFn: () =>
            getWorkspaceMembers(
                workspaceId as string,
            ),

        enabled: Boolean(workspaceId),
    });

    if (!currentWorkspace) {
        return (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
                <p className="text-sm text-text-secondary">
                    Select a workspace to manage
                    members.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <p className="text-sm font-medium text-accent">
                        Settings
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-text">
                        Members
                    </h1>

                    <p className="mt-2 text-sm text-text-secondary">
                        Manage who has access to this
                        workspace.
                    </p>
                </div>

                <Button
                    onClick={() => setInviteModalOpen(true)}
                >
                    <UserPlus size={17} />
                    Invite member
                </Button>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-surface">
                <div className="border-b border-border px-5 py-4">
                    <h2 className="text-sm font-semibold text-text">
                        Workspace members
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        {members.length}{" "}
                        {members.length === 1
                            ? "member"
                            : "members"}
                    </p>
                </div>

                {isLoading && (
                    <div className="p-8 text-center">
                        <p className="text-sm text-text-secondary">
                            Loading members...
                        </p>
                    </div>
                )}

                {isError && (
                    <div className="p-8 text-center">
                        <p className="text-sm text-danger">
                            Unable to load workspace
                            members.
                        </p>
                    </div>
                )}

                {!isLoading &&
                    !isError &&
                    members.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-sm font-medium text-text">
                                No members found
                            </p>
                        </div>
                    )}

                {!isLoading &&
                    !isError &&
                    members.length > 0 && (
                        <div className="divide-y divide-border">
                            {members.map((member) => {
                                const isOwner =
                                    member.membership
                                        .role ===
                                    "OWNER";

                                const initial =
                                    member.user.name
                                        .charAt(0)
                                        .toUpperCase();

                                return (
                                    <div
                                        key={
                                            member.membership
                                                .id
                                        }
                                        className="flex items-center gap-4 px-5 py-4"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/10 text-sm font-semibold text-accent">
                                            {member.user
                                                .avatarUrl ? (
                                                <img
                                                    src={
                                                        member
                                                            .user
                                                            .avatarUrl
                                                    }
                                                    alt={
                                                        member
                                                            .user
                                                            .name
                                                    }
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                initial
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-text">
                                                {
                                                    member
                                                        .user
                                                        .name
                                                }
                                            </p>

                                            <p className="truncate text-xs text-text-secondary">
                                                {
                                                    member
                                                        .user
                                                        .email
                                                }
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-3">
                                            <span
                                                className={[
                                                    "rounded-full px-2.5 py-1 text-xs font-medium",
                                                    isOwner
                                                        ? "bg-accent/10 text-accent"
                                                        : "bg-surface-muted text-text-secondary",
                                                ].join(
                                                    " ",
                                                )}
                                            >
                                                {
                                                    member
                                                        .membership
                                                        .role
                                                }
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
            </div>
            <InviteMemberModal
                open={inviteModalOpen}
                onClose={() =>
                    setInviteModalOpen(false)
                }
            />
        </div>
    );
};

export default WorkspaceMembersPage;