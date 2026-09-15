import { Module } from "@nestjs/common";

import { DatabaseModule } from "./providers/db/db.module.js";
import { HealthModule } from "./health/health.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { WorkspaceModule } from "./workspaces/workspace.module.js";
import { AutomationModule } from "./automations/automation.module.js";
import { IntegrationModule } from "./integrations/integration.module.js";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module.js";

@Module({
    imports: [DatabaseModule, HealthModule, AuthModule, WorkspaceModule, AutomationModule, IntegrationModule, SubscriptionsModule],
})
export class AppModule {}