import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import {
    ApiBody,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard.js";
import { RequireWorkspaceRole } from "../workspaces/workspace-role.decorator.js";
import { WorkspaceRoleGuard } from "../workspaces/workspace-role.guard.js";
import { ContactsService } from "./contacts.service.js";

@ApiTags("Contacts")
@UseGuards(AuthGuard)
@Controller("workspaces/:workspaceId/contacts")
export class ContactsController {

    constructor(
        private readonly contactsService: ContactsService,
    ) {}

    @Get()
    @ApiOperation({
        summary: "List workspace contacts",
    })
    @ApiResponse({
        status: 200,
        description: "Contacts retrieved successfully",
    })
    @ApiQuery({
        name: "page",
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: "limit",
        required: false,
        type: Number,
    })
    @ApiQuery({
        name: "search",
        required: false,
        type: String,
    })
    async findAll(
        @Param("workspaceId") workspaceId: string,
        @Query("page") page?: string,
        @Query("limit") limit?: string,
        @Query("search") search?: string,
    ) {
        return this.contactsService.list(
            workspaceId,
            {
                page: page
                    ? Number(page)
                    : undefined,
                limit: limit
                    ? Number(limit)
                    : undefined,
                search,
            },
        );
    }

    @Get(":contactId")
    @ApiOperation({
        summary: "Get contact",
    })
    @ApiResponse({
        status: 200,
        description: "Contact retrieved successfully",
    })
    @ApiResponse({
        status: 404,
        description: "Contact not found",
    })
    async findOne(
        @Param("workspaceId") workspaceId: string,
        @Param("contactId") contactId: string,
    ) {
        const contact =
            await this.contactsService.getDetails(
                workspaceId,
                contactId,
            );

        if (!contact) {
            throw new NotFoundException(
                "Contact not found",
            );
        }

        return contact;
    }

    @Post()
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Create contact",
    })
    @ApiBody({
        schema: {
            type: "object",
            properties: {
                name: {
                    type: "string",
                    example: "John Doe",
                },
                email: {
                    type: "string",
                    example: "john@example.com",
                },
                phone: {
                    type: "string",
                    example: "+919876543210",
                },
                avatarUrl: {
                    type: "string",
                    example: "https://example.com/avatar.jpg",
                },
                notes: {
                    type: "string",
                    example: "Interested in the Pro plan",
                },
            },
        },
    })
    @ApiResponse({
        status: 201,
        description: "Contact created successfully",
    })
    async create(
        @Param("workspaceId") workspaceId: string,
        @Body()
        body: {
            name?: string;
            email?: string;
            phone?: string;
            avatarUrl?: string;
            notes?: string;
        },
    ) {
        return this.contactsService.create(
            workspaceId,
            body,
        );
    }

    @Patch(":contactId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Update contact",
    })
    @ApiResponse({
        status: 200,
        description: "Contact updated successfully",
    })
    @ApiResponse({
        status: 404,
        description: "Contact not found",
    })
    async update(
        @Param("workspaceId") workspaceId: string,
        @Param("contactId") contactId: string,
        @Body()
        body: {
            name?: string | null;
            email?: string | null;
            phone?: string | null;
            avatarUrl?: string | null;
            notes?: string | null;
        },
    ) {
        const contact =
            await this.contactsService.update(
                workspaceId,
                contactId,
                body,
            );

        if (!contact) {
            throw new NotFoundException(
                "Contact not found",
            );
        }

        return contact;
    }

    @Delete(":contactId")
    @UseGuards(AuthGuard, WorkspaceRoleGuard)
    @RequireWorkspaceRole("OWNER", "ADMIN")
    @ApiOperation({
        summary: "Delete contact",
    })
    @ApiResponse({
        status: 200,
        description: "Contact deleted successfully",
    })
    @ApiResponse({
        status: 404,
        description: "Contact not found",
    })
    async remove(
        @Param("workspaceId") workspaceId: string,
        @Param("contactId") contactId: string,
    ) {
        const contact =
            await this.contactsService.delete(
                workspaceId,
                contactId,
            );

        if (!contact) {
            throw new NotFoundException(
                "Contact not found",
            );
        }

        return {
            message: "Contact deleted successfully",
            id: contact.id,
        };
    }
}