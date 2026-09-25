import {
    Search,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
    getContacts,
    type Contact,
} from "../../api/contact.js";
import { useWorkspaceStore } from "../../stores/workspace.store.js";
import { useNavigate } from "react-router-dom";

const Contacts = () => {
    const workspaceId = useWorkspaceStore((state) => state.currentWorkspace?.workspace?.id);

    const [contacts, setContacts] = useState<Contact[]>(
        [],
    );

    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(
        null,
    );
    const navigate = useNavigate();

    const fetchContacts = async () => {
        if (!workspaceId) {
            setContacts([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const data = await getContacts({
                workspaceId,
                search,
            });

            setContacts(data.items);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load contacts",
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [search, workspaceId]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-text">
                    Contacts
                </h1>

                <p className="mt-1 text-sm text-text-secondary">
                    People who interact with your connected
                    accounts
                </p>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-sm">
                    <Search
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search contacts..."
                        className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-accent"
                    />
                </div>

                <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
                >
                    <Users size={16} />
                    Add contact
                </button>
            </div>

            {/* Content */}
            <div className="overflow-hidden rounded-lg border border-border bg-surface">
                {loading ? (
                    <div className="flex min-h-64 items-center justify-center">
                        <p className="text-sm text-text-muted">
                            Loading contacts...
                        </p>
                    </div>
                ) : error ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                        <p className="text-sm font-medium text-red-500">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchContacts}
                            className="mt-3 text-sm font-medium text-accent hover:text-accent-hover"
                        >
                            Try again
                        </button>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted">
                            <Users
                                size={22}
                                className="text-text-muted"
                            />
                        </div>

                        <h2 className="mt-4 text-sm font-semibold text-text">
                            {search
                                ? "No contacts found"
                                : "No contacts yet"}
                        </h2>

                        <p className="mt-1 max-w-sm text-sm text-text-muted">
                            {search
                                ? "Try a different search term."
                                : "Contacts will appear here when people interact with your connected platforms."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className="border-b border-border bg-surface-muted/50">
                                    <th className="px-5 py-3 text-left text-xs font-medium text-text-muted">
                                        Contact
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-medium text-text-muted">
                                        Platform
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-medium text-text-muted">
                                        Followers
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-medium text-text-muted">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-medium text-text-muted">
                                        Last updated
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {contacts.map(
                                    (contact) => {
                                        const identity =
                                            contact.identities[0];

                                        const displayName =
                                            contact.name ||
                                            identity?.displayName ||
                                            "No Name";

                                        const followerCount =
                                            identity?.metadata
                                                ?.followerCount;

                                        const isVerified =
                                            identity?.metadata
                                                ?.isVerifiedUser;

                                        return (
                                            <tr
                                                key={
                                                    contact.id
                                                }
                                                onClick={()=> navigate(`/contacts/${contact.id}`)}
                                                className="border-b border-border last:border-0 transition-colors hover:bg-surface-muted/40"
                                            >
                                                {/* Contact */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {contact.avatarUrl ? (
                                                            <img
                                                                src={
                                                                    contact.avatarUrl
                                                                }
                                                                alt=""
                                                                className="h-9 w-9 shrink-0 rounded-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                                                                {displayName
                                                                    .charAt(
                                                                        0,
                                                                    )
                                                                    .toUpperCase()}
                                                            </div>
                                                        )}

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-medium text-text">
                                                                {
                                                                    displayName
                                                                }
                                                            </p>

                                                            {identity?.username && (
                                                                <p className="mt-0.5 truncate text-xs text-text-muted">
                                                                    @
                                                                    {
                                                                        identity.username
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Platform */}
                                                <td className="px-5 py-4">
                                                    {identity ? (
                                                        <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                                                            Instagram
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-text-muted">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Followers */}
                                                <td className="px-5 py-4">
                                                    {typeof followerCount ===
                                                    "number" ? (
                                                        <span className="text-sm text-text-secondary">
                                                            {followerCount.toLocaleString()}
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-text-muted">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-5 py-4">
                                                    {isVerified ? (
                                                        <span className="inline-flex items-center rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
                                                            Verified
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-text-muted">
                                                            —
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Updated */}
                                                <td className="px-5 py-4 text-sm text-text-secondary">
                                                    {new Date(
                                                        contact.updatedAt,
                                                    ).toLocaleDateString(
                                                        undefined,
                                                        {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        },
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    },
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary */}
            {!loading && !error && (
                <div className="text-sm text-text-muted">
                    {contacts.length === 1
                        ? "1 contact"
                        : `${contacts.length} contacts`}
                </div>
            )}
        </div>
    );
};

export default Contacts;