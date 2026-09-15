import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { passwordResets } from "../schema/password-resets.js";

export async function createPasswordReset(data: { userId: string; tokenHash: string; expiresAt: Date;}) {
    const result = await db.insert(passwordResets)
        .values({
            userId: data.userId,
            tokenHash: data.tokenHash,
            expiresAt: data.expiresAt,
        })
        .returning();

    return result[0];
}

export async function findPasswordResetByTokenHash(tokenHash: string) {
    const result = await db.select()
        .from(passwordResets)
        .where(eq(passwordResets.tokenHash, tokenHash))
        .limit(1);

    return result[0] ?? null;
}

export async function markPasswordResetUsed(id: string) {
    const result = await db.update(passwordResets)
        .set({ usedAt: new Date() })
        .where(eq(passwordResets.id, id))
        .returning();

    return result[0] ?? null;
}

export async function deletePasswordResetsByUserId(userId: string) {
    await db.delete(passwordResets)
        .where(eq(passwordResets.userId, userId));
}