import { eq } from "drizzle-orm";

import { db } from "../client.js";
import {
    adminPermissions,
    adminRolePermissions,
    adminUserRoles,
} from "../schema/index.js";

export const findAdminPermissions = async (
    adminUserId: string,
) => {
    const result = await db
        .select({
            key: adminPermissions.key,
        })
        .from(adminUserRoles)
        .innerJoin(
            adminRolePermissions,
            eq(
                adminUserRoles.roleId,
                adminRolePermissions.roleId,
            ),
        )
        .innerJoin(
            adminPermissions,
            eq(
                adminRolePermissions.permissionId,
                adminPermissions.id,
            ),
        )
        .where(eq(adminUserRoles.adminUserId, adminUserId));

    return result;
};