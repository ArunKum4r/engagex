import { createHash, randomBytes } from "node:crypto";
import * as argon2 from "argon2";

export function generateSessionToken(): string {
    return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}

export function hashPassword(password: string): Promise<string> {
    return argon2.hash(password);
}

export function verifyPassword(hashPassword: string, password: string): Promise<boolean> {
    return argon2.verify(hashPassword, password);
}

export function generatePasswordResetToken(): string {
    return randomBytes(32).toString("base64url");
}

export function hashPasswordResetToken(token: string): string {
    return createHash("sha256")
        .update(token)
        .digest("hex");
}