import { createHash, randomBytes } from "node:crypto";

export const generateOauthState = () => {
    return randomBytes(32).toString("hex");
};

export const hashOauthState = (state: string) => {
    return createHash("sha256")
        .update(state)
        .digest("hex");
};