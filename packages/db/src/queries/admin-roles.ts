import { eq } from "drizzle-orm";
import { db } from "../client.js";
import { adminRoles } from "../schema/index.js";

export const findAdminRoleBySlug = async (slug: string) => {
    const result = await db
        .select()
        .from(adminRoles)
        .where(eq(adminRoles.slug, slug))
        .limit(1);

    return result[0] ?? null;
};