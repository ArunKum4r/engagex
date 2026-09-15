import {
    assignAdminRole,
    countAdminUsers,
    createAdminUser,
    findAdminRoleBySlug,
} from "@engagex/db";

import { hashPassword } from "./admin-auth.utils.js";

const bootstrap = async () => {
    const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
    const name = process.env.ADMIN_BOOTSTRAP_NAME;

    if (!email || !password || !name) {
        throw new Error(
            "ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_PASSWORD and ADMIN_BOOTSTRAP_NAME are required",
        );
    }

    const adminCount = await countAdminUsers();

    if (adminCount > 0) {
        throw new Error(
            "Admin bootstrap is only available when no admin users exist",
        );
    }

    const superAdminRole =
        await findAdminRoleBySlug("super_admin");

    if (!superAdminRole) {
        throw new Error("super_admin role not found");
    }

    const passwordHash = await hashPassword(password);

    const adminUser = await createAdminUser({
        email,
        name,
        passwordHash,
    });

    if (!adminUser) {
        throw new Error("Unable to create admin user");
    }

    await assignAdminRole({
        adminUserId: adminUser.id,
        roleId: superAdminRole.id,
    });

    console.log(
        `Super Admin created successfully: ${adminUser.email}`,
    );
};

bootstrap()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });