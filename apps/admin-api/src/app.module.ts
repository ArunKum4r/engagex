import { Module } from "@nestjs/common";
import { HealthModule } from "./health/health.module.js";
import { AdminModule } from "./admin/admin.module.js";

@Module({
  imports: [
    HealthModule,
    AdminModule,
  ],
})
export class AppModule {}