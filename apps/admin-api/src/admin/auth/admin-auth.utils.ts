import { createHash, randomBytes } from "node:crypto";
import * as argon2 from "argon2";

export const generateSessionToken = (): string => {
    return randomBytes(32).toString("base64url");
};

export const hashSessionToken = (token: string): string => {
    return createHash("sha256")
        .update(token)
        .digest("hex");
};

export const hashPassword = (password: string): Promise<string> => {
    return argon2.hash(password);
};

export const verifyPassword = (
    passwordHash: string,
    password: string,
): Promise<boolean> => {
    return argon2.verify(passwordHash, password);
};