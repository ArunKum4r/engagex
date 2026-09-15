import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { workspaceMembers } from "../schema/workspace-members.js";
import { workspaces } from "../schema/workspaces.js";

export async function createWorkspace(data: {name: string;slug: string;userId: string;}) {
    return db.transaction(async (tx) => {

        const workspaceResult = await tx
            .insert(workspaces)
            .values({
                name: data.name,
                slug: data.slug,
                ownerId: data.userId,
            })
            .returning();

        const workspace = workspaceResult[0];

        if (!workspace) {
            throw new Error("Failed to create workspace");
        }

        await tx
            .insert(workspaceMembers)
            .values({
                workspaceId: workspace.id,
                userId: data.userId,
                role: "OWNER",
            });

        return workspace;
    });
}

export async function findWorkspaceById(workspaceId: string) {
    const result = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1);

    return result[0] ?? null;
}

export async function findWorkspaceBySlug(slug: string) {
    const result = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, slug))
        .limit(1);

    return result[0] ?? null;
}

export async function findUserWorkspaces(userId: string) {
    const result = await db
        .select({
            workspace: workspaces,
            role: workspaceMembers.role,
        })
        .from(workspaceMembers)
        .innerJoin(
            workspaces,
            eq(workspaceMembers.workspaceId, workspaces.id),
        )
        .where(eq(workspaceMembers.userId, userId));

    return result;
}

export async function updateWorkspace(workspaceId: string, data: {name?: string;slug?: string;}) {
    const result = await db
        .update(workspaces)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(workspaces.id, workspaceId))
        .returning();

    return result[0] ?? null;
}

export async function deleteWorkspace(workspaceId: string,) {
    const result = await db
        .delete(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .returning();

    return result[0] ?? null;
}