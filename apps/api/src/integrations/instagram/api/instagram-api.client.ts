import {
    BadRequestException,
    Injectable,
} from "@nestjs/common";

@Injectable()
export class InstagramApiClient {
    private readonly baseUrl = "https://graph.instagram.com";

    async getProfile(
        accessToken: string,
    ) {
        const url = new URL(`${this.baseUrl}/me`);

        url.searchParams.set(
            "fields",
            "id,user_id,username",
        );

        url.searchParams.set(
            "access_token",
            accessToken,
        );

        const response = await fetch(url);

        if (!response.ok) {
            const errorBody = await response.text();

            throw new BadRequestException(
                `Instagram API request failed: ${errorBody}`,
            );
        }

        return response.json();
    }

    async sendMessage(
        accessToken: string,
        instagramUserId: string,
        recipientId: string,
        text: string,
    ) {
        const response = await fetch(
            `${this.baseUrl}/${instagramUserId}/messages`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    recipient: {
                        id: recipientId,
                    },
                    message: {
                        text,
                    },
                }),
            },
        );

        if (!response.ok) {
            const errorBody = await response.text();

            throw new BadRequestException(
                `Instagram message failed: ${errorBody}`,
            );
        }

        return response.json();
    }

    async subscribeToWebhooks(
        accessToken: string,
        instagramUserId: string,
    ) {
        const url = new URL(
            `${this.baseUrl}/v26.0/${instagramUserId}/subscribed_apps`,
        );

        url.searchParams.set(
            "subscribed_fields",
            "messages,comments,messaging_postbacks",
        );

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const body = await response.text();

        if (!response.ok) {
            throw new BadRequestException(
                `Instagram webhook subscription failed: ${body}`,
            );
        }

        return JSON.parse(body);
    }

    async getWebhookSubscriptions(
        accessToken: string,
        instagramUserId: string,
    ) {
        const url = new URL(
            `${this.baseUrl}/v26.0/${instagramUserId}/subscribed_apps`,
        );

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const body = await response.text();

        if (!response.ok) {
            throw new BadRequestException(
                `Instagram webhook subscriptions failed: ${body}`,
            );
        }

        return JSON.parse(body);
    }

    async unsubscribeFromWebhooks(accessToken: string, instagramUserId: string) {
        const url = new URL(
            `${this.baseUrl}/v26.0/${instagramUserId}/subscribed_apps`,
        );

        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const body = await response.text();

        if (!response.ok) {
            throw new BadRequestException(
                `Instagram webhook unsubscribe failed: ${body}`,
            );
        }

        return body ? JSON.parse(body) : { success: true };
    }
}