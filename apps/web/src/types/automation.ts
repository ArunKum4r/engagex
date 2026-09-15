export type AutomationStepType =
    | "TRIGGER"
    | "SEND_DM"
    | "ADD_TAG"
    | "REMOVE_TAG"
    | "WAIT"
    | "CONDITION";

export interface AutomationStep {
    id: string;
    type: AutomationStepType;
    position: {
        x: number;
        y: number;
    };
    config: Record<string, unknown>;
}

export interface AutomationEdge {
    id: string;
    fromStepId: string;
    toStepId: string;
    branch?: string | null;
}

export interface AutomationGraph {
    steps: AutomationStep[];
    edges: AutomationEdge[];
}