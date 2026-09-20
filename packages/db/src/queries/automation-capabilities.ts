const INSTAGRAM_TRIGGERS = new Set([
    "INSTAGRAM_COMMENT",
    "INSTAGRAM_STORY_REPLY",
    "INSTAGRAM_DM",
    "INSTAGRAM_STORY_SHARE",
    "INSTAGRAM_LIVE_COMMENT",
    "INSTAGRAM_REFERRAL",
]);

const INSTAGRAM_ACTIONS = new Set([
    "SEND_DM",
    "REPLY_COMMENT",
]);

const INSTAGRAM_FLOW = new Set([
    "WAIT",
    "RANDOMIZER",
]);

const INSTAGRAM_CONDITIONS = new Set([
    "KEYWORD_MATCH",
    "FOLLOWER_STATUS",
    "LAST_INTERACTION",
    "LAST_SEEN",
    "FOLLOWER_COUNT",
    "USERNAME",
    "OPTED_IN",
    "VERIFIED",
    "WE_FOLLOW_USER",
    "CONTACT_NAME",
    "CONTACT_STATUS",
    "CONTACT_TAG",
]);

export function validateInstagramAutomationCapabilities(
    graph: {
        trigger: {
            type: string;
        } | null;

        steps: Array<{
            type: string;
        }>;
    },
) {
    const errors: string[] = [];

    if (graph.trigger) {
        if (
            !INSTAGRAM_TRIGGERS.has(
                graph.trigger.type,
            )
        ) {
            errors.push(
                `Unsupported Instagram trigger: ${graph.trigger.type}`,
            );
        }
    }

    for (const step of graph.steps) {
        const isSupported =
            INSTAGRAM_ACTIONS.has(step.type) ||
            INSTAGRAM_FLOW.has(step.type) ||
            INSTAGRAM_CONDITIONS.has(step.type);

        if (!isSupported) {
            errors.push(
                `Unsupported Instagram automation step: ${step.type}`,
            );
        }
    }

    return errors;
}