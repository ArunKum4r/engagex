import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import { contactIdentities } from "../schema/contact-identities.js";

export async function findContactIdentity(
    platformAccountId: string,
    externalId: string,
) {
    const result = await db.select()
        .from(contactIdentities)
        .where(and(
            eq(contactIdentities.platformAccountId, platformAccountId),
            eq(contactIdentities.externalId, externalId),
        ))
        .limit(1);

    return result[0] ?? null;
}

export async function createContactIdentity(data: {
    workspaceId: string;
    contactId: string;
    platformAccountId: string;
    externalId: string;
    username?: string | null;
    displayName?: string | null;
    metadata?: Record<string, unknown>;
}) {
    const result = await db.insert(contactIdentities).values({
        workspaceId: data.workspaceId,
        contactId: data.contactId,
        platformAccountId: data.platformAccountId,
        externalId: data.externalId,
        username: data.username ?? null,
        displayName: data.displayName ?? null,
        metadata: data.metadata ?? {},
    }).returning();

    return result[0] ?? null;
}

export async function updateContactIdentity(
    identityId: string,
    data: {
        username?: string | null;
        displayName?: string | null;
        metadata?: Record<string, unknown>;
    },
) {
    const result = await db.update(contactIdentities)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(contactIdentities.id, identityId))
        .returning();

    return result[0] ?? null;
}

export async function findContactIdentityByContact(
    platformAccountId: string,
    contactId: string,
) {
    const result = await db.select()
        .from(contactIdentities)
        .where(and(
            eq(
                contactIdentities.platformAccountId,
                platformAccountId,
            ),
            eq(
                contactIdentities.contactId,
                contactId,
            ),
        ))
        .limit(1);

    return result[0] ?? null;
}