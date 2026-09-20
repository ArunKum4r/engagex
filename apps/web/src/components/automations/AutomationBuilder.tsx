import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Background,
    Controls,
    MiniMap,
    ReactFlow,
    addEdge,
    useEdgesState,
    useNodesState,
    type Connection,
    type Edge,
    type Node,
    type NodeMouseHandler,
    type NodeChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import TriggerNode from "./nodes/TriggerNode";
import StepNode from "./nodes/StepNode";
import AddStepMenu from "./AddStepMenu";
import NodeConfigPanel from "./NodeConfigPanel";
import TriggerSelector from "./TriggerSelector";

import {
    getAutomationGraph,
    saveAutomationGraph,
    type AutomationGraphTrigger,
} from "../../api/automation";
import { getPlatformAccount } from "../../api/integrations";
import { getStepCapability } from "./capabilities";

interface AutomationBuilderProps {
    workspaceId: string;
    automationId: string;
    editable?: boolean;
}

const nodeTypes = {
    trigger: TriggerNode,
    step: StepNode,
};

const createNodeId = () => `new-step-${crypto.randomUUID()}`;

const createEdgeId = () => `edge-${crypto.randomUUID()}`;

const AutomationBuilder = ({ workspaceId, automationId, editable = false }: AutomationBuilderProps) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showAddStep, setShowAddStep] = useState(false);
    const [showTriggerSelector, setShowTriggerSelector] = useState(false);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [trigger, setTrigger] = useState<AutomationGraphTrigger | null>(null);
    const [platform, setPlatform] = useState<string | null>(null);

    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

    /*
     * initializedRef prevents the initial graph load from
     * immediately triggering an autosave.
     */
    const initializedRef = useRef(false);

    /*
     * Prevents autosave immediately after loading an existing workflow.
     * Autosave starts only after the user actually changes something.
     */
    const hasUserChangesRef = useRef(false);

    /*
     * savingRef prevents multiple requests from running at
     * the same time.
     */
    const savingRef = useRef(false);

    /*
     * dirtyRef tells the save cycle that another change happened
     * while a previous save was running.
     */
    const dirtyRef = useRef(false);

    const saveTimerRef = useRef<ReturnType<
        typeof setTimeout
    > | null>(null);

    /*
     * Keeps the trigger node's React Flow ID stable.
     *
     * The backend generates a new database trigger ID whenever
     * the graph is saved, so we must NOT rebuild the trigger node
     * from the save response.
     */
    const triggerNodeIdRef = useRef<string>(
        "trigger-placeholder",
    );

    const selectedNodeIdRef = useRef<string | null>(null);

    const getStepNodes = useCallback(
        () =>
            nodes.filter(
                (node) => node.type === "step",
            ),
        [nodes],
    );

    /*
     * Convert the server graph into React Flow state.
     */
    const loadGraph = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            initializedRef.current = false;
            hasUserChangesRef.current = false;
            dirtyRef.current = false;
            setValidationError(null);

            const data = await getAutomationGraph(
                workspaceId,
                automationId,
            );

            const platformAccountId =
                data.automation.platformAccountId;

            let loadedPlatform: string | null = null;

            if (platformAccountId) {
                const account =
                    await getPlatformAccount(
                        workspaceId,
                        platformAccountId,
                    );

                loadedPlatform = account.platform;
                setPlatform(account.platform);
            } else {
                setPlatform(null);
            }

            const loadedTrigger =
                data.triggers[0] ?? null;

            setTrigger(loadedTrigger);
            selectedNodeIdRef.current = null;
            setSelectedNode(null);

            const triggerNodeId = loadedTrigger
                ? `trigger-${loadedTrigger.id}`
                : "trigger-placeholder";

            triggerNodeIdRef.current = triggerNodeId;

            const triggerNode: Node = {
                id: triggerNodeId,
                type: "trigger",
                position: {
                    x: 420,
                    y: 60,
                },
                draggable: false,
                selectable: editable,
                data: {
                    label: loadedTrigger
                        ? loadedTrigger.type
                        : "Choose a trigger",
                    triggerType:
                        loadedTrigger?.type ?? null,
                    platform: loadedPlatform,
                    config:
                        loadedTrigger?.config ?? {},
                    isPlaceholder:
                        !loadedTrigger,
                },
            };

            const stepNodes: Node[] =
                data.steps.map((step) => ({
                    id: step.id,
                    type: "step",
                    position:
                        step.canvasPosition ?? {
                            x: 420,
                            y:
                                250 +
                                step.position * 170,
                        },
                    data: {
                        label: step.type.replaceAll(
                            "_",
                            " ",
                        ),
                        stepType: step.type,
                        config: step.config,
                        platform: loadedPlatform,
                    },
                }));

            const flowEdges: Edge[] =
                data.edges.map((edge) => ({
                    id: edge.id,
                    source: edge.fromStepId,
                    target: edge.toStepId,
                    sourceHandle:
                        edge.branch === "YES"
                            ? "yes"
                            : edge.branch === "NO"
                                ? "no"
                                : edge.branch?.startsWith("PATH_")
                                    ? `path-${edge.branch.slice(5)}`
                                    : "default",
                    targetHandle: "target",
                    label:
                        edge.branch ?? undefined,
                    type: "smoothstep",
                }));

            /*
             * Trigger -> entry step is represented only in
             * React Flow. It is NOT stored in automation_edges.
             */
            if (loadedTrigger?.entryStepId) {
                flowEdges.unshift({
                    id: `trigger-entry-${loadedTrigger.id}`,
                    source: triggerNodeId,
                    target: loadedTrigger.entryStepId,
                    sourceHandle: "default",
                    targetHandle: "target",
                    type: "smoothstep",
                });
            }

            setNodes([
                triggerNode,
                ...stepNodes,
            ]);

            setEdges(flowEdges);

            /*
             * Wait one tick so React Flow receives the loaded state
             * before autosave becomes active.
             */
            window.setTimeout(() => {
                initializedRef.current = true;
            }, 0);
        } catch (err) {
            console.error(
                "Failed to load automation graph",
                err,
            );

            setError(
                "Failed to load automation workflow.",
            );
        } finally {
            setLoading(false);
        }
    }, [
        workspaceId,
        automationId,
        editable,
        setNodes,
        setEdges,
    ]);

    useEffect(() => {
        void loadGraph();

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(saveTimerRef.current);
            }
        };
    }, [loadGraph]);

    const validateGraph = useCallback(() => {
        const stepNodes = nodes.filter(
            (node) => node.type === "step",
        );

        const stepNodeIds = new Set(
            stepNodes.map((node) => node.id),
        );

        const errors: string[] = [];

        if (!trigger) {
            errors.push("Select a trigger before saving.");
        }

        const triggerEntryEdge = edges.find(
            (edge) =>
                edge.source === triggerNodeIdRef.current &&
                Boolean(edge.target),
        );

        if (trigger && !triggerEntryEdge) {
            errors.push(
                "Connect the trigger to the first step.",
            );
        }

        if (stepNodes.length === 0) {
            errors.push(
                "Add at least one step to the automation.",
            );
        }

        for (const node of stepNodes) {
            const outgoingEdges = edges.filter(
                (edge) => edge.source === node.id,
            );

            const incomingEdges = edges.filter(
                (edge) => edge.target === node.id,
            );

            if (
                triggerEntryEdge?.target !== node.id &&
                incomingEdges.length === 0
            ) {
                errors.push(
                    `"${String(node.data?.label ?? node.data?.stepType ?? "Step")}" is not connected to the workflow.`,
                );
            }

            const stepType =
                typeof node.data?.stepType === "string"
                    ? node.data.stepType
                    : "";

            const capability = getStepCapability(
                platform,
                stepType,
            );

            if (capability?.category === "CONDITION") {
                const hasYes = outgoingEdges.some(
                    (edge) =>
                        edge.sourceHandle === "yes",
                );

                const hasNo = outgoingEdges.some(
                    (edge) =>
                        edge.sourceHandle === "no",
                );

                if (!hasYes || !hasNo) {
                    errors.push(
                        `"${String(node.data?.label ?? stepType)}" must have both YES and NO branches connected.`,
                    );
                }
            }

            if (stepType === "RANDOMIZER") {
                const config =
                    typeof node.data?.config === "object" &&
                        node.data.config !== null
                        ? (node.data.config as Record<
                            string,
                            unknown
                        >)
                        : {};

                const pathCount =
                    typeof config.paths === "number"
                        ? Math.min(
                            5,
                            Math.max(2, config.paths),
                        )
                        : 2;

                for (
                    let path = 1;
                    path <= pathCount;
                    path += 1
                ) {
                    const hasPath = outgoingEdges.some(
                        (edge) =>
                            edge.sourceHandle ===
                            `path-${path}`,
                    );

                    if (!hasPath) {
                        errors.push(
                            `"${String(node.data?.label ?? "Randomizer")}" is missing Path ${path}.`,
                        );
                    }
                }
            }
        }

        for (const edge of edges) {
            if (
                edge.id.startsWith("trigger-entry-") ||
                edge.source === triggerNodeIdRef.current
            ) {
                continue;
            }

            if (
                !stepNodeIds.has(edge.source) ||
                !stepNodeIds.has(edge.target)
            ) {
                errors.push(
                    "The workflow contains a connection to a missing step.",
                );

                break;
            }
        }

        return errors;
    }, [
        nodes,
        edges,
        trigger,
        platform,
    ]);

    /*
     * Save the current graph.
     *
     * IMPORTANT:
     * We intentionally do NOT replace nodes/edges with the server
     * response.
     *
     * The backend creates fresh database IDs on every save.
     * React Flow needs to keep its current client IDs stable so
     * trigger.entryStepId and edge references remain valid.
     */
    const performSave = useCallback(async () => {
        if (
            !editable ||
            !initializedRef.current
        ) {
            return;
        }

        if (savingRef.current) {
            dirtyRef.current = true;
            return;
        }

        savingRef.current = true;
        dirtyRef.current = false;

        try {
            const stepNodes = getStepNodes();

            const validationErrors = validateGraph();

            if (validationErrors.length > 0) {
                setValidationError(validationErrors.join(" "));
                return;
            }

            setError(null);

            /*
             * The trigger -> step relationship is represented by a
             * synthetic React Flow edge. Use that edge as the source
             * of truth instead of relying on trigger.entryStepId,
             * because new steps can have temporary client IDs.
             */
            const triggerEntryEdge = edges.find(
                (edge) =>
                    edge.source ===
                        triggerNodeIdRef.current &&
                    Boolean(edge.target),
            );

            const entryStepId =
                triggerEntryEdge?.target ?? null;

            const payload = {
                trigger: trigger
                    ? {
                        type: trigger.type,
                        entryStepId,
                        config:
                            trigger.config ?? {},
                    }
                    : null,

                /*
                 * NEVER remove node.id here.
                 *
                 * New nodes use IDs such as:
                 * new-step-xxxx
                 *
                 * The backend uses those IDs to build stepIdMap.
                 */
                steps: stepNodes.map(
                    (node, index) => ({
                        id: node.id,

                        type:
                            typeof node.data
                                ?.stepType ===
                                "string"
                                ? node.data
                                    .stepType
                                : "UNKNOWN",

                        position: index,

                        config:
                            typeof node.data
                                ?.config ===
                                "object" &&
                                node.data.config !==
                                null
                                ? (node.data
                                    .config as Record<
                                        string,
                                        unknown
                                    >)
                                : {},

                        canvasPosition: {
                            x:
                                node.position
                                    .x,
                            y:
                                node.position
                                    .y,
                        },
                    }),
                ),

                /*
                 * React Flow contains the synthetic trigger edge.
                 * The backend has a separate entryStepId field,
                 * therefore the trigger edge is excluded here.
                 */
                edges: Array.from(
                    new Map(
                        edges
                            .filter(
                                (edge) =>
                                    !edge.id.startsWith(
                                        "trigger-entry-",
                                    ) &&
                                    edge.source !==
                                        triggerNodeIdRef.current,
                            )
                            .map((edge) => {
                                const branch =
                                    edge.sourceHandle === "yes"
                                        ? "YES"
                                        : edge.sourceHandle === "no"
                                            ? "NO"
                                            : edge.sourceHandle?.startsWith("path-")
                                                ? `PATH_${edge.sourceHandle.slice(5)}`
                                                : null;

                                return [
                                    `${edge.source}:${edge.target}`,
                                    {
                                        fromStepId:
                                            edge.source,
                                        toStepId:
                                            edge.target,
                                        branch,
                                    },
                                ];
                            }),
                    ).values(),
                ),
            };

            const savedGraph =
                await saveAutomationGraph(
                    workspaceId,
                    automationId,
                    payload,
                );

            /*
             * The backend creates fresh database step IDs on save.
             * Do not replace the React Flow nodes with those IDs.
             *
             * Only synchronize the local trigger state with the
             * persisted trigger returned by the backend.
             */
            const savedTrigger =
                savedGraph.triggers[0] ?? null;

            if (savedTrigger) {
                setTrigger((current) =>
                    current
                        ? {
                            ...current,
                            id: savedTrigger.id,
                            entryStepId:
                                savedTrigger.entryStepId,
                            updatedAt:
                                savedTrigger.updatedAt,
                        }
                        : current,
                );
            }
        } catch (err) {
            console.error(
                "Failed to save automation graph",
                err,
            );
        } finally {
            savingRef.current = false;

            /*
             * If another change happened while the request was
             * running, schedule another save.
             */
            if (dirtyRef.current) {
                dirtyRef.current = false;

                if (saveTimerRef.current) {
                    clearTimeout(
                        saveTimerRef.current,
                    );
                }

                saveTimerRef.current =
                    window.setTimeout(() => {
                        void performSave();
                    }, 500);
            }
        }
    }, [
        editable,
        workspaceId,
        automationId,
        nodes,
        edges,
        trigger,
        getStepNodes,
        setTrigger,
        validateGraph
    ]);

    /*
     * Debounced autosave.
     *
     * This means actions such as:
     * - adding a step
     * - deleting a step
     * - changing configuration
     * - changing a trigger
     * - creating/removing an edge
     *
     * automatically save after the UI settles.
     */
    useEffect(() => {
        if (
            !editable ||
            !initializedRef.current ||
            !hasUserChangesRef.current
        ) {
            return;
        }

        if (saveTimerRef.current) {
            clearTimeout(
                saveTimerRef.current,
            );
        }

        saveTimerRef.current =
            window.setTimeout(() => {
                void performSave();
            }, 500);

        return () => {
            if (saveTimerRef.current) {
                clearTimeout(
                    saveTimerRef.current,
                );
            }
        };
    }, [
        nodes,
        edges,
        trigger,
        editable,
        performSave,
    ]);

    /*
     * Add a new automation step.
     */
    const handleAddStep = useCallback(
        (type: string) => {
            hasUserChangesRef.current = true;
            setValidationError(null);
            const stepNodes = getStepNodes();

            /*
             * Resolve the selected step from the latest React Flow state.
             * The ref is more reliable than selectedNode because the
             * Add Step menu can be opened/interacted with between renders.
             */
            const selectedStep =
                selectedNodeIdRef.current
                    ? nodes.find(
                        (node) =>
                            node.id ===
                            selectedNodeIdRef.current,
                    ) ?? null
                    : null;

            /*
             * If a step is selected, connect from that step.
             * Otherwise continue from the last step.
             */
            const previousStep =
                selectedStep ??
                stepNodes
                    .slice()
                    .sort(
                        (a, b) =>
                            a.position.y -
                            b.position.y,
                    )
                    .at(-1) ??
                null;

            const newNodeId = createNodeId();

            const newNode: Node = {
                id: newNodeId,
                type: "step",
                position: previousStep
                    ? {
                        x: previousStep.position.x,
                        y:
                            previousStep.position.y +
                            220,
                    }
                    : {
                        x: 420,
                        y: 250,
                    },
                data: {
                    label: type.replaceAll("_", " "),
                    stepType: type,
                    config: {},
                    platform,
                },
            };

            /*
             * Add the new node.
             */
            setNodes((currentNodes) => [
                ...currentNodes,
                newNode,
            ]);

            /*
             * Automatically connect the new node.
             */
            if (previousStep) {
                const previousStepType =
                    String(
                        previousStep.data?.stepType,
                    );

                const previousStepCapability =
                    getStepCapability(
                        platform,
                        previousStepType,
                    );

                const isCondition =
                    previousStepCapability?.category ===
                    "CONDITION";

                const isRandomizer =
                    previousStepType === "RANDOMIZER";

                const previousStepConfig =
                    typeof previousStep.data?.config === "object" &&
                        previousStep.data.config !== null
                        ? (previousStep.data.config as Record<string, unknown>)
                        : {};

                setEdges((currentEdges) => {
                    const alreadyExists =
                        currentEdges.some(
                            (edge) =>
                                edge.source ===
                                previousStep.id &&
                                edge.target === newNodeId,
                        );

                    if (alreadyExists) {
                        return currentEdges;
                    }

                    let sourceHandle = "default";
                    let label: string | undefined;

                    if (isCondition) {
                        sourceHandle = "yes";
                        label = "YES";
                    } else if (isRandomizer) {
                        const pathCount =
                            typeof previousStepConfig
                                ?.paths === "number"
                                ? Math.min(
                                    5,
                                    Math.max(
                                        2,
                                        previousStepConfig.paths,
                                    ),
                                )
                                : 2;

                        const usedPaths = new Set(
                            currentEdges
                                .filter(
                                    (edge) =>
                                        edge.source ===
                                        previousStep.id &&
                                        edge.sourceHandle?.startsWith(
                                            "path-",
                                        ),
                                )
                                .map((edge) =>
                                    Number(
                                        edge.sourceHandle?.slice(5),
                                    ),
                                ),
                        );

                        const availablePath = Array.from(
                            { length: pathCount },
                            (_, index) => index + 1,
                        ).find(
                            (path) => !usedPaths.has(path),
                        );

                        if (availablePath) {
                            sourceHandle = `path-${availablePath}`;
                            label = `PATH ${availablePath}`;
                        }
                    }

                    return [
                        ...currentEdges,
                        {
                            id: createEdgeId(),
                            source: previousStep.id,
                            target: newNodeId,
                            sourceHandle,
                            targetHandle: "target",
                            label,
                            type: "smoothstep",
                        },
                    ];
                });
            } else if (trigger) {
                /*
                 * This is the first step.
                 * Connect it to the trigger visually and persist
                 * the entry step through trigger.entryStepId.
                 */
                const triggerNodeId =
                    triggerNodeIdRef.current;

                setEdges((currentEdges) => [
                    ...currentEdges.filter(
                        (edge) =>
                            !edge.id.startsWith(
                                "trigger-entry-",
                            ),
                    ),
                    {
                        id: `trigger-entry-${triggerNodeId}`,
                        source: triggerNodeId,
                        target: newNodeId,
                        sourceHandle: "default",
                        targetHandle: "target",
                        type: "smoothstep",
                    },
                ]);

                setTrigger((current) =>
                    current
                        ? {
                            ...current,
                            entryStepId:
                                newNodeId,
                        }
                        : current,
                );
            }

            /*
             * The newly created node becomes the selected node.
             */
            selectedNodeIdRef.current = newNodeId;
            setSelectedNode(newNode);

            setShowAddStep(false);
        },
        [
            getStepNodes,
            nodes,
            trigger,
            setNodes,
            setEdges,
            setTrigger,
            platform,
        ],
    );

    /*
     * Manual connection handling.
     */
    const handleConnect = useCallback(
        (connection: Connection) => {
            if (
                !connection.source ||
                !connection.target
            ) {
                return;
            }

            const sourceNode =
                nodes.find(
                    (node) =>
                        node.id ===
                        connection.source,
                );

            if (!sourceNode) {
                return;
            }

            const sourceIsTrigger =
                sourceNode.type ===
                "trigger";

            const branch =
                connection.sourceHandle ===
                    "yes"
                    ? "YES"
                    : connection.sourceHandle ===
                        "no"
                        ? "NO"
                        : connection.sourceHandle?.startsWith("path-")
                            ? `PATH_${connection.sourceHandle.slice(5)}`
                            : null;

            const newEdge: Edge = {
                ...connection,
                id: sourceIsTrigger
                    ? `trigger-entry-${triggerNodeIdRef.current}`
                    : createEdgeId(),
                type: "smoothstep",
                sourceHandle:
                    connection.sourceHandle ??
                    "default",
                targetHandle:
                    connection.targetHandle ??
                    "target",
                label:
                    branch ??
                    undefined,
            };

            setEdges(
                (currentEdges) =>
                    addEdge(
                        newEdge,
                        sourceIsTrigger
                            ? currentEdges.filter(
                                (edge) =>
                                    !edge.id.startsWith(
                                        "trigger-entry-",
                                    ),
                            )
                            : currentEdges,
                    ),
            );

            /*
             * Trigger entry is represented separately
             * in the backend.
             */
            if (sourceIsTrigger) {
                setTrigger(
                    (current) =>
                        current
                            ? {
                                ...current,
                                entryStepId:
                                    connection.target ??
                                    null,
                            }
                            : current,
                );
            }
        },
        [
            nodes,
            setEdges,
        ],
    );

    /*
     * Handle node movement/deletion.
     *
     * The trigger cannot be deleted.
     */
    const handleNodesChange = useCallback((changes: NodeChange[]) => {
        const deletedNodeIds = changes
            .filter((change): change is Extract<NodeChange, { type: "remove" }> =>
                change.type === "remove",
            )
            .map((change) => change.id);

        onNodesChange(changes);

        if (deletedNodeIds.length === 0) {
            return;
        }

        setEdges((currentEdges) =>
            currentEdges.filter(
                (edge) =>
                    !deletedNodeIds.includes(edge.source) &&
                    !deletedNodeIds.includes(edge.target),
            ),
        );

        setSelectedNode((currentSelectedNode) =>
            currentSelectedNode &&
            deletedNodeIds.includes(currentSelectedNode.id)
                ? null
                : currentSelectedNode,
        );

        const triggerEntryStepId = trigger?.entryStepId ?? null;

        if (
            triggerEntryStepId &&
            deletedNodeIds.includes(triggerEntryStepId)
        ) {
            setTrigger((currentTrigger) =>
                currentTrigger
                    ? {
                        ...currentTrigger,
                        entryStepId: null,
                    }
                    : currentTrigger,
            );
        }
    }, [
        onNodesChange,
        setEdges,
        setSelectedNode,
        setTrigger,
        trigger?.entryStepId,
    ]);


    const handleEdgesChange = useCallback(
        (changes: Parameters<typeof onEdgesChange>[0]) => {
            if (changes.length > 0) {
                hasUserChangesRef.current = true;
                setValidationError(null);
            }

            onEdgesChange(changes);
        },
        [onEdgesChange],
    );

    /*
     * Node click.
     */
    const handleNodeClick: NodeMouseHandler =
        useCallback(
            (_event, node) => {
                if (!editable) {
                    return;
                }

                if (node.type === "trigger") {
                    selectedNodeIdRef.current =
                        node.id;

                    setSelectedNode(node);
                    setShowTriggerSelector(true);

                    return;
                }

                if (node.type === "step") {
                    selectedNodeIdRef.current =
                        node.id;

                    setSelectedNode(node);
                }
            },
            [editable],
        );

    /*
     * Update selected node configuration.
     */
    const handleNodeConfigChange =
        useCallback(
            (
                nodeId: string,
                data: Record<
                    string,
                    unknown
                >,
            ) => {
                hasUserChangesRef.current = true;
                setValidationError(null);
                setNodes(
                    (currentNodes) =>
                        currentNodes.map(
                            (node) =>
                                node.id ===
                                    nodeId
                                    ? {
                                        ...node,
                                        data,
                                    }
                                    : node,
                        ),
                );

                setSelectedNode(
                    (currentNode) =>
                        currentNode?.id ===
                            nodeId
                            ? {
                                ...currentNode,
                                data,
                            }
                            : currentNode,
                );

                /*
                 * Trigger configuration is stored in both:
                 * - the React Flow node
                 * - the trigger state used by autosave
                 *
                 * Keep them synchronized.
                 */
                const updatedNode =
                    nodes.find(
                        (node) =>
                            node.id ===
                            nodeId,
                    );

                if (
                    updatedNode?.type ===
                    "trigger"
                ) {
                    setTrigger(
                        (currentTrigger) =>
                            currentTrigger
                                ? {
                                    ...currentTrigger,
                                    config:
                                        typeof data.config ===
                                            "object" &&
                                            data.config !==
                                            null
                                            ? (data.config as Record<
                                                string,
                                                unknown
                                            >)
                                            : {},
                                }
                                : currentTrigger,
                    );
                }
            },
            [
                nodes,
                setNodes,
            ],
        );

    /*
     * Trigger selection.
     */
    const handleTriggerSelect =
        useCallback(
            (selectedTrigger: {
                type: string;
                config?: Record<
                    string,
                    unknown
                >;
            }) => {
                hasUserChangesRef.current = true;
                setValidationError(null);
                const existingTrigger =
                    trigger;

                /*
                 * Keep the local trigger ID stable.
                 *
                 * It does not need to match the database
                 * trigger ID because it is only used by
                 * React Flow.
                 */
                const triggerId =
                    existingTrigger?.id ??
                    crypto.randomUUID();

                const nextTrigger =
                    existingTrigger
                        ? {
                            ...existingTrigger,
                            type:
                                selectedTrigger.type,
                            config:
                                selectedTrigger.config ??
                                {},
                        }
                        : {
                            id: triggerId,
                            automationId,
                            entryStepId:
                                null,
                            type:
                                selectedTrigger.type,
                            config:
                                selectedTrigger.config ??
                                {},
                            createdAt:
                                new Date().toISOString(),
                            updatedAt:
                                new Date().toISOString(),
                        };

                setTrigger(
                    nextTrigger,
                );

                /*
                 * Preserve the existing React Flow
                 * trigger node ID if possible.
                 */
                const currentTriggerNodeId =
                    triggerNodeIdRef.current;

                const nextTriggerData = {
                    label:
                        selectedTrigger.type,
                    triggerType:
                        selectedTrigger.type,
                    platform,
                    config:
                        selectedTrigger.config ??
                        {},
                    isPlaceholder: false,
                };

                setNodes(
                    (currentNodes) =>
                        currentNodes.map(
                            (node) =>
                                node.type ===
                                    "trigger"
                                    ? {
                                        ...node,
                                        id:
                                            currentTriggerNodeId,
                                        data:
                                            nextTriggerData,
                                    }
                                    : node,
                        ),
                );

                /*
                 * Select the trigger so its configuration
                 * panel can be opened immediately.
                 */
                selectedNodeIdRef.current =
                    currentTriggerNodeId;

                setSelectedNode({
                    id: currentTriggerNodeId,
                    type: "trigger",
                    position: {
                        x: 420,
                        y: 60,
                    },
                    draggable: false,
                    selectable: editable,
                    data: nextTriggerData,
                });

                setShowTriggerSelector(
                    false,
                );
            },
            [
                trigger,
                automationId,
                platform,
                editable,
                setNodes,
            ],
        );

    if (loading) {
        return (
            <div className="flex h-[560px] w-full items-center justify-center rounded-2xl border border-border bg-surface sm:h-[640px] lg:h-[740px]">
                <p className="text-sm text-text-secondary">
                    Loading workflow...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[560px] w-full items-center justify-center rounded-2xl border border-danger/20 bg-danger/5 sm:h-[640px] lg:h-[740px]">
                <p className="text-sm text-danger">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="relative h-[560px] min-w-0 w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm sm:h-[640px] lg:h-[740px]">
            {editable && validationError && (
                <div className="absolute left-1/2 top-5 z-30 w-[min(720px,calc(100%-32px))] -translate-x-1/2 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger shadow-lg backdrop-blur">
                    {validationError}
                </div>
            )}
            {editable && (
                <div className="absolute left-2 right-2 top-2 z-20 flex items-center justify-between gap-2 rounded-xl border border-border bg-surface/95 p-1.5 shadow-lg backdrop-blur sm:left-5 sm:right-auto sm:top-5">
                    <button
                        type="button"
                        onClick={() =>
                            setShowTriggerSelector(
                                true,
                            )
                        }
                        className="rounded-lg px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                        Trigger
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            setShowAddStep(
                                (current) =>
                                    !current,
                            )
                        }
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                        + Add step
                    </button>
                </div>
            )}

            {editable &&
                showTriggerSelector && (
                    <TriggerSelector
                        currentType={
                            trigger?.type ??
                            null
                        }
                        onSelect={
                            handleTriggerSelect
                        }
                        onClose={() =>
                            setShowTriggerSelector(
                                false,
                            )
                        }
                    platform={platform}
                    />
                )}

            {editable &&
                showAddStep && (
                    <AddStepMenu
                        onAddStep={
                            handleAddStep
                        }
                    platform={platform}
                    />
                )}

            {editable &&
                selectedNode && (
                    <NodeConfigPanel
                        node={selectedNode}
                        onClose={() =>
                            setSelectedNode(
                                null,
                            )
                        }
                        onChange={
                            handleNodeConfigChange
                        }
                    />
                )}

            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={
                    editable
                        ? handleNodesChange
                        : undefined
                }
                onEdgesChange={
                    editable
                        ? handleEdgesChange
                        : undefined
                }
                onNodeClick={
                    editable
                        ? handleNodeClick
                        : undefined
                }
                onConnect={
                    editable
                        ? handleConnect
                        : undefined
                }
                nodesDraggable={
                    editable
                }
                nodesConnectable={
                    editable
                }
                elementsSelectable={
                    editable
                }
                deleteKeyCode={
                    editable
                        ? [
                            "Backspace",
                            "Delete",
                        ]
                        : null
                }
                fitView
                fitViewOptions={{
                    padding: 0.25,
                    maxZoom: 1,
                }}
                proOptions={{
                    hideAttribution:
                        false,
                }}
                defaultEdgeOptions={{
                    type: "smoothstep",
                }}
                className="automation-flow min-w-0"
            >
                <Background
                    gap={20}
                    size={1}
                />

                <Controls
                    showInteractive={
                        editable
                    }
                    className="!border !border-border !bg-surface !shadow-lg [&_button]:!border-border [&_button]:!bg-surface [&_button]:!text-text-secondary [&_button:hover]:!bg-surface-muted [&_button:hover]:!text-text"
                />

                <MiniMap
                    pannable
                    zoomable
                    className="!border !border-border !bg-surface !shadow-lg"
                />
            </ReactFlow>
        </div>
    );
};

export default AutomationBuilder;