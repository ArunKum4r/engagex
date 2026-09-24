import {
    createContact,
    deleteContact,
    getContactWithIdentities,
    listContacts,
    updateContact,
    getContactDetails
} from "@engagex/db";

export class ContactsService {
    async list(
        workspaceId: string,
        options: {
            page?: number;
            limit?: number;
            search?: string;
        } = {},
    ) {
        return listContacts(workspaceId, options);
    }

    async getById(
        workspaceId: string,
        contactId: string,
    ) {
        return getContactWithIdentities(
            workspaceId,
            contactId,
        );
    }

    async create(
        workspaceId: string,
        data: {
            name?: string | null;
            email?: string | null;
            phone?: string | null;
            avatarUrl?: string | null;
            notes?: string | null;
        },
    ) {
        return createContact({
            workspaceId,
            ...data,
        });
    }

    async update(
        workspaceId: string,
        contactId: string,
        data: {
            name?: string | null;
            email?: string | null;
            phone?: string | null;
            avatarUrl?: string | null;
            notes?: string | null;
        },
    ) {
        return updateContact(
            workspaceId,
            contactId,
            data,
        );
    }

    async delete(
        workspaceId: string,
        contactId: string,
    ) {
        return deleteContact(
            workspaceId,
            contactId,
        );
    }

    async getDetails(
        workspaceId: string,
        contactId: string,
    ) {
        return getContactDetails(
            workspaceId,
            contactId,
        );
    }
}