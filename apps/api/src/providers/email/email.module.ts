import { Module } from "@nestjs/common";
import { ConsoleEmailProvider } from "./email.provider.js";

export const EMAIL_PROVIDER = Symbol("EMAIL_PROVIDER");

@Module({
    providers: [
        {
            provide: EMAIL_PROVIDER,
            useClass: ConsoleEmailProvider,
        },
    ],
    exports: [EMAIL_PROVIDER],
})
export class EmailModule {}