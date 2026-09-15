export interface EmailProvider {
    sendVerificationCode(
        email: string,
        code: string,
    ): Promise<void>;

    sendPasswordReset(
        email: string,
        token: string,
    ): Promise<void>;

    sendWorkspaceInvitation(
        email: string,
        workspaceName: string,
        role: string,
        token: string,
    ): Promise<void>;
}