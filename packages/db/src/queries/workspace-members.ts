import { and, eq } from "drizzle-orm";
import { db } from "../client.js";
import { users } from "../schema/users.js";
import { workspaceMembers } from "../schema/workspace-members.js";

export async function findWorkspaceMember(workspaceId: string, userId: string) {
    const result = await db
        .select()
        .from(workspaceMembers)
        .where(
            and(
                eq(workspaceMembers.workspaceId, workspaceId),
                eq(workspaceMembers.userId, userId),
            ),
        )
        .limit(1);

    return result[0] ?? null;
}

export async function findWorkspaceMembers(workspaceId: string) {
    const result = await db
        .select({
            membership: workspaceMembers,
            user: users,
        })
        .from(workspaceMembers)
        .innerJoin(
            users,
            eq(workspaceMembers.userId, users.id),
        )
        .where(
            eq(workspaceMembers.workspaceId, workspaceId),
        );

    return result;
}

export async function addWorkspaceMember(data: { workspaceId: string; userId: string; role?: string; }) {
    const result = await db
        .insert(workspaceMembers)
        .values({
            workspaceId: data.workspaceId,
            userId: data.userId,
            role: data.role ?? "MEMBER",
        })
        .returning();

    return result[0];
}

export async function updateWorkspaceMemberRole(workspaceId: string, userId: string, role: string) {
    const result = await db
        .update(workspaceMembers)
        .set({
            role,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(workspaceMembers.workspaceId, workspaceId),
                eq(workspaceMembers.userId, userId),
            ),
        )
        .returning();

    return result[0] ?? null;
}

export async function removeWorkspaceMember(workspaceId: string, userId: string) {
    const result = await db
        .delete(workspaceMembers)
        .where(
            and(
                eq(workspaceMembers.workspaceId, workspaceId),
                eq(workspaceMembers.userId, userId),
            ),
        )
        .returning();

    return result[0] ?? null;
}