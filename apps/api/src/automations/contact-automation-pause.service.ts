import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common";

import {
    createContactAutomationPause,
    deleteContactAutomationPause,
    findContactAutomationPauses,
} from "@engagex/db";

@Injectable()
export class ContactAutomationPauseService {
    async list(
        workspaceId: string,
        contactId: string,
    ) {
        return findContactAutomationPauses(
            workspaceId,
            contactId,
        );
    }

    async pause(
        workspaceId: string,
        contactId: string,
        userId: string,
        input: {
            automationId?: string | null;
            reason?: string | null;
            resumeAt?: Date | null;
        },
    ) {
        if (
            input.resumeAt &&
            input.resumeAt <= new Date()
        ) {
            throw new BadRequestException(
                "Resume time must be in the future",
            );
        }

        return createContactAutomationPause({
            workspaceId,
            contactId,
            automationId:
                input.automationId ?? null,
            pausedByUserId: userId,
            reason: input.reason ?? null,
            resumeAt:
                input.resumeAt ?? null,
        });
    }

    async resume(
        workspaceId: string,
        contactId: string,
        automationId?: string | null,
    ) {
        const deleted =
            await deleteContactAutomationPause(
                workspaceId,
                contactId,
                automationId,
            );

        if (!deleted) {
            throw new NotFoundException(
                "Automation pause not found",
            );
        }

        return deleted;
    }
}