import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  createAdminInvitation,
  findAdminInvitationByTokenHash,
  findAdminRoleBySlug,
  findAdminUserByEmail,
  markAdminInvitationAccepted,
  createAdminUser,
  assignAdminRole,
} from "@engagex/db";
import {
  generateSessionToken,
  hashPassword,
  hashSessionToken,
} from "../auth/admin-auth.utils.js";

@Injectable()
export class AdminInvitationsService {
  async createInvitation(data: {
    email: string;
    name: string;
    roleSlug: string;
    invitedByAdminId: string;
  }) {
    const existingUser = await findAdminUserByEmail(data.email);

    if (existingUser) {
      throw new ConflictException(
        "An admin user with this email already exists",
      );
    }

    const role = await findAdminRoleBySlug(data.roleSlug);

    if (!role || !role.isActive) {
      throw new NotFoundException("Admin role not found");
    }

    const token = generateSessionToken();
    const tokenHash = hashSessionToken(token);

    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const invitation = await createAdminInvitation({
      email: data.email,
      name: data.name,
      roleId: role.id,
      tokenHash,
      invitedByAdminId: data.invitedByAdminId,
      expiresAt,
    });

    if (!invitation) {
      throw new ConflictException(
        "Unable to create admin invitation",
      );
    }

    return {
      id: invitation.id,
      email: invitation.email,
      name: invitation.name,
      role: {
        id: role.id,
        name: role.name,
        slug: role.slug,
      },
      expiresAt: invitation.expiresAt,
      token,
    };
  }

  async acceptInvitation(data: {
    token: string;
    password: string;
  }) {
    const tokenHash = hashSessionToken(data.token);

    const invitation =
      await findAdminInvitationByTokenHash(tokenHash);

    if (!invitation) {
      throw new NotFoundException(
        "Invalid admin invitation",
      );
    }

    if (invitation.acceptedAt) {
      throw new ConflictException(
        "Admin invitation has already been accepted",
      );
    }

    if (invitation.expiresAt <= new Date()) {
      throw new ConflictException(
        "Admin invitation has expired",
      );
    }

    const existingUser = await findAdminUserByEmail(
      invitation.email,
    );

    if (existingUser) {
      throw new ConflictException(
        "An admin user with this email already exists",
      );
    }

    const passwordHash = await hashPassword(data.password);

    const adminUser = await createAdminUser({
      email: invitation.email,
      name: invitation.name,
      passwordHash,
    });

    if (!adminUser) {
      throw new ConflictException(
        "Unable to create admin user",
      );
    }

    await assignAdminRole({
      adminUserId: adminUser.id,
      roleId: invitation.roleId,
    });

    await markAdminInvitationAccepted(invitation.id);

    return {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      status: adminUser.status,
    };
  }
}