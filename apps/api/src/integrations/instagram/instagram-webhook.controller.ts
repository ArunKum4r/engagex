import {
    Controller,
    Get,
    Post,
    Query,
    Req,
    Res,
} from "@nestjs/common";

import type { Request, Response } from "express";

@Controller("integrations/instagram/webhook")
export class InstagramWebhookController {
    @Get()
    verify(
        @Query("hub.mode") mode: string,
        @Query("hub.verify_token") verifyToken: string,
        @Query("hub.challenge") challenge: string,
        @Res() response: Response,
    ) {
        const expectedToken =
            process.env.META_WEBHOOK_VERIFY_TOKEN;

        if (
            mode !== "subscribe" ||
            !expectedToken ||
            verifyToken !== expectedToken
        ) {
            return response
                .status(403)
                .send("Forbidden");
        }

        return response
            .status(200)
            .send(challenge);
    }
    
    @Post()
    async receive(
        @Req() request: Request,
        @Res() response: Response,
    ) {
        console.log("========== INSTAGRAM WEBHOOK ==========");
        console.log("Headers:", request.headers);
        console.log(
            "Body:",
            JSON.stringify(request.body, null, 2),
        );
        console.log("=======================================");

        return response.status(200).send("EVENT_RECEIVED");
    }
}