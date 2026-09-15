import { Injectable } from "@nestjs/common";
import { findAdminPermissions } from "@engagex/db";

@Injectable()
export class AdminRbacService {
    async hasPermission(
        adminUserId: string,
        permission: string,
    ) {
        const permissions =
            await findAdminPermissions(adminUserId);

        return permissions.some(
            (item) => item.key === permission,
        );
    }

    async getPermissions(adminUserId: string) {
        return findAdminPermissions(adminUserId);
    }
}