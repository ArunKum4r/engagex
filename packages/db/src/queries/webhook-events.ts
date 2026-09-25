import { eq } from "drizzle-orm";

import { db } from "../client.js";
import { webhookEvents } from "../schema/webhook-events.js";

export async function findWebhookEventById(webhookEventId: string) {
    const result = await db
        .select()
        .from(webhookEvents)
        .where(eq(webhookEvents.id, webhookEventId))
        .limit(1);

    return result[0] ?? null;
}