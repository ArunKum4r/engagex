import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { createPlatformAccount, deletePlatformAccount, findPlatformAccountByExternalId,
    findWorkspacePlatformAccount, findWorkspacePlatformAccounts, updatePlatformAccount } from "@engagex/db";
import { CreatePlatformAccountDto, UpdatePlatformAccountDto } from "./integration.dto.js";
import { SubscriptionsService } from "../subscriptions/subscriptions.service.js";
import { ENTITLEMENTS } from "@engagex/db";


@Injectable()
export class IntegrationService {

    constructor(private readonly subscriptionsService: SubscriptionsService) {}
    
    async create(workspaceId: string, dto: CreatePlatformAccountDto) {
        const existing = await findPlatformAccountByExternalId(workspaceId, dto.platform, dto.externalAccountId);
        if (existing) throw new ConflictException("This platform account is already connected");
        
        const subscription = await this.subscriptionsService.getWorkspaceSubscription(workspaceId);
        if (!subscription) {
            throw new ForbiddenException("Active subscription required");
        }

        const platform =
            dto.platform.toLowerCase();

        const platformEntitlement =
            {
                instagram:
                    ENTITLEMENTS.PLATFORM_INSTAGRAM,
                facebook:
                    ENTITLEMENTS.PLATFORM_FACEBOOK,
                whatsapp:
                    ENTITLEMENTS.PLATFORM_WHATSAPP,
            }[platform];

        if (!platformEntitlement) {
            throw new BadRequestException("Unsupported platform");
        }

        const hasAccess = await this.subscriptionsService.hasFeature(subscription.subscription.id, platformEntitlement);
        if (!hasAccess) {
            throw new ForbiddenException(`${dto.platform} is not available on your current plan`);
        }

        const limitCheck =
            await this.subscriptionsService.checkLimit({
                subscriptionId:
                    subscription.subscription.id,
                key: ENTITLEMENTS.PLATFORM_MAX,
                userId: subscription.subscription.userId,
                workspaceId,
            });

        if (!limitCheck.allowed) throw new ForbiddenException("Connected platform limit reached");

        const account = await createPlatformAccount({
                workspaceId,
                platform: dto.platform,
                externalAccountId:
                    dto.externalAccountId,
                name: dto.name,
                username: dto.username,
                metadata: dto.metadata,
            });

        return this.toResponse(account);
    }

    async findAll(workspaceId: string) {
        const accounts = await findWorkspacePlatformAccounts(workspaceId);
        
        return accounts.map((account) =>
            this.toResponse(account),
        );
    }

    async findOne(workspaceId: string, platformAccountId: string) {
        const account = await findWorkspacePlatformAccount(workspaceId, platformAccountId);
        if (!account) {
            throw new NotFoundException("Platform account not found");
        }

        return this.toResponse(account);
    }

    async update(workspaceId: string, platformAccountId: string, dto: UpdatePlatformAccountDto) {
        const account = await findWorkspacePlatformAccount(workspaceId, platformAccountId);
        if (!account) {
            throw new NotFoundException("Platform account not found");
        }

        const updated =
            await updatePlatformAccount(
                platformAccountId,
                {
                    name: dto.name,
                    username: dto.username,
                    status: dto.status,
                    metadata: dto.metadata,
                },
            );

        if (!updated) {
            throw new NotFoundException("Platform account not found");
        }

        return this.toResponse(updated);
    }

    async remove(workspaceId: string, platformAccountId: string) {
        const account = await findWorkspacePlatformAccount(workspaceId, platformAccountId);
        if (!account) {
            throw new NotFoundException("Platform account not found");
        }
        const deleted = await deletePlatformAccount(platformAccountId);
        if (!deleted) {
            throw new NotFoundException("Platform account not found");
        }

        return { message: "Platform account disconnected successfully" };
    }

    private toResponse(account: {
        id: string;
        workspaceId: string;
        platform: string;
        externalAccountId: string;
        name: string | null;
        username: string | null;
        status: string;
        metadata: Record<string, unknown>;
        createdAt: Date;
        updatedAt: Date;
    }) {
        return {
            id: account.id,
            workspaceId: account.workspaceId,
            platform: account.platform,
            externalAccountId:
                account.externalAccountId,
            name: account.name,
            username: account.username,
            status: account.status,
            metadata: account.metadata,
            createdAt: account.createdAt,
            updatedAt: account.updatedAt,
        };
    }
}