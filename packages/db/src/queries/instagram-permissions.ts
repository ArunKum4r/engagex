const INSTAGRAM_PERMISSIONS = {
    BASIC: "instagram_business_basic",
    MANAGE_MESSAGES:
        "instagram_business_manage_messages",
    MANAGE_COMMENTS:
        "instagram_business_manage_comments",
    CONTENT_PUBLISH:
        "instagram_business_content_publish",
} as const;

type AutomationGraph = {
    trigger: {
        type: string;
        config?: Record<string, unknown>;
    } | null;

    steps: Array<{
        type: string;
        config?: Record<string, unknown>;
    }>;
};

export function getRequiredInstagramPermissions(
    graph: AutomationGraph,
) {
    const permissions =
        new Set<string>();

    permissions.add(
        INSTAGRAM_PERMISSIONS.BASIC,
    );

    if (graph.trigger) {
        switch (graph.trigger.type) {
            case "INSTAGRAM_COMMENT":
            case "INSTAGRAM_LIVE_COMMENT":
                permissions.add(
                    INSTAGRAM_PERMISSIONS.MANAGE_COMMENTS,
                );
                break;

            case "INSTAGRAM_STORY_REPLY":
            case "INSTAGRAM_DM":
            case "INSTAGRAM_STORY_SHARE":
            case "INSTAGRAM_REFERRAL":
                permissions.add(
                    INSTAGRAM_PERMISSIONS.MANAGE_MESSAGES,
                );
                break;
        }
    }

    for (const step of graph.steps) {
        switch (step.type) {
            case "SEND_DM":
                permissions.add(
                    INSTAGRAM_PERMISSIONS.MANAGE_MESSAGES,
                );
                break;

            case "REPLY_COMMENT":
                permissions.add(
                    INSTAGRAM_PERMISSIONS.MANAGE_COMMENTS,
                );
                break;
        }
    }

    return Array.from(permissions);
}