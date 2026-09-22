import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import { contacts } from "../schema/contacts.js";

export async function createContact(data: {
    workspaceId: string;
    name?: string | null;
    avatarUrl?: string | null;
}) {
    const result = await db.insert(contacts).values({
        workspaceId: data.workspaceId,
        name: data.name ?? null,
        avatarUrl: data.avatarUrl ?? null,
    }).returning();

    return result[0] ?? null;
}

export async function findContactById(contactId: string) {
    const result = await db.select()
        .from(contacts)
        .where(eq(contacts.id, contactId))
        .limit(1);

    return result[0] ?? null;
}

export async function updateContact(
    contactId: string,
    data: {
        name?: string | null;
        avatarUrl?: string | null;
    },
) {
    const result = await db.update(contacts)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(contacts.id, contactId))
        .returning();

    return result[0] ?? null;
}