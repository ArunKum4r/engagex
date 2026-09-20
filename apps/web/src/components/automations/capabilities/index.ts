import { instagramCapabilities } from "./instagram";
import type { AutomationPlatformCapabilities } from "./types";

const capabilities: Record<
    string,
    AutomationPlatformCapabilities
> = {
    INSTAGRAM: instagramCapabilities,
};

export const getPlatformCapabilities = (platform: string | null | undefined) => {
    if (!platform) {
        return null;
    }

    return capabilities[platform.toUpperCase()] ?? null;
};

export const getStepCapability = (platform: string | null | undefined, stepType: string) => {
    const capabilities = getPlatformCapabilities(platform);
    if (!capabilities) {
        return null;
    }

    return [
        ...capabilities.conditions,
        ...capabilities.actions,
        ...capabilities.flow,
    ].find(
        (capability) =>
            capability.type === stepType,
    ) ?? null;
};