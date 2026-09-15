import { db } from "../client.js";
import { entitlementDefinitions } from "../schema/index.js";
import { ENTITLEMENTS } from "../subscriptions/entitlements.js";

const entitlements = [
    {
        key: ENTITLEMENTS.WORKSPACE_MAX,
        name: "Workspaces",
        description: "Maximum number of workspaces allowed.",
        type: "LIMIT",
    },
    {
        key: ENTITLEMENTS.PLATFORM_MAX,
        name: "Connected Platforms",
        description: "Maximum number of connected platform accounts allowed.",
        type: "LIMIT",
    },
    {
        key: ENTITLEMENTS.PLATFORM_INSTAGRAM,
        name: "Instagram",
        description: "Whether Instagram integrations are available.",
        type: "BOOLEAN",
    },
    {
        key: ENTITLEMENTS.PLATFORM_FACEBOOK,
        name: "Facebook",
        description: "Whether Facebook integrations are available.",
        type: "BOOLEAN",
    },
    {
        key: ENTITLEMENTS.PLATFORM_WHATSAPP,
        name: "WhatsApp",
        description: "Whether WhatsApp integrations are available.",
        type: "BOOLEAN",
    },
    {
        key: ENTITLEMENTS.AUTOMATIONS_MAX,
        name: "Automations",
        description: "Maximum number of automations allowed.",
        type: "LIMIT",
    },
    {
        key: ENTITLEMENTS.LEADS_MAX,
        name: "Leads",
        description: "Maximum number of leads allowed.",
        type: "LIMIT",
    },
    {
        key: ENTITLEMENTS.WORKFLOW_BUILDER,
        name: "Workflow Builder",
        description: "Whether the visual workflow builder is available.",
        type: "BOOLEAN",
    },
    {
        key: ENTITLEMENTS.WORKFLOW_FORM,
        name: "Form Builder",
        description: "Whether the form-based workflow builder is available.",
        type: "BOOLEAN",
    },
    {
        key: ENTITLEMENTS.DM_MONTHLY,
        name: "Monthly DMs",
        description: "Number of monthly DMs allowed.",
        type: "LIMIT",
    }
];

const seed = async () => {
    for (const entitlement of entitlements) {
        await db
            .insert(entitlementDefinitions)
            .values(entitlement)
            .onConflictDoNothing({
                target: entitlementDefinitions.key,
            });
    }

    console.log(
        "Subscription entitlements seeded successfully.",
    );
};

seed()
    .catch((error) => {
        console.error(
            "Failed to seed subscription entitlements:",
            error,
        );
        process.exit(1);
    })
    .finally(async () => {
        process.exit(0);
    });