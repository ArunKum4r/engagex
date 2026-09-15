export const ENTITLEMENTS = {
    // ----------------------------------------
    // WORKSPACES
    // ----------------------------------------

    WORKSPACE_MAX: "workspace.max",

    // ----------------------------------------
    // PLATFORMS
    // ----------------------------------------

    PLATFORM_MAX: "platform.max",

    PLATFORM_INSTAGRAM: "platform.instagram",
    PLATFORM_FACEBOOK: "platform.facebook",
    PLATFORM_WHATSAPP: "platform.whatsapp",

    // ----------------------------------------
    // AUTOMATIONS
    // ----------------------------------------

    AUTOMATIONS_MAX: "automations.max",
    DM_MONTHLY: "dm.monthly",

    // ----------------------------------------
    // LEADS
    // ----------------------------------------

    LEADS_MAX: "leads.max",

    // ----------------------------------------
    // WORKFLOW BUILDERS
    // ----------------------------------------

    WORKFLOW_BUILDER: "workflow.builder",
    WORKFLOW_FORM: "workflow.form",
} as const;

export type EntitlementKey =
    (typeof ENTITLEMENTS)[keyof typeof ENTITLEMENTS];