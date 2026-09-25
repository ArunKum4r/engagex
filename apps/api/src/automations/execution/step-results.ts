export type AutomationStepResult =
    | {
          type: "CONTINUE";
          output?: Record<string, unknown>;
      }
    | {
          type: "BRANCH";
          branch: string;
          output?: Record<string, unknown>;
      }
    | {
          type: "WAIT";
          delayMs: number;
          output?: Record<string, unknown>;
      }
    | {
          type: "COMPLETE";
          output?: Record<string, unknown>;
      }
    | {
          type: "FAILED";
          errorMessage: string;
          output?: Record<string, unknown>;
      };