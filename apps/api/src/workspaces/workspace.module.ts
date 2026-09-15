import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { WorkspaceController } from "./workspace.controller.js";
import { WorkspaceService } from "./workspace.service.js";
import { WorkspaceRoleGuard } from "./workspace-role.guard.js";
import { EmailModule } from "../providers/email/email.module.js";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module.js";

@Module({
    imports: [AuthModule, EmailModule, SubscriptionsModule],
    controllers: [WorkspaceController],
    providers: [WorkspaceService, WorkspaceRoleGuard],
})
export class WorkspaceModule {}