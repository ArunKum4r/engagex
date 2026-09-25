import {
    and,
    eq,
    gt,
    isNull,
    or,
} from "drizzle-orm";

import { db } from "../client.js";
import {
    contactAutomationPauses,
} from "../schema/contact-automation-pauses.js";

export async function createContactAutomationPause(
    data: {
        workspaceId: string;
        contactId: string;
        automationId?: string | null;
        pausedByUserId: string;
        reason?: string | null;
        resumeAt?: Date | null;
    },
) {
    const rows = await db.insert(
        contactAutomationPauses,
    )
        .values({
            workspaceId: data.workspaceId,
            contactId: data.contactId,
            automationId:
                data.automationId ?? null,
            pausedByUserId:
                data.pausedByUserId,
            reason: data.reason ?? null,
            resumeAt:
                data.resumeAt ?? null,
        })
        .returning();

    return rows[0];
}

export async function findContactAutomationPauses(
    workspaceId: string,
    contactId: string,
) {
    return db.select()
        .from(contactAutomationPauses)
        .where(
            and(
                eq(
                    contactAutomationPauses.workspaceId,
                    workspaceId,
                ),
                eq(
                    contactAutomationPauses.contactId,
                    contactId,
                ),
            ),
        );
}

export async function findActiveContactAutomationPause(
    contactId: string,
    automationId: string,
) {
    const now = new Date();

    const rows = await db.select()
        .from(contactAutomationPauses)
        .where(
            and(
                eq(
                    contactAutomationPauses.contactId,
                    contactId,
                ),
                or(
                    isNull(
                        contactAutomationPauses.automationId,
                    ),
                    eq(
                        contactAutomationPauses.automationId,
                        automationId,
                    ),
                ),
                or(
                    isNull(
                        contactAutomationPauses.resumeAt,
                    ),
                    gt(
                        contactAutomationPauses.resumeAt,
                        now,
                    ),
                ),
            ),
        );

    return rows[0] ?? null;
}

export async function deleteContactAutomationPause(
    workspaceId: string,
    contactId: string,
    automationId?: string | null,
) {
    const conditions = [
        eq(
            contactAutomationPauses.workspaceId,
            workspaceId,
        ),
        eq(
            contactAutomationPauses.contactId,
            contactId,
        ),
    ];

    if (automationId) {
        conditions.push(
            eq(
                contactAutomationPauses.automationId,
                automationId,
            ),
        );
    } else {
        conditions.push(
            isNull(
                contactAutomationPauses.automationId,
            ),
        );
    }

    const rows = await db.delete(
        contactAutomationPauses,
    )
        .where(and(...conditions))
        .returning();

    return rows[0] ?? null;
}

export async function findActiveContactAutomationPauses(
    contactId: string,
) {
    const now = new Date();

    return db.select()
        .from(contactAutomationPauses)
        .where(
            and(
                eq(
                    contactAutomationPauses.contactId,
                    contactId,
                ),
                or(
                    isNull(
                        contactAutomationPauses.resumeAt,
                    ),
                    gt(
                        contactAutomationPauses.resumeAt,
                        now,
                    ),
                ),
            ),
        );
}