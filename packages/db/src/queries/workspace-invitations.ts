import { eq, and, isNull } from "drizzle-orm";
import { db } from "../client.js";
import { workspaceInvitations } from "../schema/workspace-invitations.js";

export async function createWorkspaceInvitation(data: { workspaceId: string; email: string; role: string; tokenHash: string; expiresAt: Date; acceptedAt:Date}) {
    const [ invitation ] = await db.insert(workspaceInvitations)
        .values(data)
        .returning();
    
    return invitation;
}

export async function findWorkspaceInvitationByTokenHash(tokenHash: string) {
    const [ invitation ] = await db.select()
        .from(workspaceInvitations)
        .where(eq(workspaceInvitations.tokenHash, tokenHash))
        .limit(1);

    return invitation ?? null;
}

export async function findPendingWorkspaceInvitation(workspaceId: string, email: string) {
    const [ invitation ] = await db.select()
        .from(workspaceInvitations)
        .where(
            and(
                eq(workspaceInvitations.workspaceId, workspaceId),
                eq(workspaceInvitations.email, email),
                isNull(workspaceInvitations.acceptedAt)
            )
        )
        .limit(1);

    return invitation ?? null;
}

export async function markWorkspaceInvitationAccepted(invitationId: string) {
    const [ invitation ] = await db.update(workspaceInvitations)
        .set({ acceptedAt: new Date() })
        .where(eq(workspaceInvitations.id, invitationId))
        .returning();

    return invitation ?? null;
}

export async function deleteWorkspaceInvitation(invitationId: string) {
    return db.delete(workspaceInvitations)
        .where(eq(workspaceInvitations.id, invitationId));
}