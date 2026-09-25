import { Body, Controller, Get, NotFoundException, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard.js";
import { MessagingService } from "../messaging/messaging.service.js";
import { SendMessageDto } from "./conversations.dto.js";
import { listConversations, getConversationById } from "@engagex/db";
import { ApiParam } from "@nestjs/swagger";

@Controller(
    "workspaces/:workspaceId/conversations",
)
@UseGuards(AuthGuard)
export class ConversationsController {
    constructor(
        private readonly messagingService: MessagingService,
    ) {}

    @Get()
    @ApiParam({
        name: "limit",
        required: false
    })
    @ApiParam({
        name: "page",
        required: false
    })
    @ApiParam({
        name: "status",
        required: false
    })
    async list(
        @Param("workspaceId") workspaceId: string,
        @Query("page") page?: string,
        @Query("limit") limit?: string,
        @Query("status") status?: string,
    ) {
        return listConversations(
            workspaceId,
            {
                page: page
                    ? Number(page)
                    : undefined,
                limit: limit
                    ? Number(limit)
                    : undefined,
                status: status || undefined,
            },
        );
    }

    @Post(":conversationId/messages")
    async sendMessage(
        @Param("workspaceId") workspaceId: string,
        @Param("conversationId") conversationId: string,
        @Body() body: SendMessageDto,
        @Req() request: any,
    ) {
        return this.messagingService.sendMessage({
            workspaceId,
            conversationId,
            userId: request.user.id,
            type: body.type ?? "TEXT",
            content: body.content,
        });
    }

    @Get(":conversationId")
    async get(
        @Param("workspaceId") workspaceId: string,
        @Param("conversationId") conversationId: string,
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

        return conversation;
    }
}