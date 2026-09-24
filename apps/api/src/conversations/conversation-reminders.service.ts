import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";
import {
    cancelConversationReminder,
    completeConversationReminder,
    createConversationReminder,
    deleteConversationReminder,
    findConversationReminderById,
    findConversationReminders,
    getConversationById
} from "@engagex/db";

@Injectable()
export class ConversationReminderService {
    async create(
        workspaceId: string,
        conversationId: string,
        userId: string,
        data: {
            title: string;
            description?: string;
            remindAt: string;
        },
    ) {
        const conversation =
            await getConversationById(
                workspaceId,
                conversationId,
            );

        if (!conversation) {
            throw new NotFoundException(
                "Conversation not found",
            );
        }

        if (!data.title.trim()) {
            throw new BadRequestException(
                "Reminder title is required",
            );
        }

        const remindAt = new Date(
            data.remindAt,
        );

        if (Number.isNaN(remindAt.getTime())) {
            throw new BadRequestException(
                "Invalid reminder time",
            );
        }

        if (remindAt <= new Date()) {
            throw new BadRequestException(
                "Reminder time must be in the future",
            );
        }

        return createConversationReminder({
            conversationId,
            createdByUserId: userId,
            title: data.title.trim(),
            description:
                data.description?.trim() || null,
            remindAt,
        });
    }

    async findAll(
        workspaceId: string,
        conversationId: string,
    ) {
        const conversation =
            await getConversationById(
                workspaceId,
                conversationId,
            );

        if (!conversation) {
            throw new NotFoundException(
                "Conversation not found",
            );
        }

        return findConversationReminders(
            conversationId,
        );
    }

    async complete(
        workspaceId: string,
        reminderId: string,
    ) {
        const reminder =
            await this.getWorkspaceReminder(
                workspaceId,
                reminderId,
            );

        return completeConversationReminder(
            reminder.id,
        );
    }

    async cancel(
        workspaceId: string,
        reminderId: string,
    ) {
        const reminder =
            await this.getWorkspaceReminder(
                workspaceId,
                reminderId,
            );

        return cancelConversationReminder(
            reminder.id,
        );
    }

    async delete(
        workspaceId: string,
        reminderId: string,
    ) {
        const reminder =
            await this.getWorkspaceReminder(
                workspaceId,
                reminderId,
            );

        return deleteConversationReminder(
            reminder.id,
        );
    }

    private async getWorkspaceReminder(
        workspaceId: string,
        reminderId: string,
    ) {
        const reminder =
            await findConversationReminderById(
                reminderId,
            );

        if (!reminder) {
            throw new NotFoundException(
                "Reminder not found",
            );
        }

        const conversation =
            await getConversationById(
                workspaceId,
                reminder.conversationId,
            );

        if (!conversation) {
            throw new NotFoundException(
                "Reminder not found",
            );
        }

        return reminder;
    }
}