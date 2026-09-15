import { eq, count, desc, and } from "drizzle-orm";
import { db } from "../client.js";
import { adminRoles, adminUserRoles, adminUsers } from "../schema/index.js";

export const findAdminUserByEmail = async (email: string) => {
  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, email))
    .limit(1);

  return result[0] ?? null;
};

export const findAdminUserById = async (adminUserId: string) => {
  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, adminUserId))
    .limit(1);

  return result[0] ?? null;
};

export const updateAdminUserLastLogin = async (
  adminUserId: string,
) => {
  const result = await db
    .update(adminUsers)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, adminUserId))
    .returning();

  return result[0] ?? null;
};

export const createAdminUser = async (data: {
  email: string;
  name: string;
  passwordHash: string;
}) => {
  const result = await db
    .insert(adminUsers)
    .values({
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      status: "ACTIVE",
      isActive: true,
    })
    .returning();

  return result[0] ?? null;
};

export const assignAdminRole = async ({
  adminUserId,
  roleId,
}: {
  adminUserId: string;
  roleId: string;
}) => {
  const result = await db
    .insert(adminUserRoles)
    .values({
      adminUserId,
      roleId,
    })
    .onConflictDoNothing()
    .returning();

  return result[0] ?? null;
};

export const countAdminUsers = async () => {
    const result = await db
        .select({
            count: count(),
        })
        .from(adminUsers);

    return Number(result[0]?.count ?? 0);
};

export const findAllAdminUsers = async () => {
  return db
    .select({
      id: adminUsers.id,
      email: adminUsers.email,
      name: adminUsers.name,
      status: adminUsers.status,
      isActive: adminUsers.isActive,
      lastLoginAt: adminUsers.lastLoginAt,
      createdAt: adminUsers.createdAt,
      updatedAt: adminUsers.updatedAt,
    })
    .from(adminUsers)
    .orderBy(desc(adminUsers.createdAt));
};

export const updateAdminUser = async (
  adminUserId: string,
  data: {
    name?: string;
    email?: string;
    status?: string;
    isActive?: boolean;
  },
) => {
  const result = await db
    .update(adminUsers)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(adminUsers.id, adminUserId))
    .returning();

  return result[0] ?? null;
};

export const findAdminUserRoles = async (adminUserId: string) => {
  return db
    .select({
      id: adminRoles.id,
      name: adminRoles.name,
      slug: adminRoles.slug,
      description: adminRoles.description,
      isSystem: adminRoles.isSystem,
      isActive: adminRoles.isActive,
    })
    .from(adminUserRoles)
    .innerJoin(
      adminRoles,
      eq(adminUserRoles.roleId, adminRoles.id),
    )
    .where(eq(adminUserRoles.adminUserId, adminUserId));
};

export const replaceAdminUserRoles = async ({
  adminUserId,
  roleIds,
}: {
  adminUserId: string;
  roleIds: string[];
}) => {
  return db.transaction(async (tx) => {
    await tx
      .delete(adminUserRoles)
      .where(eq(adminUserRoles.adminUserId, adminUserId));

    if (roleIds.length === 0) {
      return [];
    }

    return tx
      .insert(adminUserRoles)
      .values(
        roleIds.map((roleId) => ({
          adminUserId,
          roleId,
        })),
      )
      .onConflictDoNothing()
      .returning();
  });
};

export const countActiveSuperAdmins = async () => {
  const result = await db
    .select({
      count: count(),
    })
    .from(adminUserRoles)
    .innerJoin(
      adminUsers,
      eq(adminUserRoles.adminUserId, adminUsers.id),
    )
    .innerJoin(
      adminRoles,
      eq(adminUserRoles.roleId, adminRoles.id),
    )
    .where(
      and(
        eq(adminUsers.isActive, true),
        eq(adminRoles.slug, "super_admin"),
      ),
    );

  return Number(result[0]?.count ?? 0);
};