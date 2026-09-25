import { Queue } from "bullmq";

import { queueRedis } from "./queue.connection.js";
import { QUEUE_NAMES } from "./queue.constants.js";

export const automationTriggerQueue = new Queue(
    QUEUE_NAMES.AUTOMATION_TRIGGER,
    {
        connection: queueRedis,
    },
);

export const automationExecutionQueue = new Queue(
    QUEUE_NAMES.AUTOMATION_EXECUTION,
    {
        connection: queueRedis,
    },
);

export const automationActionQueue = new Queue(
    QUEUE_NAMES.AUTOMATION_ACTION,
    {
        connection: queueRedis,
    },
);