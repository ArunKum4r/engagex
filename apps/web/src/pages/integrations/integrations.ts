export type IntegrationCategory =
    | "CHANNEL"
    | "CRM"
    | "ACCOUNTING";

export type IntegrationStatus =
    | "AVAILABLE"
    | "COMING_SOON";

export interface IntegrationDefinition {
    slug: string;
    name: string;
    category: IntegrationCategory;
    description: string;
    status: IntegrationStatus;
    capabilities: string[];
}

export const integrations: IntegrationDefinition[] = [
    {
        slug: "instagram",
        name: "Instagram",
        category: "CHANNEL",
        description:
            "Connect Instagram to automate comments, messages, stories, and content publishing.",
        status: "AVAILABLE",
        capabilities: [
            "Comment automations",
            "Story reply automations",
            "Automated DMs",
            "Instagram post scheduling",
            "Comment to DM flows",
            "Multi-step automations",
        ],
    },
    {
        slug: "crm",
        name: "CRM",
        category: "CRM",
        description:
            "Connect your CRM to sync contacts and customer activity.",
        status: "COMING_SOON",
        capabilities: [],
    },
    {
        slug: "accounting",
        name: "Accounting",
        category: "ACCOUNTING",
        description:
            "Connect accounting platforms to manage your business data.",
        status: "COMING_SOON",
        capabilities: [],
    },
];