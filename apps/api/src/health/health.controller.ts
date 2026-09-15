import { Controller, Get } from "@nestjs/common";

import { checkDatabaseConnection } from "@engagex/db";

@Controller("health")
export class HealthController {

    @Get()
    async check() {

        await checkDatabaseConnection();

        return {
            status: "ok",
            database: "ok",
        };

    }

}