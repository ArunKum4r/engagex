import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { sessions } from "../schema/sessions.js";
import { users } from "../schema/users.js";

export async function createSession(data: { userId: string; tokenHash: string; expiresAt: Date; ipAddress?: string; userAgent?: string; }) {
    const result = await db
        .insert(sessions)
        .values({
            userId: data.userId,
            tokenHash: data.tokenHash,
            expiresAt: data.expiresAt,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
        })
        .returning();

    return result[0];
}

export async function findSessionByTokenHash(tokenHash: string) {
    const result = await db
        .select()
        .from(sessions)
        .where(eq(sessions.tokenHash, tokenHash))
        .limit(1);

    return result[0] ?? null;
}

export async function revokeSession(sessionId: string) {
    const result = await db
        .update(sessions)
        .set({
            revokedAt: new Date(),
        })
        .where(eq(sessions.id, sessionId))
        .returning();

    return result[0] ?? null;
}

export async function updateSessionLastSeen(sessionId: string) {
    const result = await db
        .update(sessions)
        .set({
            lastSeenAt: new Date(),
        })
        .where(eq(sessions.id, sessionId))
        .returning();

    return result[0] ?? null;
}

export async function findSessionWithUserByTokenHash(tokenHash: string) {
    const result = await db.select({session: sessions, user: users})
        .from(sessions)
        .innerJoin(users, eq(sessions.userId, users.id))
        .where(eq(sessions.tokenHash, tokenHash))
        .limit(1);

    return result[0] ?? null;
}

export async function revokeAllUserSessions(userId: string) {
    await db
        .update(sessions)
        .set({
            revokedAt: new Date(),
        })
        .where(eq(sessions.userId, userId));
}