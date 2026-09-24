import { Module } from "@nestjs/common";

import { MessagingModule } from "../messaging/messaging.module.js";

import { ConversationsController } from "./conversations.controller.js";
import { ConversationReminderController } from "./conversation-reminders.controller.js";
import { ConversationReminderService } from "./conversation-reminders.service.js";

@Module({
    imports: [
        MessagingModule,
    ],
    controllers: [
        ConversationsController,
        ConversationReminderController
    ],
    providers: [ ConversationReminderService ]
})
export class ConversationsModule {}