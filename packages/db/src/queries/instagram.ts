import { and, eq } from "drizzle-orm";
import { contactIdentities } from "../schema/contact-identities.js";
import { contacts } from "../schema/contacts.js";
import { db } from "../client.js";

export function validateInstagramPlatformAccount(
    account: {
        platform: string;
        credentials: unknown;
        metadata: unknown;
    },
) {
    const errors: string[] = [];

    if (account.platform !== "INSTAGRAM") {
        errors.push(
            "Connected platform account is not an Instagram account.",
        );

        return errors;
    }

    if (
        !account.credentials ||
        typeof account.credentials !== "object" ||
        Array.isArray(account.credentials)
    ) {
        errors.push(
            "Instagram account credentials are missing.",
        );
    } else {
        const credentials =
            account.credentials as Record<
                string,
                unknown
            >;

        if (
            typeof credentials.accessToken !==
                "string" ||
            credentials.accessToken.length === 0
        ) {
            errors.push(
                "Instagram access token is missing.",
            );
        }

        if (
            typeof credentials.obtainedAt !==
                "string" ||
            credentials.obtainedAt.length === 0
        ) {
            errors.push(
                "Instagram token timestamp is missing.",
            );
        }

        if (
            typeof credentials.expiresIn ===
                "number" &&
            typeof credentials.obtainedAt ===
                "string"
        ) {
            const obtainedAt =
                new Date(
                    credentials.obtainedAt,
                );

            if (
                Number.isNaN(
                    obtainedAt.getTime(),
                )
            ) {
                errors.push(
                    "Instagram token timestamp is invalid.",
                );
            } else {
                const expiresAt =
                    obtainedAt.getTime() +
                    credentials.expiresIn *
                        1000;

                if (
                    Date.now() >=
                    expiresAt
                ) {
                    errors.push(
                        "Instagram access token has expired.",
                    );
                }
            }
        }
    }

    if (
        !account.metadata ||
        typeof account.metadata !== "object" ||
        Array.isArray(account.metadata)
    ) {
        errors.push(
            "Instagram account metadata is missing.",
        );
    } else {
        const metadata =
            account.metadata as Record<
                string,
                unknown
            >;

        if (
            typeof metadata.instagramAppScopedId !==
                "string" ||
            metadata.instagramAppScopedId.length ===
                0
        ) {
            errors.push(
                "Instagram app-scoped account ID is missing.",
            );
        }
    }

    return errors;
}

export async function resolveInstagramContact(data: {
    workspaceId: string;
    platformAccountId: string;
    externalUserId: string;
    profile?: {
        username?: string | null;
        name?: string | null;
        profilePic?: string | null;
        isVerifiedUser?: boolean;
        followerCount?: number | null;
        isUserFollowBusiness?: boolean | null;
        isBusinessFollowUser?: boolean | null;
    } | null;
}) {
    return db.transaction(async (tx) => {
        let identity = await tx.select()
            .from(contactIdentities)
            .where(and(
                eq(contactIdentities.platformAccountId, data.platformAccountId),
                eq(contactIdentities.externalId, data.externalUserId),
            ))
            .limit(1)
            .then((result) => result[0] ?? null);

        let contact: any;

        if (identity) {
            contact = await tx.select()
                .from(contacts)
                .where(eq(contacts.id, identity.contactId))
                .limit(1)
                .then((result) => result[0] ?? null);

            if (!contact) {
                throw new Error(
                    `Contact not found for identity: ${identity.id}`,
                );
            }

            if (
                data.profile?.name ||
                data.profile?.profilePic
            ) {
                contact = await tx.update(contacts)
                    .set({
                        name: data.profile.name ?? contact.name,
                        avatarUrl: data.profile.profilePic ?? contact.avatarUrl,
                        updatedAt: new Date(),
                    })
                    .where(eq(contacts.id, contact.id))
                    .returning()
                    .then((result) => result[0] ?? contact);
            }

            identity = await tx.update(contactIdentities)
                .set({
                    username: data.profile?.username ?? identity.username,
                    displayName: data.profile?.name ?? identity.displayName,
                    metadata: {
                        ...(identity.metadata ?? {}),
                        ...(data.profile
                            ? {
                                isVerifiedUser: data.profile.isVerifiedUser,
                                followerCount: data.profile.followerCount,
                                isUserFollowBusiness:
                                    data.profile.isUserFollowBusiness,
                                isBusinessFollowUser:
                                    data.profile.isBusinessFollowUser,
                            }
                            : {}),
                    },
                    updatedAt: new Date(),
                })
                .where(eq(contactIdentities.id, identity.id))
                .returning()
                .then((result) => result[0] ?? identity);
        } else {
            contact = await tx.insert(contacts)
                .values({
                    workspaceId: data.workspaceId,
                    name: data.profile?.name ?? data.profile?.username ?? null,
                    avatarUrl: data.profile?.profilePic ?? null,
                })
                .returning()
                .then((result) => result[0] ?? null);

            if (!contact) {
                throw new Error("Failed to create Instagram contact");
            }

            identity = await tx.insert(contactIdentities)
                .values({
                    workspaceId: data.workspaceId,
                    contactId: contact.id,
                    platformAccountId: data.platformAccountId,
                    externalId: data.externalUserId,
                    username: data.profile?.username ?? null,
                    displayName: data.profile?.name ?? null,
                    metadata: {
                        isVerifiedUser: data.profile?.isVerifiedUser ?? false,
                        followerCount: data.profile?.followerCount ?? null,
                        isUserFollowBusiness:
                            data.profile?.isUserFollowBusiness ?? null,
                        isBusinessFollowUser:
                            data.profile?.isBusinessFollowUser ?? null,
                    },
                })
                .returning()
                .then((result) => result[0] ?? null);

            if (!identity) {
                throw new Error(
                    "Failed to create Instagram contact identity",
                );
            }
        }

        return {
            contact,
            identity,
        };
    });
}