import type { LucideIcon } from "lucide-react";

export type AutomationCapabilityCategory =
    | "TRIGGER"
    | "CONDITION"
    | "ACTION"
    | "FLOW";

export interface AutomationCapability {
    type: string;
    label: string;
    description: string;
    category: AutomationCapabilityCategory;
    icon: LucideIcon;
    configType?: string;
}

export interface AutomationPlatformCapabilities {
    platform: string;
    triggers: AutomationCapability[];
    conditions: AutomationCapability[];
    actions: AutomationCapability[];
    flow: AutomationCapability[];
}