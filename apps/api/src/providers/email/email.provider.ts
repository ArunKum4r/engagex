import { Injectable } from "@nestjs/common";
import { EmailProvider } from "./email.types.js";

@Injectable()
export class ConsoleEmailProvider implements EmailProvider {
    async sendVerificationCode(email: string, code: string): Promise<void> {
        console.log(`[EMAIL_ADDRESS] ${email} with code: ${code}`)
    }

    async sendPasswordReset(email: string, token: string): Promise<void> {
        console.log(`[EMAIL_ADDRESS] ${email} password reset token: ${token}`);
    }

    async sendWorkspaceInvitation(
        email: string,
        workspaceName: string,
        role: string,
        token: string,
    ): Promise<void> {
        console.log(
            `[EMAIL] Workspace invitation sent to ${email}`,
        );

        console.log(
            `[EMAIL] Workspace: ${workspaceName}`,
        );

        console.log(
            `[EMAIL] Role: ${role}`,
        );

        console.log(
            `[EMAIL] Invitation token: ${token}`,
        );
    }
}