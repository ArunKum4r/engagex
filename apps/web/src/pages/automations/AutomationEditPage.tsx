import {
    ArrowLeft,
    Check,
} from "lucide-react";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import AutomationBuilder from "../../components/automations/AutomationBuilder";
import { useWorkspaceStore } from "../../stores/workspace.store";

const AutomationEditPage = () => {
    const navigate = useNavigate();

    const { automationId } =
        useParams<{
            automationId: string;
        }>();

    const currentWorkspace =
        useWorkspaceStore(
            (state) =>
                state.currentWorkspace,
        );

    const workspaceId =
        currentWorkspace?.workspace.id;

    if (
        !workspaceId ||
        !automationId
    ) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <p className="text-sm text-danger">
                    Automation information is missing.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                `/automations/${automationId}`,
                            )
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
                        aria-label="Back to automation"
                    >
                        <ArrowLeft
                            size={18}
                        />
                    </button>

                    <div className="min-w-0">
                        <p className="text-xs text-text-secondary">
                            Automation
                        </p>

                        <h1 className="truncate text-xl font-semibold text-text">
                            Edit workflow
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-text-secondary">
                    <Check
                        size={14}
                        className="text-success"
                    />
                    Auto-save
                </div>
            </div>

            <AutomationBuilder
                workspaceId={
                    workspaceId
                }
                automationId={
                    automationId
                }
                editable
            />
        </div>
    );
};

export default AutomationEditPage;