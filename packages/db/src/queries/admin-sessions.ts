import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { adminSessions, adminUsers } from "../schema/index.js";

export const createAdminSession = async (data: {
  adminUserId: string;
  tokenHash: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}) => {
  const result = await db
    .insert(adminSessions)
    .values({
      adminUserId: data.adminUserId,
      tokenHash: data.tokenHash,
      expiresAt: data.expiresAt,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    })
    .returning();

  return result[0] ?? null;
};

export const findAdminSessionWithUserByTokenHash = async (
  tokenHash: string,
) => {
  const result = await db
    .select({
      session: adminSessions,
      adminUser: adminUsers,
    })
    .from(adminSessions)
    .innerJoin(
      adminUsers,
      eq(adminSessions.adminUserId, adminUsers.id),
    )
    .where(eq(adminSessions.tokenHash, tokenHash))
    .limit(1);

  return result[0] ?? null;
};

export const updateAdminSessionLastSeen = async (
  sessionId: string,
) => {
  const result = await db
    .update(adminSessions)
    .set({
      lastSeenAt: new Date(),
    })
    .where(eq(adminSessions.id, sessionId))
    .returning();

  return result[0] ?? null;
};

export const revokeAdminSession = async (
  sessionId: string,
) => {
  const result = await db
    .update(adminSessions)
    .set({
      revokedAt: new Date(),
    })
    .where(eq(adminSessions.id, sessionId))
    .returning();

  return result[0] ?? null;
};