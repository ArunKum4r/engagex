import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    createWorkspace,
    getWorkspaces,
    updateWorkspace,
} from "../../api/workspace";

import { queryKeys } from "../../lib/query-keys";
import { useWorkspaceStore } from "../../stores/workspace.store";
import { useToast } from "../ui/Toast";

import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";

interface WorkspaceFormModalProps {
    open: boolean;
    onClose: () => void;
    mode?: "create" | "edit";
    workspace?: {
        id: string;
        name: string;
        slug: string;
    };
}

const WorkspaceFormModal = ({
    open,
    onClose,
    mode = "create",
    workspace,
}: WorkspaceFormModalProps) => {
    const queryClient = useQueryClient();
    const toast = useToast();

    const setCurrentWorkspace = useWorkspaceStore(
        (state) => state.setCurrentWorkspace,
    );

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");

    const isEditMode = mode === "edit";

    const createMutation = useMutation({
        mutationFn: createWorkspace,

        onSuccess: async (createdWorkspace) => {
            const workspaces =
                await queryClient.fetchQuery({
                    queryKey:
                        queryKeys.workspaces.all,
                    queryFn: getWorkspaces,
                });

            const selectedWorkspace =
                workspaces.find(
                    (item) =>
                        item.workspace.id ===
                        createdWorkspace.id,
                );

            if (selectedWorkspace) {
                setCurrentWorkspace(
                    selectedWorkspace,
                );
            }

            toast(
                "Workspace created successfully",
                "success",
            );

            setName("");
            setSlug("");

            onClose();
        },
    });

    const updateMutation = useMutation({
        mutationFn: updateWorkspace,

        onSuccess: async () => {
            const workspaces =
                await queryClient.fetchQuery({
                    queryKey:
                        queryKeys.workspaces.all,
                    queryFn: getWorkspaces,
                });

            const updatedWorkspace =
                workspaces.find(
                    (item) =>
                        item.workspace.id ===
                        workspace?.id,
                );

            if (updatedWorkspace) {
                setCurrentWorkspace(
                    updatedWorkspace,
                );
            }

            toast(
                "Workspace updated successfully",
                "success",
            );

            onClose();
        },
    });

    useEffect(() => {

        if (isEditMode && workspace) {
            setName(workspace.name);
            setSlug(workspace.slug);
            return;
        }

        setName("");
        setSlug("");
    }, [
        open,
        isEditMode,
        workspace,
    ]);

    const handleNameChange = (
        value: string,
    ) => {
        setName(value);

        if (isEditMode) {
            return;
        }

        const generatedSlug = value
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        setSlug(generatedSlug);
    };

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

       if (isEditMode) {
            if (!workspace) {
                return;
            }

            updateMutation.mutate({
                workspaceId: workspace.id,
                payload: {
                    name: name.trim(),
                },
            });

            return;
        }

        createMutation.mutate({
            name: name.trim(),
            slug: slug.trim(),
        });
    };

    const isPending = createMutation.isPending || updateMutation.isPending;
    const mutationError = createMutation.error || updateMutation.error

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={
                isEditMode
                    ? "Edit workspace"
                    : "Create workspace"
            }
            description={
                isEditMode
                    ? "Update your workspace details."
                    : "Create a workspace to organize your automations and integrations."
            }
        >
            {mutationError instanceof Error && (
                <div className="mb-5 rounded-md border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                    {mutationError.message}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <Input
                    id="workspace-name"
                    label="Workspace name"
                    placeholder="Acme Corporation"
                    value={name}
                    onChange={(event) =>
                        handleNameChange(
                            event.target.value,
                        )
                    }
                    autoFocus
                    required
                    disabled={isPending}
                />

                <Input
                    id="workspace-slug"
                    label="Workspace slug"
                    placeholder="acme-corporation"
                    hint={
                        isEditMode
                            ? "Workspace slugs cannot be changed here."
                            : "Used in URLs and should be unique."
                    }
                    value={slug}
                    onChange={(event) =>
                        setSlug(
                            event.target.value
                                .toLowerCase()
                                .replace(
                                    /[^a-z0-9-]/g,
                                    "-",
                                ),
                        )
                    }
                    required
                    disabled={
                        isPending ||
                        isEditMode
                    }
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        loading={isPending}
                        disabled={
                            !name.trim() ||
                            !slug.trim()
                        }
                    >
                        {isEditMode
                            ? "Save changes"
                            : "Create workspace"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default WorkspaceFormModal;