import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../client.js";
import { emailVerifications } from "../schema/email-verifications.js";

export async function createEmailVerification(data: { userId: string; codeHash: string; expiresAt: Date; }) {
    const result = await db
        .insert(emailVerifications)
        .values({
            userId: data.userId,
            codeHash: data.codeHash,
            expiresAt: data.expiresAt,
        })
        .returning();

    return result[0];
}

export async function findActiveEmailVerification(userId: string) {
    const result = await db
        .select()
        .from(emailVerifications)
        .where(
            and(
                eq(emailVerifications.userId, userId),
                gt(emailVerifications.expiresAt, new Date()),
                isNull(emailVerifications.verifiedAt),
            ),
        )
        .orderBy(emailVerifications.createdAt)
        .limit(1);

    return result[0] ?? null;
}

export async function incrementEmailVerificationAttempts(id: string) {
    const verification = await db
        .select()
        .from(emailVerifications)
        .where(eq(emailVerifications.id, id))
        .limit(1);

    if (!verification[0]) {
        return null;
    }

    const result = await db
        .update(emailVerifications)
        .set({
            attempts: verification[0].attempts + 1,
        })
        .where(eq(emailVerifications.id, id))
        .returning();

    return result[0] ?? null;
}

export async function markEmailVerificationUsed(id: string) {
    const result = await db
        .update(emailVerifications)
        .set({
            verifiedAt: new Date(),
        })
        .where(eq(emailVerifications.id, id))
        .returning();

    return result[0] ?? null;
}

export async function deleteEmailVerificationsByUserId(userId: string) {
    await db.delete(emailVerifications)
        .where(eq(emailVerifications.userId, userId));
}