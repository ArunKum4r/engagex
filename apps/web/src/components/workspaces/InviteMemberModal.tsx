import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import {
    createWorkspaceInvitation,
} from "../../api/workspace";

import {
    useWorkspaceStore,
} from "../../stores/workspace.store";

import { useToast } from "../ui/Toast";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

interface InviteMemberModalProps {
    open: boolean;
    onClose: () => void;
}

type MemberRole = "MEMBER" | "ADMIN";

const InviteMemberModal = ({
    open,
    onClose,
}: InviteMemberModalProps) => {
    const toast = useToast();

    const currentWorkspace = useWorkspaceStore(
        (state) => state.currentWorkspace,
    );

    const workspaceId =
        currentWorkspace?.workspace.id;

    const [email, setEmail] = useState("");
    const [role, setRole] =
        useState<MemberRole>("MEMBER");

    const inviteMutation = useMutation({
        mutationFn: createWorkspaceInvitation,

        onSuccess: () => {
            toast(
                "Invitation created successfully",
                "success",
            );

            setEmail("");
            setRole("MEMBER");

            onClose();
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        setEmail("");
        setRole("MEMBER");
    }, [open]);

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!workspaceId) {
            return;
        }

        inviteMutation.mutate({
            workspaceId,
            payload: {
                email: email.trim().toLowerCase(),
                role,
            },
        });
    };

    const mutationError =
        inviteMutation.error;

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Invite member"
            description="Invite someone to join this workspace."
        >
            {mutationError instanceof Error && (
                <div className="mb-5 rounded-md border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                    {mutationError.message}
                </div>
            )}

            {!workspaceId && (
                <div className="mb-5 rounded-md border border-warning/20 bg-warning/10 px-3 py-2.5 text-sm text-warning">
                    Select a workspace before inviting a
                    member.
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <Input
                    id="member-email"
                    label="Email address"
                    type="email"
                    placeholder="member@example.com"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    autoFocus
                    required
                    disabled={
                        inviteMutation.isPending
                    }
                />

                <div className="space-y-1.5">
                    <label
                        htmlFor="member-role"
                        className="text-sm font-medium text-text"
                    >
                        Role
                    </label>

                    <select
                        id="member-role"
                        value={role}
                        onChange={(event) =>
                            setRole(
                                event.target
                                    .value as MemberRole,
                            )
                        }
                        disabled={
                            inviteMutation.isPending
                        }
                        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="MEMBER">
                            Member
                        </option>

                        <option value="ADMIN">
                            Admin
                        </option>
                    </select>

                    <p className="text-xs text-text-muted">
                        Admins can manage workspace
                        settings and members.
                    </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={
                            inviteMutation.isPending
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        loading={
                            inviteMutation.isPending
                        }
                        disabled={
                            !email.trim() ||
                            !workspaceId
                        }
                    >
                        Send invitation
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default InviteMemberModal;