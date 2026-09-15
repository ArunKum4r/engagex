import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  findAdminUserByEmail,
  findAdminUserById,
  findAdminUserRoles,
  findAllAdminUsers,
  replaceAdminUserRoles,
  updateAdminUser,
  countActiveSuperAdmins
} from "@engagex/db";

@Injectable()
export class AdminUsersService {
  async findAll() {
    return findAllAdminUsers();
  }

  async findOne(adminUserId: string) {
    const adminUser = await findAdminUserById(adminUserId);

    if (!adminUser) {
      throw new NotFoundException("Admin user not found");
    }

    return adminUser;
  }

  async update(
    adminUserId: string,
    data: {
      name?: string;
      email?: string;
    },
  ) {
    await this.findOne(adminUserId);

    if (data.email) {
      const existingUser = await findAdminUserByEmail(data.email);

      if (existingUser && existingUser.id !== adminUserId) {
        throw new ConflictException("Email is already in use");
      }
    }

    const updatedUser = await updateAdminUser(adminUserId, data);

    if (!updatedUser) {
      throw new NotFoundException("Admin user not found");
    }

    return updatedUser;
  }

  async updateStatus(
    adminUserId: string,
    isActive: boolean,
    actingAdminUserId: string,
  ) {
    const adminUser = await this.findOne(adminUserId);

    if (
      !isActive &&
      adminUserId === actingAdminUserId
    ) {
      throw new ForbiddenException(
        "You cannot suspend your own admin account",
      );
    }

    if (!isActive && adminUser.isActive) {
      const isSuperAdmin = (
        await findAdminUserRoles(adminUserId)
      ).some((role) => role.slug === "super_admin");

      if (isSuperAdmin) {
        const activeSuperAdmins =
          await countActiveSuperAdmins();

        if (activeSuperAdmins <= 1) {
          throw new ForbiddenException(
            "Cannot suspend the last active Super Admin",
          );
        }
      }
    }

    if (adminUser.isActive === isActive) {
      return adminUser;
    }

    const status = isActive ? "ACTIVE" : "SUSPENDED";

    const updatedUser = await updateAdminUser(adminUserId, {
      isActive,
      status,
    });

    if (!updatedUser) {
      throw new NotFoundException("Admin user not found");
    }

    return updatedUser;
  }

  async getRoles(adminUserId: string) {
    await this.findOne(adminUserId);

    return findAdminUserRoles(adminUserId);
  }

  async replaceRoles(
    adminUserId: string,
    roleIds: string[],
  ) {
    await this.findOne(adminUserId);

    const currentRoles = await findAdminUserRoles(adminUserId);

    const currentlySuperAdmin = currentRoles.some(
      (role) => role.slug === "super_admin",
    );

    if (currentlySuperAdmin) {
      const superAdminRole = currentRoles.find(
        (role) => role.slug === "super_admin",
      );

      const keepsSuperAdmin = roleIds.includes(
        superAdminRole!.id,
      );

      if (!keepsSuperAdmin) {
        const activeSuperAdmins =
          await countActiveSuperAdmins();

        if (activeSuperAdmins <= 1) {
          throw new ForbiddenException(
            "Cannot remove the last active Super Admin role",
          );
        }
      }
    }

    await replaceAdminUserRoles({
      adminUserId,
      roleIds,
    });

    return findAdminUserRoles(adminUserId);
  }
}