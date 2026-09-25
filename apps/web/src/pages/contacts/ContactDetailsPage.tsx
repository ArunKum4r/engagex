import {
    ArrowLeft,
    CheckCircle2,
    Mail,
    MoreHorizontal,
    Phone,
    Plus,
    Tag,
    User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    getContact,
    type Contact,
} from "../../api/contact";
import {
    getAutomations,
    type Automation,
} from "../../api/automation";
import {
    getContactAutomationPauses,
    pauseContactAutomations,
    resumeContactAutomation,
    type ContactAutomationPause,
} from "../../api/contact-automation-pauses";
import { useWorkspaceStore } from "../../stores/workspace.store";

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "short",
            day: "numeric",
        },
    );
};

const ContactDetails = () => {
    const navigate = useNavigate();
    const { contactId } = useParams();

    const workspaceId = useWorkspaceStore(
        (state) => state.currentWorkspace?.workspace?.id,
    );

    const [contact, setContact] =
        useState<Contact | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [automations, setAutomations] =
        useState<Automation[]>([]);

    const [automationPauses, setAutomationPauses] =
        useState<ContactAutomationPause[]>([]);

    const [loadingAutomationControl, setLoadingAutomationControl] =
        useState(true);

    const [pauseForm, setPauseForm] = useState({
        open: false,
        automationId: "",
        reason: "",
        resumeAt: "",
    });

    useEffect(() => {
        if (!workspaceId || !contactId) {
            setLoading(false);
            return;
        }

        const loadContact = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getContact({
                    workspaceId,
                    contactId,
                });

                setContact(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load contact",
                );
            } finally {
                setLoading(false);
            }
        };

        loadContact();
    }, [workspaceId, contactId]);

    useEffect(() => {
        if (!workspaceId || !contactId) {
            return;
        }

        const loadAutomationControl = async () => {
            try {
                setLoadingAutomationControl(true);

                const [
                    workspaceAutomations,
                    pauses,
                ] = await Promise.all([
                    getAutomations(workspaceId),
                    getContactAutomationPauses({
                        workspaceId,
                        contactId,
                    }),
                ]);

                setAutomations(workspaceAutomations);
                setAutomationPauses(pauses);
            } catch (err) {
                console.error(
                    "Failed to load automation control:",
                    err,
                );
            } finally {
                setLoadingAutomationControl(false);
            }
        };

        loadAutomationControl();
    }, [workspaceId, contactId]);

    const handlePauseAutomation = async () => {
        if (!workspaceId || !contactId) {
            return;
        }

        if (!pauseForm.open) {
            return;
        }

        if (
            pauseForm.automationId === "" &&
            pauseForm.reason.trim() === "" &&
            pauseForm.resumeAt === ""
        ) {
            // Valid: pause all without additional options.
        }

        if (
            pauseForm.automationId &&
            !automations.some(
                (automation) =>
                    automation.id ===
                    pauseForm.automationId,
            )
        ) {
            return;
        }

        try {
            const pause =
                await pauseContactAutomations({
                    workspaceId,
                    contactId,
                    data: {
                        ...(pauseForm.automationId
                            ? {
                                automationId:
                                    pauseForm.automationId,
                            }
                            : {}),
                        ...(pauseForm.reason.trim()
                            ? {
                                reason:
                                    pauseForm.reason.trim(),
                            }
                            : {}),
                        ...(pauseForm.resumeAt
                            ? {
                                resumeAt:
                                    new Date(
                                        pauseForm.resumeAt,
                                    ).toISOString(),
                            }
                            : {}),
                    },
                });

            setAutomationPauses((current) => [
                ...current,
                pause,
            ]);

            setPauseForm({
                open: false,
                automationId: "",
                reason: "",
                resumeAt: "",
            });
        } catch (err) {
            console.error(
                "Failed to pause automation:",
                err,
            );
        }
    };

    const closePauseForm = () => {
        setPauseForm({
            open: false,
            automationId: "",
            reason: "",
            resumeAt: "",
        });
    };

    if (loading) {
        return (
            <div className="flex min-h-96 items-center justify-center">
                <p className="text-sm text-text-muted">
                    Loading contact...
                </p>
            </div>
        );
    }

    if (error || !contact) {
        return (
            <div className="flex min-h-96 flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-red-500">
                    {error ?? "Contact not found"}
                </p>

                <button
                    type="button"
                    onClick={() => navigate("/contacts")}
                    className="mt-3 text-sm font-medium text-accent hover:text-accent-hover"
                >
                    Back to contacts
                </button>
            </div>
        );
    }

    const identity = contact.identities[0];

    const displayName =
        contact.name ||
        identity?.displayName ||
        "No Name";

    const metadata =
        identity?.metadata ?? {};

    return (
        <div className="flex min-h-full flex-col">
            {/* Header */}
            <div className="shrink-0 border-b border-border pb-6">
                <button
                    type="button"
                    onClick={() => navigate("/contacts")}
                    className="mb-5 inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text"
                >
                    <ArrowLeft size={16} />
                    Contacts
                </button>

                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-4">
                        {contact.avatarUrl ? (
                            <img
                                src={contact.avatarUrl}
                                alt=""
                                className="h-16 w-16 shrink-0 rounded-full object-cover"
                            />
                        ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xl font-semibold text-accent">
                                {displayName
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                        )}

                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="truncate text-2xl font-semibold tracking-tight text-text">
                                    {displayName}
                                </h1>

                                {identity && (
                                    <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-text-secondary">
                                        Instagram
                                    </span>
                                )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-text-secondary">
                                {identity?.username && (
                                    <span>
                                        @{identity.username}
                                    </span>
                                )}

                                <span className="h-1 w-1 rounded-full bg-text-muted" />

                                <span>
                                    Contact since{" "}
                                    {formatDate(
                                        contact.createdAt,
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-surface-muted hover:text-text"
                    >
                        <MoreHorizontal size={19} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="grid gap-5 py-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                {/* Main */}
                <div className="min-w-0 space-y-5">
                    {/* Overview */}
                    <section className="rounded-lg border border-border bg-surface">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="text-sm font-semibold text-text">
                                Overview
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 divide-x divide-border sm:grid-cols-4">
                            <div className="p-5">
                                <p className="text-xs text-text-muted">
                                    Conversations
                                </p>

                                <p className="mt-1 text-xl font-semibold text-text">
                                    {contact.conversations?.length ?? 0}
                                </p>
                            </div>

                            <div className="p-5">
                                <p className="text-xs text-text-muted">
                                    Identities
                                </p>

                                <p className="mt-1 text-xl font-semibold text-text">
                                    {contact.identities?.length ?? 0}
                                </p>
                            </div>

                            <div className="border-t border-border p-5 sm:border-t-0">
                                <p className="text-xs text-text-muted">
                                    Tags
                                </p>

                                <p className="mt-1 text-xl font-semibold text-text">
                                    0
                                </p>
                            </div>

                            <div className="border-t border-border p-5 sm:border-t-0">
                                <p className="text-xs text-text-muted">
                                    Status
                                </p>

                                <p className="mt-1 text-sm font-semibold text-text">
                                    Active
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Contact information */}
                    <section className="rounded-lg border border-border bg-surface">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="text-sm font-semibold text-text">
                                Contact information
                            </h2>
                        </div>

                        <div className="grid gap-5 p-5 sm:grid-cols-2">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted">
                                    <Mail
                                        size={16}
                                        className="text-text-muted"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-text-muted">
                                        Email
                                    </p>

                                    <p className="mt-0.5 truncate text-sm text-text">
                                        {contact.email ?? "—"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-muted">
                                    <Phone
                                        size={16}
                                        className="text-text-muted"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-xs text-text-muted">
                                        Phone
                                    </p>

                                    <p className="mt-0.5 truncate text-sm text-text">
                                        {contact.phone ?? "—"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tags */}
                    <section className="rounded-lg border border-border bg-surface">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                                <Tag size={15} />
                                Tags
                            </h2>

                            <button
                                type="button"
                                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
                            >
                                <Plus size={14} />
                                Add
                            </button>
                        </div>

                        <div className="p-5">
                            <p className="text-sm text-text-muted">
                                No tags added yet.
                            </p>
                        </div>
                    </section>

                    {/* Notes */}
                    <section className="rounded-lg border border-border bg-surface">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-text">
                                <User size={15} />
                                Notes
                            </h2>
                        </div>

                        <div className="p-5">
                            <p className="whitespace-pre-wrap text-sm leading-6 text-text-secondary">
                                {contact.notes ||
                                    "No notes added."}
                            </p>
                        </div>
                    </section>

                    {/* Activity */}
                    <section className="rounded-lg border border-border bg-surface">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="text-sm font-semibold text-text">
                                Activity
                            </h2>
                        </div>

                        <div className="flex min-h-32 items-center justify-center p-5">
                            <p className="text-sm text-text-muted">
                                Contact activity will appear here.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="min-w-0 space-y-5">
                    {/* Instagram */}
                    {identity && (
                        <section className="rounded-lg border border-border bg-surface">
                            <div className="border-b border-border px-5 py-4">
                                <h2 className="text-sm font-semibold text-text">
                                    Instagram
                                </h2>
                            </div>

                            <div className="space-y-4 p-5">
                                <div>
                                    <p className="text-xs text-text-muted">
                                        Username
                                    </p>

                                    <p className="mt-1 text-sm font-medium text-text">
                                        {identity.username
                                            ? `@${identity.username}`
                                            : "—"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="rounded-md bg-surface-muted p-3">
                                        <p className="text-xs text-text-muted">
                                            Followers
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-text">
                                            {typeof metadata.followerCount ===
                                            "number"
                                                ? metadata.followerCount.toLocaleString()
                                                : "—"}
                                        </p>
                                    </div>

                                    <div className="rounded-md bg-surface-muted p-3">
                                        <p className="text-xs text-text-muted">
                                            Verified
                                        </p>

                                        <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-text">
                                            {metadata.isVerifiedUser ? (
                                                <>
                                                    <CheckCircle2
                                                        size={14}
                                                        className="text-accent"
                                                    />
                                                    Yes
                                                </>
                                            ) : (
                                                "No"
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-text-muted">
                                            Follows you
                                        </span>

                                        <span className="font-medium text-text">
                                            {metadata.isBusinessFollowUser
                                                ? "Yes"
                                                : "No"}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-text-muted">
                                            You follow
                                        </span>

                                        <span className="font-medium text-text">
                                            {metadata.isUserFollowBusiness
                                                ? "Yes"
                                                : "No"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Automation Control */}
                    <section className="rounded-lg border border-border bg-surface">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="text-sm font-semibold text-text">
                                Automation control
                            </h2>
                        </div>

                        <div className="p-5">
                            {loadingAutomationControl ? (
                                <p className="text-sm text-text-muted">
                                    Loading automation settings...
                                </p>
                            ) : automationPauses.length === 0 ? (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-green-500" />

                                        <span className="text-sm font-medium text-text">
                                            Automations active
                                        </span>
                                    </div>

                                    <p className="mt-2 text-sm leading-5 text-text-muted">
                                        All automations are currently allowed to run for this contact.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPauseForm({
                                                open: true,
                                                automationId: "",
                                                reason: "",
                                                resumeAt: "",
                                            })
                                        }
                                        className="mt-4 w-full rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:bg-surface-muted"
                                    >
                                        Pause automations
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-amber-500" />

                                        <span className="text-sm font-medium text-text">
                                            Automations paused
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                        {automationPauses.map(
                                            (pause) => {
                                                const automation =
                                                    automations.find(
                                                        (item) =>
                                                            item.id ===
                                                            pause.automationId,
                                                    );

                                                return (
                                                    <div
                                                        key={
                                                            pause.id
                                                        }
                                                        className="rounded-md bg-surface-muted p-3"
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-medium text-text">
                                                                    {pause.automationId
                                                                        ? automation?.name ??
                                                                          "Automation"
                                                                        : "All automations"}
                                                                </p>

                                                                {pause.reason && (
                                                                    <p className="mt-1 text-xs text-text-muted">
                                                                        {
                                                                            pause.reason
                                                                        }
                                                                    </p>
                                                                )}

                                                                {pause.resumeAt && (
                                                                    <p className="mt-1 text-xs text-text-muted">
                                                                        Until{" "}
                                                                        {new Date(
                                                                            pause.resumeAt,
                                                                        ).toLocaleString()}
                                                                    </p>
                                                                )}
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    if (
                                                                        !workspaceId ||
                                                                        !contactId
                                                                    ) {
                                                                        return;
                                                                    }

                                                                    try {
                                                                        await resumeContactAutomation(
                                                                            {
                                                                                workspaceId,
                                                                                contactId,
                                                                                automationId:
                                                                                    pause.automationId ??
                                                                                    undefined,
                                                                            },
                                                                        );

                                                                        setAutomationPauses(
                                                                            (
                                                                                current,
                                                                            ) =>
                                                                                current.filter(
                                                                                    (
                                                                                        item,
                                                                                    ) =>
                                                                                        item.id !==
                                                                                        pause.id,
                                                                                ),
                                                                        );
                                                                    } catch (
                                                                        err
                                                                    ) {
                                                                        console.error(
                                                                            "Failed to resume automation:",
                                                                            err,
                                                                        );
                                                                    }
                                                                }}
                                                                className="shrink-0 text-xs font-medium text-accent hover:text-accent-hover"
                                                            >
                                                                Resume
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPauseForm({
                                                open: true,
                                                automationId: "",
                                                reason: "",
                                                resumeAt: "",
                                            })
                                        }
                                        className="mt-4 w-full rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:bg-surface-muted"
                                    >
                                        Add pause
                                    </button>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Reminders */}
                    <section className="rounded-lg border border-border bg-surface">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div>
                                <h2 className="text-sm font-semibold text-text">
                                    Reminders
                                </h2>

                                <p className="mt-0.5 text-xs text-text-muted">
                                    Follow-ups for this contact
                                </p>
                            </div>

                            <button
                                type="button"
                                className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent-hover"
                            >
                                <Plus size={14} />
                                Add
                            </button>
                        </div>

                        <div className="p-5">
                            <p className="text-sm text-text-muted">
                                No reminders yet.
                            </p>
                        </div>
                    </section>
                </div>
            </div>

            {/* Pause Automation Modal */}
            {pauseForm.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-lg border border-border bg-surface shadow-xl">
                        <div className="border-b border-border px-5 py-4">
                            <h2 className="text-sm font-semibold text-text">
                                Pause automations
                            </h2>

                            <p className="mt-1 text-xs text-text-muted">
                                Prevent automations from running for this contact.
                            </p>
                        </div>

                        <div className="space-y-5 p-5">
                            <div>
                                <label className="mb-2 block text-xs font-medium text-text">
                                    Automation
                                </label>

                                <select
                                    value={
                                        pauseForm.automationId
                                    }
                                    onChange={(event) =>
                                        setPauseForm(
                                            (current) => ({
                                                ...current,
                                                automationId:
                                                    event.target
                                                        .value,
                                            }),
                                        )
                                    }
                                    className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text outline-none focus:border-accent"
                                >
                                    <option value="">
                                        All automations
                                    </option>

                                    {automations
                                        .filter(
                                            (
                                                automation,
                                            ) =>
                                                automation.status ===
                                                "ACTIVE",
                                        )
                                        .map(
                                            (
                                                automation,
                                            ) => (
                                                <option
                                                    key={
                                                        automation.id
                                                    }
                                                    value={
                                                        automation.id
                                                    }
                                                >
                                                    {
                                                        automation.name
                                                    }
                                                </option>
                                            ),
                                        )}
                                </select>

                                <p className="mt-1 text-xs text-text-muted">
                                    Leave as All automations to pause everything for this contact.
                                </p>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-text">
                                    Reason
                                    <span className="ml-1 font-normal text-text-muted">
                                        optional
                                    </span>
                                </label>

                                <textarea
                                    value={
                                        pauseForm.reason
                                    }
                                    onChange={(event) =>
                                        setPauseForm(
                                            (current) => ({
                                                ...current,
                                                reason:
                                                    event
                                                        .target
                                                        .value,
                                            }),
                                        )
                                    }
                                    rows={3}
                                    placeholder="Why are you pausing automations?"
                                    className="w-full resize-none rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none placeholder:text-text-muted focus:border-accent"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-text">
                                    Resume automatically
                                    <span className="ml-1 font-normal text-text-muted">
                                        optional
                                    </span>
                                </label>

                                <input
                                    type="datetime-local"
                                    value={
                                        pauseForm.resumeAt
                                    }
                                    onChange={(event) =>
                                        setPauseForm(
                                            (current) => ({
                                                ...current,
                                                resumeAt:
                                                    event
                                                        .target
                                                        .value,
                                            }),
                                        )
                                    }
                                    min={new Date()
                                        .toISOString()
                                        .slice(0, 16)}
                                    className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-text outline-none focus:border-accent"
                                />

                                <p className="mt-1 text-xs text-text-muted">
                                    Leave empty to keep the pause active until manually resumed.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-border px-5 py-4">
                            <button
                                type="button"
                                onClick={closePauseForm}
                                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-muted"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handlePauseAutomation
                                }
                                className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
                            >
                                Pause automations
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContactDetails;