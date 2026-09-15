import { useCallback, useEffect, useRef, useState } from "react";
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

interface AutomationBuilderProps {
    workspaceId: string;
    automationId: string;
    editable?: boolean;
}

const nodeTypes = {
    trigger: TriggerNode,
    step: StepNode,
};

const conditionTypes = new Set([
    "KEYWORD_MATCH",
    "FOLLOWER_STATUS",
]);

const createNodeId = () =>
    `new-step-${crypto.randomUUID()}`;

const createEdgeId = () =>
    `edge-${crypto.randomUUID()}`;

const AutomationBuilder = ({
    workspaceId,
    automationId,
    editable = false,
}: AutomationBuilderProps) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [showAddStep, setShowAddStep] = useState(false);
    const [showTriggerSelector, setShowTriggerSelector] =
        useState(false);

    const [selectedNode, setSelectedNode] =
        useState<Node | null>(null);

    const [trigger, setTrigger] =
        useState<AutomationGraphTrigger | null>(null);

    const [nodes, setNodes, onNodesChange] =
        useNodesState<Node>([]);

    const [edges, setEdges, onEdgesChange] =
        useEdgesState<Edge>([]);

    /*
     * initializedRef prevents the initial graph load from
     * immediately triggering an autosave.
     */
    const initializedRef = useRef(false);

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
            dirtyRef.current = false;

            const data = await getAutomationGraph(
                workspaceId,
                automationId,
            );

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
                    config:
                        loadedTrigger?.config ?? {},
                    isPlaceholder:
                        !loadedTrigger,
                },
            };

            const stepNodes: Node[] = data.steps.map((step) => ({
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
                },
            }));

            const flowEdges: Edge[] = data.edges.map((edge) => ({
                id: edge.id,
                source: edge.fromStepId,
                target: edge.toStepId,
                sourceHandle:
                    edge.branch === "YES"
                        ? "yes"
                        : edge.branch === "NO"
                            ? "no"
                            : "default",
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
            // const triggerNode =
            //     nodes.find(
            //         (node) =>
            //             node.type === "trigger",
            //     );

            // const stepNodes =
            //     getStepNodes();

            // /*
            //  * Find the step connected directly from the trigger.
            //  *
            //  * This ID is a frontend ID. The backend maps it to
            //  * the generated database ID.
            //  */
            // const firstStep =
            //     triggerNode
            //         ? edges.find(
            //             (edge) =>
            //                 edge.source ===
            //                 triggerNode.id &&
            //                 !edge.id.startsWith(
            //                     "trigger-entry-",
            //                 ),
            //         )?.target ?? null
            //         : null;
            const stepNodes = getStepNodes();
            const firstStep = trigger?.entryStepId ?? null;

            const payload = {
                trigger: trigger
                    ? {
                        type: trigger.type,
                        entryStepId:
                            firstStep ?? null,
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
                                        : null;

                                return [
                                    `${edge.source}:${edge.target}`,
                                    {
                                        fromStepId: edge.source,
                                        toStepId: edge.target,
                                        branch,
                                    },
                                ];
                            }),
                    ).values(),
                ),
            };

            await saveAutomationGraph(
                workspaceId,
                automationId,
                payload,
            );
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
            !initializedRef.current
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
    const handleAddStep = useCallback((type: string) => {
        const stepNodes = getStepNodes();

        /*
            * Resolve the selected step from the latest React Flow state.
            * The ref is more reliable than selectedNode because the
            * Add Step menu can be opened/interacted with between renders.
            */
        const selectedStep = selectedNodeIdRef.current
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
                        y: previousStep.position.y + 220,
                    }
                : {
                        x: 420,
                        y: 250,
                    },
            data: {
                label: type.replaceAll("_", " "),
                stepType: type,
                config: {},
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
            const isCondition = conditionTypes.has(
                String(previousStep.data?.stepType),
            );

            setEdges((currentEdges) => {
                const alreadyExists =
                    currentEdges.some(
                        (edge) =>
                            edge.source ===
                                previousStep.id &&
                            edge.target ===
                                newNodeId,
                    );

                if (alreadyExists) {
                    return currentEdges;
                }

                return [
                    ...currentEdges,
                    {
                        id: createEdgeId(),
                        source: previousStep.id,
                        target: newNodeId,
                        sourceHandle:
                            isCondition
                                ? "yes"
                                : "default",
                        targetHandle: "default",
                        label: isCondition
                            ? "YES"
                            : undefined,
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
                    targetHandle: "default",
                    type: "smoothstep",
                },
            ]);

            setTrigger((current) =>
                current
                    ? {
                            ...current,
                            entryStepId: newNodeId,
                        }
                    : current,
            );
        }

        /*
            * The newly created node becomes the selected node.
            * Therefore:
            *
            * Add Step
            *      ↓
            * Step A
            *      ↓
            * Add Step
            *      ↓
            * Step B
            *      ↓
            * Add Step
            *      ↓
            * Step C
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
                        : null;

            const newEdge: Edge = {
                ...connection,
                id: createEdgeId(),
                type: "smoothstep",
                sourceHandle:
                    connection.sourceHandle ??
                    "default",
                targetHandle:
                    connection.targetHandle ??
                    "default",
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
    const handleNodesChange = useCallback(
        (
            changes: Parameters<
                typeof onNodesChange
            >[0],
        ) => {
            const filteredChanges =
                changes.filter(
                    (change) => {
                        if (
                            change.type ===
                            "remove" &&
                            "id" in change
                        ) {
                            return !change.id.startsWith(
                                "trigger-",
                            );
                        }

                        return true;
                    },
                );

            onNodesChange(
                filteredChanges,
            );

            /*
             * Remove edges belonging to deleted nodes.
             */
            const deletedNodeIds =
                new Set(
                    changes
                        .filter(
                            (change) =>
                                change.type ===
                                "remove" &&
                                "id" in
                                change,
                        )
                        .map(
                            (change) =>
                                change.id,
                        ),
                );

            if (
                deletedNodeIds.size === 0
            ) {
                return;
            }

            setEdges(
                (currentEdges) =>
                    currentEdges.filter(
                        (edge) =>
                            !deletedNodeIds.has(
                                edge.source,
                            ) &&
                            !deletedNodeIds.has(
                                edge.target,
                            ),
                    ),
            );

            setSelectedNode(
                (currentNode) =>
                    currentNode &&
                        deletedNodeIds.has(
                            currentNode.id,
                        )
                        ? null
                        : currentNode,
            );

            /*
             * If the entry step was deleted,
             * clear the trigger's entryStepId.
             */
            setTrigger(
                (current) =>
                    current &&
                        current.entryStepId &&
                        deletedNodeIds.has(
                            current.entryStepId,
                        )
                        ? {
                            ...current,
                            entryStepId:
                                null,
                        }
                        : current,
            );
        },
        [
            onNodesChange,
            setEdges,
        ],
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
                    setShowTriggerSelector(true);
                    selectedNodeIdRef.current = node.id;
                    return;
                }

                if (node.type === "step") {
                    selectedNodeIdRef.current = node.id;
                    setSelectedNode(node);
                }
            },
            [editable],
        );

    /*
     * Update selected step configuration.
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
            },
            [setNodes],
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
                                        data: {
                                            ...node.data,
                                            label:
                                                selectedTrigger.type,
                                            triggerType:
                                                selectedTrigger.type,
                                            config:
                                                selectedTrigger.config ??
                                                {},
                                            isPlaceholder:
                                                false,
                                        },
                                    }
                                    : node,
                        ),
                );

                setShowTriggerSelector(
                    false,
                );
            },
            [
                trigger,
                automationId,
                setNodes,
            ],
        );

    if (loading) {
        return (
            <div className="flex h-[620px] w-full items-center justify-center rounded-2xl border border-border bg-surface">
                <p className="text-sm text-text-secondary">
                    Loading workflow...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[620px] w-full items-center justify-center rounded-2xl border border-danger/20 bg-danger/5">
                <p className="text-sm text-danger">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="relative h-[740px] w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
            {editable && (
                <div className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-xl border border-border bg-card/95 p-1.5 shadow-lg backdrop-blur">
                    <button
                        type="button"
                        onClick={() =>
                            setShowTriggerSelector(
                                true,
                            )
                        }
                        className="rounded-lg px-3 py-2 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text"
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
                        className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
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
                    />
                )}

            {editable &&
                showAddStep && (
                    <AddStepMenu
                        onAddStep={
                            handleAddStep
                        }
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
                        ? onEdgesChange
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
                className="automation-flow"
            >
                <Background
                    gap={20}
                    size={1}
                />

                <Controls
                    showInteractive={
                        editable
                    }
                    style={{ background: "black" }}
                />

                <MiniMap
                    pannable
                    zoomable
                    bgColor="black"
                />
            </ReactFlow>
        </div>
    );
};

export default AutomationBuilder;