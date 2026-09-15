import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { adminInvitations } from "../schema/index.js";

export const createAdminInvitation = async (data: {
  email: string;
  name: string;
  roleId: string;
  tokenHash: string;
  invitedByAdminId: string;
  expiresAt: Date;
}) => {
  const result = await db
    .insert(adminInvitations)
    .values({
      email: data.email,
      name: data.name,
      roleId: data.roleId,
      tokenHash: data.tokenHash,
      invitedByAdminId: data.invitedByAdminId,
      expiresAt: data.expiresAt,
    })
    .returning();

  return result[0] ?? null;
};

export const findAdminInvitationByTokenHash = async (
  tokenHash: string,
) => {
  const result = await db
    .select()
    .from(adminInvitations)
    .where(eq(adminInvitations.tokenHash, tokenHash))
    .limit(1);

  return result[0] ?? null;
};

export const markAdminInvitationAccepted = async (
  invitationId: string,
) => {
  const result = await db
    .update(adminInvitations)
    .set({
      acceptedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(adminInvitations.id, invitationId))
    .returning();

  return result[0] ?? null;
};