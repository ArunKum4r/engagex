import { db } from "../client.js";
import {
  adminPermissions,
  adminRoles,
  adminRolePermissions,
} from "../schema/index.js";
import { eq } from "drizzle-orm";

const permissions = [
  {
    key: "users.read",
    name: "View Users",
    description: "View customer accounts.",
  },
  {
    key: "users.update",
    name: "Update Users",
    description: "Update customer account information.",
  },
  {
    key: "users.suspend",
    name: "Suspend Users",
    description: "Suspend or reactivate customer accounts.",
  },

  {
    key: "workspaces.read",
    name: "View Workspaces",
    description: "View customer workspaces.",
  },

  {
    key: "subscriptions.read",
    name: "View Subscriptions",
    description: "View customer subscriptions.",
  },
  {
    key: "subscriptions.update",
    name: "Manage Subscriptions",
    description: "Change customer subscriptions.",
  },

  {
    key: "plans.read",
    name: "View Plans",
    description: "View subscription plans.",
  },
  {
    key: "plans.create",
    name: "Create Plans",
    description: "Create subscription plans.",
  },
  {
    key: "plans.update",
    name: "Update Plans",
    description: "Update subscription plans.",
  },

  {
    key: "addons.read",
    name: "View Addons",
    description: "View subscription addons.",
  },
  {
    key: "addons.create",
    name: "Create Addons",
    description: "Create subscription addons.",
  },
  {
    key: "addons.update",
    name: "Update Addons",
    description: "Update subscription addons.",
  },

  {
    key: "entitlements.read",
    name: "View Entitlements",
    description: "View entitlement definitions.",
  },
  {
    key: "entitlements.update",
    name: "Manage Entitlements",
    description: "Manage plan and subscription entitlements.",
  },

  {
    key: "usage.read",
    name: "View Usage",
    description: "View customer resource and DM usage.",
  },

  {
    key: "impersonation.create",
    name: "Impersonate Users",
    description: "Start an audited customer impersonation session.",
  },

  {
    key: "audit_logs.read",
    name: "View Audit Logs",
    description: "View administrative audit logs.",
  },
];

const roles = [
  {
    name: "Super Admin",
    slug: "super_admin",
    description: "Full access to the Super Admin platform.",
    permissions: permissions.map((permission) => permission.key),
  },
  {
    name: "Support",
    slug: "support",
    description: "Customer support and troubleshooting access.",
    permissions: [
      "users.read",
      "workspaces.read",
      "subscriptions.read",
      "usage.read",
      "impersonation.create",
      "audit_logs.read",
    ],
  },
  {
    name: "Billing Admin",
    slug: "billing_admin",
    description: "Manage subscriptions, plans, addons, and entitlements.",
    permissions: [
      "users.read",
      "subscriptions.read",
      "subscriptions.update",
      "plans.read",
      "plans.create",
      "plans.update",
      "addons.read",
      "addons.create",
      "addons.update",
      "entitlements.read",
      "entitlements.update",
      "usage.read",
      "audit_logs.read",
    ],
  },
];

export const seedAdminRbac = async () => {
  const permissionMap = new Map<string, string>();

  for (const permission of permissions) {
    const existing = await db
      .select()
      .from(adminPermissions)
      .where(eq(adminPermissions.key, permission.key))
      .limit(1);

    let permissionId = existing[0]?.id;

    if (!permissionId) {
      const [created] = await db
        .insert(adminPermissions)
        .values(permission)
        .returning({
          id: adminPermissions.id,
        });

      permissionId = created.id;
    }

    permissionMap.set(permission.key, permissionId);
  }

  for (const role of roles) {
    const existing = await db
      .select()
      .from(adminRoles)
      .where(eq(adminRoles.slug, role.slug))
      .limit(1);

    let roleId = existing[0]?.id;

    if (!roleId) {
      const [created] = await db
        .insert(adminRoles)
        .values({
          name: role.name,
          slug: role.slug,
          description: role.description,
          isSystem: true,
          isActive: true,
        })
        .returning({
          id: adminRoles.id,
        });

      roleId = created.id;
    }

    for (const permissionKey of role.permissions) {
      const permissionId = permissionMap.get(permissionKey);

      if (!permissionId) {
        throw new Error(
          `Permission not found: ${permissionKey}`,
        );
      }

    await db
      .insert(adminRolePermissions)
      .values({
        roleId,
        permissionId,
      })
      .onConflictDoNothing();
    }
  }
};

seedAdminRbac()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });