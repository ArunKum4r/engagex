import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common";

import {
    createOauthState,
    ENTITLEMENTS,
    findValidOauthState,
    markOauthStateUsed,
    findPlatformAccountByExternalId,
    createPlatformAccount
} from "@engagex/db";

import { randomBytes, createHash } from "node:crypto";

import { SubscriptionsService } from "../../subscriptions/subscriptions.service.js";

@Injectable()
export class InstagramService {
    constructor(
        private readonly subscriptionsService: SubscriptionsService,
    ) {}

    async getAuthorizationUrl(
        workspaceId: string,
        userId: string,
    ) {
        const appId = process.env.META_APP_ID;
        const redirectUri = process.env.META_REDIRECT_URI;

        if (!appId || !redirectUri) {
            throw new BadRequestException(
                "Instagram integration is not configured",
            );
        }

        const subscription =
            await this.subscriptionsService
                .getWorkspaceSubscription(
                    workspaceId,
                );

        if (!subscription) {
            throw new ForbiddenException(
                "Active subscription required",
            );
        }

        const hasAccess =
            await this.subscriptionsService.hasFeature(
                subscription.subscription.id,
                ENTITLEMENTS.PLATFORM_INSTAGRAM,
            );

        if (!hasAccess) {
            throw new ForbiddenException(
                "Instagram is not available on your current plan",
            );
        }

        const state = randomBytes(32).toString("hex");

        const stateHash = createHash("sha256")
            .update(state)
            .digest("hex");

        const expiresAt = new Date(
            Date.now() + 10 * 60 * 1000,
        );

        await createOauthState({
            userId,
            workspaceId,
            provider: "INSTAGRAM",
            stateHash,
            expiresAt,
        });

        const params = new URLSearchParams({
            client_id: appId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: [
                "instagram_business_basic",
                "instagram_business_manage_messages",
                "instagram_business_manage_comments",
                "instagram_business_content_publish",
            ].join(","),
            state,
        });

        return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
    }

    async handleCallback(
        code: string,
        state: string,
    ) {
        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;
        const redirectUri = process.env.META_REDIRECT_URI;

        if (!appId || !appSecret || !redirectUri) {
            throw new BadRequestException(
                "Instagram integration is not configured",
            );
        }

        // 1. Validate OAuth state
        const stateHash = createHash("sha256")
            .update(state)
            .digest("hex");

        const oauthState =
            await findValidOauthState(stateHash);

        if (!oauthState) {
            throw new UnauthorizedException(
                "Invalid or expired OAuth state",
            );
        }

        if (oauthState.provider !== "INSTAGRAM") {
            throw new UnauthorizedException(
                "Invalid OAuth provider",
            );
        }

        // Prevent replay
        const usedState =
            await markOauthStateUsed(oauthState.id);

        if (!usedState) {
            throw new UnauthorizedException(
                "OAuth state has already been used",
            );
        }

        // 2. Exchange authorization code
        //    for short-lived access token
        const tokenBody = new URLSearchParams({
            client_id: appId,
            client_secret: appSecret,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            code,
        });

        const tokenResponse = await fetch(
            "https://api.instagram.com/oauth/access_token",
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/x-www-form-urlencoded",
                },
                body: tokenBody.toString(),
            },
        );

        if (!tokenResponse.ok) {
            const errorBody =
                await tokenResponse.text();

            throw new BadRequestException(
                `Instagram token exchange failed: ${errorBody}`,
            );
        }

        const shortLivedToken =
            await tokenResponse.json();

        if (!shortLivedToken.access_token) {
            throw new BadRequestException(
                "Instagram did not return an access token",
            );
        }

        // 3. Exchange short-lived token
        //    for long-lived token
        const longLivedUrl =
            new URL(
                "https://graph.instagram.com/access_token",
            );

        longLivedUrl.searchParams.set(
            "grant_type",
            "ig_exchange_token",
        );

        longLivedUrl.searchParams.set(
            "client_secret",
            appSecret,
        );

        longLivedUrl.searchParams.set(
            "access_token",
            shortLivedToken.access_token,
        );

        const longLivedResponse =
            await fetch(longLivedUrl);

        if (!longLivedResponse.ok) {
            const errorBody =
                await longLivedResponse.text();

            throw new BadRequestException(
                `Instagram long-lived token exchange failed: ${errorBody}`,
            );
        }

        const longLivedToken =
            await longLivedResponse.json();

        if (!longLivedToken.access_token) {
            throw new BadRequestException(
                "Instagram did not return a long-lived access token",
            );
        }

        // 4. Fetch connected Instagram account
        const profileUrl =
            new URL(
                "https://graph.instagram.com/me",
            );

        profileUrl.searchParams.set(
            "fields",
            "id,user_id,username",
        );

        profileUrl.searchParams.set(
            "access_token",
            longLivedToken.access_token,
        );

        const profileResponse =
            await fetch(profileUrl);

        if (!profileResponse.ok) {
            const errorBody =
                await profileResponse.text();

            throw new BadRequestException(
                `Failed to fetch Instagram profile: ${errorBody}`,
            );
        }

        const profile =
            await profileResponse.json();

        if (!profile.user_id) {
            throw new BadRequestException(
                "Instagram profile did not return user_id",
            );
        }

        // 5. Check if this Instagram account
        //    is already connected
        const existingAccount =
            await findPlatformAccountByExternalId(
                oauthState.workspaceId,
                "INSTAGRAM",
                profile.user_id,
            );

        if (existingAccount) {
            throw new BadRequestException(
                "This Instagram account is already connected",
            );
        }

        // 6. Save connected Instagram account
        const account =
            await createPlatformAccount({
                workspaceId: oauthState.workspaceId,
                platform: "INSTAGRAM",
                externalAccountId: profile.user_id,
                name: profile.username ?? null,
                username: profile.username ?? null,
                credentials: {
                    accessToken:
                        longLivedToken.access_token,
                    tokenType:
                        longLivedToken.token_type ?? "bearer",
                    expiresIn:
                        longLivedToken.expires_in ?? null,
                    obtainedAt:
                        new Date().toISOString(),
                },
                metadata: {
                    instagramAppScopedId:
                        profile.id ?? null,
                },
            });

        return {
            id: account.id,
            platform: account.platform,
            externalAccountId:
                account.externalAccountId,
            username:
                account.username,
            name:
                account.name,
        };
    }
}