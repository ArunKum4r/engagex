import { Module } from "@nestjs/common";

import { AuthController } from "./auth.controller.js";

import { AuthService } from "./auth.service.js";
import { EmailModule } from "../providers/email/email.module.js";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module.js";

@Module({
    imports: [EmailModule, SubscriptionsModule],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}