import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

import { db } from "../client.js";
import { contacts } from "../schema/contacts.js";
import { contactIdentities } from "../schema/contact-identities.js";
import { findConversationMessages, findConversationsByContact } from "./conversations.js";

export async function listContacts(
    workspaceId: string,
    options: {
        page?: number;
        limit?: number;
        search?: string;
    } = {},
) {
    const page = Math.max(options.page ?? 1, 1);
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const offset = (page - 1) * limit;

    const conditions = [
        eq(contacts.workspaceId, workspaceId),
    ];

    if (options.search?.trim()) {
        const search = `%${options.search.trim()}%`;

        conditions.push(
            or(
                ilike(contacts.name, search),
                ilike(contacts.email, search),
                ilike(contacts.phone, search),
            )!,
        );
    }

    const [items, countResult] = await Promise.all([
        db.select()
            .from(contacts)
            .where(and(...conditions))
            .orderBy(desc(contacts.updatedAt))
            .limit(limit)
            .offset(offset),

        db.select({
            count: sql<number>`count(*)`,
        })
            .from(contacts)
            .where(and(...conditions)),
    ]);

    const contactIds = items.map((contact) => contact.id);

    const identities = contactIds.length
        ? await db.select()
            .from(contactIdentities)
            .where(
                inArray(contactIdentities.contactId, contactIds),
            )
        : [];

    const identitiesByContact = new Map<string, typeof identities>();

    for (const identity of identities) {
        const existing =
            identitiesByContact.get(identity.contactId) ?? [];

        existing.push(identity);
        identitiesByContact.set(
            identity.contactId,
            existing
        );
    }

    const contactsWithIdentities = items.map((contact) => ({
        ...contact,
        identities:
            identitiesByContact.get(contact.id) ?? [],
    }));

    const total = Number(countResult[0]?.count ?? 0);

    return {
        items: contactsWithIdentities,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
}

export async function findContactById(
    workspaceId: string,
    contactId: string,
) {
    const result = await db.select()
        .from(contacts)
        .where(and(
            eq(contacts.id, contactId),
            eq(contacts.workspaceId, workspaceId),
        ))
        .limit(1);

    return result[0] ?? null;
}

export async function getContactWithIdentities(
    workspaceId: string,
    contactId: string,
) {
    const contact = await findContactById(
        workspaceId,
        contactId,
    );

    if (!contact) {
        return null;
    }

    const identities = await db.select()
        .from(contactIdentities)
        .where(and(
            eq(contactIdentities.workspaceId, workspaceId),
            eq(contactIdentities.contactId, contactId),
        ))
        .orderBy(asc(contactIdentities.createdAt));

    return {
        ...contact,
        identities,
    };
}

export async function createContact(data: {
    workspaceId: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
    avatarUrl?: string | null;
    notes?: string | null;
}) {
    const result = await db.insert(contacts)
        .values({
            workspaceId: data.workspaceId,
            name: data.name ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
            avatarUrl: data.avatarUrl ?? null,
            notes: data.notes ?? null,
        })
        .returning();

    return result[0] ?? null;
}

export async function updateContact(
    workspaceId: string,
    contactId: string,
    data: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        avatarUrl?: string | null;
        notes?: string | null;
    },
) {
    const result = await db.update(contacts)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(and(
            eq(contacts.id, contactId),
            eq(contacts.workspaceId, workspaceId),
        ))
        .returning();

    return result[0] ?? null;
}

export async function deleteContact(
    workspaceId: string,
    contactId: string,
) {
    const result = await db.delete(contacts)
        .where(and(
            eq(contacts.id, contactId),
            eq(contacts.workspaceId, workspaceId),
        ))
        .returning({
            id: contacts.id,
        });

    return result[0] ?? null;
}

export async function getContactDetails(
    workspaceId: string,
    contactId: string,
) {
    const contact = await getContactWithIdentities(
        workspaceId,
        contactId,
    );

    if (!contact) {
        return null;
    }

    const conversations =
        await findConversationsByContact(
            workspaceId,
            contactId,
        );

    const conversationsWithMessages =
        await Promise.all(
            conversations.map(
                async (conversation) => ({
                    ...conversation,
                    messages:
                        await findConversationMessages(
                            conversation.id,
                            50,
                        ),
                }),
            ),
        );

    return {
        ...contact,
        conversations:
            conversationsWithMessages,
    };
}