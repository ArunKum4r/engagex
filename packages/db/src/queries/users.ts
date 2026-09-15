import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { users } from "../schema/users.js";

export async function findUserById(userId: string) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    return result[0] ?? null;
}

export async function findUserByEmail(email: string) {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    return result[0] ?? null;
}

export async function createUser(data: { email: string; name: string; passwordHash: string; }) {
    const result = await db
        .insert(users)
        .values({
            email: data.email,
            name: data.name,
            passwordHash: data.passwordHash,
        })
        .returning();

    return result[0];
}

export async function verifyUserEmail(userId: string) {
    const result = await db
        .update(users)
        .set({
            emailVerifiedAt: new Date(),
            status: "ACTIVE",
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

    return result[0] ?? null;
}

export async function updateUserPassword(userId: string, passwordHash: string) {
    const result = await db
        .update(users)
        .set({
            passwordHash,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

    return result[0] ?? null;
}