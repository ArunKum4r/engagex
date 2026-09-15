import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { createWorkspace, deleteWorkspace, findUserWorkspaces, findWorkspaceById,
    findWorkspaceBySlug, updateWorkspace, removeWorkspaceMember, updateWorkspaceMemberRole,
    findWorkspaceMember, addWorkspaceMember, findUserById, findWorkspaceMembers,
    findPendingWorkspaceInvitation, createWorkspaceInvitation, findWorkspaceInvitationByTokenHash,
    markWorkspaceInvitationAccepted } from "@engagex/db";
import { AcceptWorkspaceInvitationDto, AddWorkspaceMemberDto, CreateWorkspaceDto, CreateWorkspaceInvitationDto, UpdateWorkspaceDto, UpdateWorkspaceMemberRoleDto } from "./workspace.dto.js";
import { createHash, randomBytes } from "node:crypto";
import { EMAIL_PROVIDER } from "../providers/email/email.module.js";
import type { EmailProvider } from "../providers/email/email.types.js";
import { SubscriptionsService } from "../subscriptions/subscriptions.service.js";

@Injectable()
export class WorkspaceService {

    constructor(
        @Inject(EMAIL_PROVIDER)
        private readonly emailProvider: EmailProvider,
        private readonly subscriptionsService: SubscriptionsService,
    ) {}

    async create(userId: string, dto: CreateWorkspaceDto) {
        const name = dto.name.trim();
        const slug = dto.slug.trim().toLowerCase();

        const existingWorkspace = await findWorkspaceBySlug(slug);

        if (existingWorkspace) {
            throw new ConflictException("Workspace slug is already in use");
        }

        const limitCheck = await this.subscriptionsService.checkWorkspaceLimit(userId);
        if (!limitCheck.allowed) {
            throw new ConflictException("Workspace limit reached");
        }

        return createWorkspace({
            name,
            slug,
            userId,
        });

    }

    async findAll(userId: string) {
        return findUserWorkspaces(userId);
    }

    async findOne(workspaceId: string, userId: string) {
        const workspace = await findWorkspaceById(workspaceId);
        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        /*
         * Authorization will be handled by the
         * workspace membership layer.
         *
         * For now we verify that this user belongs
         * to the workspace.
         */

        const memberships = await findUserWorkspaces(userId);
        const membership = memberships.find((item) => item.workspace.id === workspaceId);
        if (!membership) {
            throw new NotFoundException("Workspace not found");
        }

        return {
            workspace,
            role: membership.role,
        };

    }

    async update(workspaceId: string, dto: UpdateWorkspaceDto) {
        if (dto.slug) {
            const slug = dto.slug.trim().toLowerCase();
            const existingWorkspace = await findWorkspaceBySlug(slug);

            if (existingWorkspace && existingWorkspace.id !== workspaceId) {
                throw new ConflictException("Workspace slug is already in use");
            }

            dto.slug = slug;
        }

        const workspace =await updateWorkspace(workspaceId, { name: dto.name?.trim(), slug: dto.slug });

        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        return workspace;
    }

    async remove(workspaceId: string) {
        const workspace = await deleteWorkspace(workspaceId);

        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        return {
            message: "Workspace deleted successfully",
        };
    }

    async findMembers(workspaceId: string) {
        return findWorkspaceMembers(workspaceId);
    }

    async addMember(workspaceId: string, dto: AddWorkspaceMemberDto) {
        const user = await findUserById(dto.userId);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const existingMember = await findWorkspaceMember(workspaceId, dto.userId);
        if (existingMember) {
            throw new ConflictException("User is already a member of this workspace");
        }

        return addWorkspaceMember({ workspaceId, userId: dto.userId, role: dto.role });
    }

    async updateMemberRole(workspaceId: string, userId: string, dto: UpdateWorkspaceMemberRoleDto) {
        const member = await findWorkspaceMember(workspaceId, userId);
        if (!member) {
            throw new NotFoundException("Workspace member not found");
        }

        if (member.role === "OWNER") {
            throw new ConflictException("Workspace owner role cannot be changed");
        }

        const updatedMember = await updateWorkspaceMemberRole(workspaceId, userId, dto.role);

        return updatedMember;
    }

    async removeMember(workspaceId: string, userId: string) {
        const member = await findWorkspaceMember(workspaceId, userId);
        if (!member) {
            throw new NotFoundException("Workspace member not found");
        }

        if (member.role === "OWNER") {
            throw new ConflictException("Workspace owner cannot be removed");
        }

        const removedMember = await removeWorkspaceMember(workspaceId, userId);

        return {
            message: "Workspace member removed successfully",
            member: removedMember,
        };
    }

    async createInvitation(workspaceId:string, dto: CreateWorkspaceInvitationDto) {
        const email = dto.email.trim().toLowerCase();

        const workspace = await findWorkspaceById(workspaceId);
        if (!workspace) {
            throw new NotFoundException("Workspace not found");
        }

        const existingInnvitation = await findPendingWorkspaceInvitation(workspaceId, email);
        if (existingInnvitation) {
            throw new ConflictException("A pending invitation already exists for this email");
        }

        const token = randomBytes(32).toString("hex");
        const tokenHash = createHash("sha256").update(token).digest("hex");
        const expiresAt = new Date(Date.now() + 7*24*60*60*1000);

        const invitation = await createWorkspaceInvitation({
            workspaceId,
            email,
            role: dto.role,
            tokenHash,
            expiresAt,
        });

        await this.emailProvider.sendWorkspaceInvitation(
            email,
            workspace.name,
            invitation.role,
            token,
        );

        return {
            id: invitation.id,
            email: invitation.email,
            role: invitation.role,
            expiresAt: invitation.expiresAt,
            token
        }
    }

    async acceptInvitation(userId: string, userEmail: string, dto: AcceptWorkspaceInvitationDto) {
        const tokenHash = createHash("sha256").update(dto.token).digest('hex');

        const invitation = await findWorkspaceInvitationByTokenHash(tokenHash);
        if (!invitation) {
            throw new BadRequestException("Invalid invitation");
        }

        if (invitation.acceptedAt) {
            throw new BadRequestException("Invitation has already been accpted");
        }

        if (invitation.expiresAt <= new Date()) {
            throw new BadRequestException("Invitation has expired");
        }

        if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
            throw new ForbiddenException("This invitation belongs to a different email address");
        }

        const existingMember = await findWorkspaceMember(invitation.workspaceId, userId);
        if (existingMember) {
            throw new ConflictException("You are already a member of this workspace");
        }

        const member = await addWorkspaceMember({
            workspaceId: invitation.workspaceId,
            userId,
            role: invitation.role
        });

        await markWorkspaceInvitationAccepted(invitation.id);

        return {
            message: "Workspace invitation accepted successfully",
            workspaceId: invitation.workspaceId,
            member
        };
    }
}