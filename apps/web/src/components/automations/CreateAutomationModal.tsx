import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";

import {
    createAutomation,
} from "../../api/automation";

import {
    getPlatformAccounts,
} from "../../api/integrations";

import {
    queryKeys,
} from "../../lib/query-keys";

import {
    useWorkspaceStore,
} from "../../stores/workspace.store";

interface CreateAutomationModalProps {
    open: boolean;
    onClose: () => void;
}

const CreateAutomationModal = ({
    open,
    onClose,
}: CreateAutomationModalProps) => {
    const queryClient = useQueryClient();

    const currentWorkspace = useWorkspaceStore(
        (state) => state.currentWorkspace,
    );

    const workspaceId =
        currentWorkspace?.workspace.id;

    const [name, setName] = useState("");
    const [description, setDescription] =
        useState("");
    const [platformAccountId, setPlatformAccountId] =
        useState("");

    const {
        data: platformAccounts = [],
        isLoading: isLoadingAccounts,
    } = useQuery({
        queryKey: workspaceId
            ? queryKeys.integrations.all(workspaceId)
            : ["integrations", "none"],
        queryFn: () =>
            getPlatformAccounts(
                workspaceId as string,
            ),
        enabled:
            open && Boolean(workspaceId),
    });

    const createMutation = useMutation({
        mutationFn: createAutomation,

        onSuccess: async () => {
            if (workspaceId) {
                await queryClient.invalidateQueries({
                    queryKey:
                        queryKeys.automations.all(
                            workspaceId,
                        ),
                });
            }

            setName("");
            setDescription("");
            setPlatformAccountId("");

            onClose();
        },
    });

    useEffect(() => {
        if (!open) {
            return;
        }

        setName("");
        setDescription("");
        setPlatformAccountId("");
    }, [open]);

    const handleSubmit = (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!workspaceId) {
            return;
        }

        createMutation.mutate({
            workspaceId,
            name: name.trim(),
            description:
                description.trim() || undefined,
            platformAccountId:
                platformAccountId || undefined,
        });
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Create automation"
            description="Create an automation and connect it to a platform account."
        >
            {createMutation.error instanceof Error && (
                <div className="mb-5 rounded-md border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">
                    {createMutation.error.message}
                </div>
            )}

            {!workspaceId && (
                <div className="rounded-md border border-warning/20 bg-warning/10 px-3 py-2.5 text-sm text-warning">
                    Select a workspace before creating
                    an automation.
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >
                <Input
                    id="automation-name"
                    label="Automation name"
                    placeholder="Instagram Price Inquiry"
                    value={name}
                    onChange={(event) =>
                        setName(event.target.value)
                    }
                    autoFocus
                    required
                    disabled={
                        createMutation.isPending
                    }
                />

                <div className="space-y-1.5">
                    <label
                        htmlFor="automation-description"
                        className="text-sm font-medium text-text"
                    >
                        Description
                        <span className="ml-1 font-normal text-text-muted">
                            Optional
                        </span>
                    </label>

                    <textarea
                        id="automation-description"
                        value={description}
                        onChange={(event) =>
                            setDescription(
                                event.target.value,
                            )
                        }
                        placeholder="Send pricing information when someone asks about price"
                        rows={4}
                        disabled={
                            createMutation.isPending
                        }
                        className="w-full resize-none rounded-md border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition-colors placeholder:text-text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="platform-account"
                        className="text-sm font-medium text-text"
                    >
                        Platform account
                        <span className="ml-1 font-normal text-text-muted">
                            Optional
                        </span>
                    </label>

                    <select
                        id="platform-account"
                        value={platformAccountId}
                        onChange={(event) =>
                            setPlatformAccountId(
                                event.target.value,
                            )
                        }
                        disabled={
                            createMutation.isPending ||
                            isLoadingAccounts ||
                            !workspaceId
                        }
                        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">
                            {isLoadingAccounts
                                ? "Loading accounts..."
                                : platformAccounts.length ===
                                    0
                                  ? "No connected accounts"
                                  : "Select a platform account"}
                        </option>

                        {platformAccounts.map(
                            (account) => (
                                <option
                                    key={account.id}
                                    value={account.id}
                                >
                                    {account.name ||
                                        account.username ||
                                        account.externalAccountId}{" "}
                                    —{" "}
                                    {account.platform}
                                </option>
                            ),
                        )}
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={
                            createMutation.isPending
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        loading={
                            createMutation.isPending
                        }
                        disabled={
                            !workspaceId ||
                            !name.trim()
                        }
                    >
                        Create automation
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateAutomationModal;