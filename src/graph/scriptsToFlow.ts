//#region 导入/依赖
import { Edge, Node } from '@xyflow/react';
import { resolveEntrySnippetIndex } from './flowEntry';
import { applyPlaybackDimming } from './flowPlaybackFocus';
import { layoutFromEntry } from './flowLayout';
import { PROCESSOR_FLOW_EDGES } from './processorFlowEdges';
import {
  EdgeKind,
  FLOW_IN_HANDLE,
  FLOW_OUT_HANDLE,
  FlowEdgeVariant,
  PIPE_FLOW_EDGE_TYPE,
  ScriptSnippet,
  ScriptsMap,
  SnippetNodeData,
  SNIPPET_NODE_TYPE,
  TRANSITION_MINI_NODE_TYPE,
} from './types';
//#endregion

//#region 私有成员
interface SnippetWithScript extends ScriptSnippet {
  scriptId: string;
  scriptName: string;
}

function collectAllSnippets(scripts: ScriptsMap): SnippetWithScript[] {
  const result: SnippetWithScript[] = [];
  Object.keys(scripts).forEach((scriptId) => {
    const script = scripts[scriptId];
    Object.values(script.snippets ?? {}).forEach((snippet) => {
      if (snippet.index) {
        result.push({
          ...snippet,
          scriptId: snippet.scriptId || scriptId,
          scriptName: script.name || scriptId,
        });
      }
    });
  });
  return result;
}

function buildMissingNodeData(index: string): SnippetNodeData {
  const parts = index.split('.');
  const label = parts.length > 0 ? parts[parts.length - 1] : index;
  return {
    label: `[缺失] ${label}`,
    snippetType: 'missing',
    snippetIndex: index,
    layoutDirection: 'TB',
  };
}

function buildTransitionMiniNodeData(
  snippet: SnippetWithScript,
  activeSnippetIndex?: string | null
): SnippetNodeData {
  return {
    label: snippet.name || snippet.id || '过场',
    snippetType: 'transitions',
    snippetIndex: snippet.index as string,
    scriptId: snippet.scriptId,
    scriptName: snippet.scriptName,
    layoutDirection: 'TB',
    isActive: activeSnippetIndex === snippet.index,
  };
}

function isEdgeFlowing(
  sourceId: string,
  targetId: string,
  activeSnippetIndex: string | null | undefined,
  snippetByIndex: Map<string, SnippetWithScript>
): boolean {
  if (!activeSnippetIndex) {
    return false;
  }
  if (activeSnippetIndex === sourceId) {
    return true;
  }
  const activeSnippet = snippetByIndex.get(activeSnippetIndex);
  if (activeSnippet?.type === 'transitions' && activeSnippetIndex === targetId) {
    return true;
  }
  return false;
}

function buildPipeEdge(
  id: string,
  source: string,
  target: string,
  kind: EdgeKind,
  activeSnippetIndex: string | null | undefined,
  entrySnippetIndex: string | null,
  snippetByIndex: Map<string, SnippetWithScript>,
  options?: { deletable?: boolean; selectable?: boolean; variant?: FlowEdgeVariant }
): Edge {
  const isFromEntry = entrySnippetIndex != null && source === entrySnippetIndex;
  const variant: FlowEdgeVariant =
    options?.variant ?? (kind === 'transition' ? 'pipe' : 'arrow');
  return {
    id,
    source,
    target,
    sourceHandle: FLOW_OUT_HANDLE,
    targetHandle: FLOW_IN_HANDLE,
    type: PIPE_FLOW_EDGE_TYPE,
    deletable: options?.deletable ?? kind === 'redirect',
    selectable: options?.selectable ?? kind !== 'transition',
    data: {
      kind,
      variant,
      isFromEntry,
      isFlowing: isEdgeFlowing(source, target, activeSnippetIndex, snippetByIndex),
    },
  };
}

function ensureTransitionMiniNode(
  nodes: Node<SnippetNodeData>[],
  nodeIds: Set<string>,
  snippet: SnippetWithScript,
  activeSnippetIndex?: string | null
): void {
  const nodeId = snippet.index as string;
  if (nodeIds.has(nodeId)) {
    return;
  }
  nodes.push({
    id: nodeId,
    type: TRANSITION_MINI_NODE_TYPE,
    position: { x: 0, y: 0 },
    data: buildTransitionMiniNodeData(snippet, activeSnippetIndex),
    selected: activeSnippetIndex === nodeId,
    draggable: true,
  });
  nodeIds.add(nodeId);
}

function addPipeConnection(
  edges: Edge[],
  nodes: Node<SnippetNodeData>[],
  nodeIds: Set<string>,
  snippetByIndex: Map<string, SnippetWithScript>,
  edgePairs: Set<string>,
  sourceId: string,
  targetId: string,
  kind: EdgeKind,
  activeSnippetIndex: string | null | undefined,
  entrySnippetIndex: string | null,
  indexSet: Set<string>
): void {
  const sourceSnippet = snippetByIndex.get(sourceId);
  const transitionId = sourceSnippet?.transitionSnippetIndex;
  const useTransitionWaypoint =
    transitionId != null &&
    transitionId !== targetId &&
    indexSet.has(transitionId);

  if (useTransitionWaypoint) {
    const transitionSnippet = snippetByIndex.get(transitionId);
    if (transitionSnippet) {
      ensureTransitionMiniNode(nodes, nodeIds, transitionSnippet, activeSnippetIndex);
    }

    const firstLeg = `${sourceId}->${transitionId}`;
    if (!edgePairs.has(firstLeg)) {
      edges.push(
        buildPipeEdge(
          `pipe-${firstLeg}`,
          sourceId,
          transitionId,
          'transition',
          activeSnippetIndex,
          entrySnippetIndex,
          snippetByIndex,
          { deletable: false, selectable: false, variant: 'pipe' }
        )
      );
      edgePairs.add(firstLeg);
    }

    const secondLeg = `${transitionId}->${targetId}`;
    if (!edgePairs.has(secondLeg)) {
      edges.push(
        buildPipeEdge(
          `pipe-${secondLeg}`,
          transitionId,
          targetId,
          kind,
          activeSnippetIndex,
          entrySnippetIndex,
          snippetByIndex,
          {
            deletable: kind === 'redirect',
            selectable: kind !== 'transition',
            variant: 'pipe',
          }
        )
      );
      edgePairs.add(secondLeg);
    }
    return;
  }

  const directLeg = `${sourceId}->${targetId}`;
  if (edgePairs.has(directLeg)) {
    return;
  }

  edges.push(
    buildPipeEdge(
      `pipe-${directLeg}`,
      sourceId,
      targetId,
      kind,
      activeSnippetIndex,
      entrySnippetIndex,
      snippetByIndex,
      { deletable: kind === 'redirect', selectable: kind !== 'transition', variant: 'arrow' }
    )
  );
  edgePairs.add(directLeg);
}

function appendProcessorFlowEdges(
  edges: Edge[],
  nodes: Node<SnippetNodeData>[],
  nodeIds: Set<string>,
  snippetByIndex: Map<string, SnippetWithScript>,
  edgePairs: Set<string>,
  indexSet: Set<string>,
  missingIndices: Set<string>,
  activeSnippetIndex: string | null | undefined,
  entrySnippetIndex: string | null
): void {
  PROCESSOR_FLOW_EDGES.forEach((processorEdge) => {
    if (!processorEdge.target || !indexSet.has(processorEdge.source)) {
      return;
    }
    if (!indexSet.has(processorEdge.target)) {
      missingIndices.add(processorEdge.target);
    }

    addPipeConnection(
      edges,
      nodes,
      nodeIds,
      snippetByIndex,
      edgePairs,
      processorEdge.source,
      processorEdge.target,
      'interaction',
      activeSnippetIndex,
      entrySnippetIndex,
      indexSet
    );
  });
}
//#endregion

//#region 公开 API
export function findSnippetByIndex(scripts: ScriptsMap, index: string): SnippetWithScript | null {
  const all = collectAllSnippets(scripts);
  for (let i = 0; i < all.length; i++) {
    if (all[i].index === index) {
      return all[i];
    }
  }
  return null;
}

export function scriptsToFlow(
  scripts: ScriptsMap,
  activeSnippetIndex?: string | null,
  previewStarted = false
): { nodes: Node<SnippetNodeData>[]; edges: Edge[]; entrySnippetIndex: string | null } {
  const snippetList = collectAllSnippets(scripts);
  if (snippetList.length === 0) {
    return { nodes: [], edges: [], entrySnippetIndex: null };
  }

  const entrySnippetIndex = resolveEntrySnippetIndex(scripts);
  const indexSet = new Set(snippetList.map((s) => s.index as string));
  const snippetByIndex = new Map(snippetList.map((s) => [s.index as string, s]));
  const missingIndices = new Set<string>();
  const transitionWaypointIds = new Set<string>();

  snippetList.forEach((snippet) => {
    if (snippet.redirectSnippetIndex && !indexSet.has(snippet.redirectSnippetIndex)) {
      missingIndices.add(snippet.redirectSnippetIndex);
    }
    if (snippet.transitionSnippetIndex) {
      transitionWaypointIds.add(snippet.transitionSnippetIndex);
      if (!indexSet.has(snippet.transitionSnippetIndex)) {
        missingIndices.add(snippet.transitionSnippetIndex);
      }
    }
  });

  PROCESSOR_FLOW_EDGES.forEach((processorEdge) => {
    if (
      processorEdge.target &&
      indexSet.has(processorEdge.source) &&
      !indexSet.has(processorEdge.target)
    ) {
      missingIndices.add(processorEdge.target);
    }
  });

  const nodeIds = new Set<string>();
  const nodes: Node<SnippetNodeData>[] = [];

  snippetList.forEach((snippet) => {
    const snippetIndex = snippet.index as string;
    const isTransitionWaypoint =
      snippet.type === 'transitions' && transitionWaypointIds.has(snippetIndex);

    if (isTransitionWaypoint) {
      return;
    }

    if (snippet.type === 'transitions') {
      ensureTransitionMiniNode(nodes, nodeIds, snippet, activeSnippetIndex);
      return;
    }

    nodes.push({
      id: snippetIndex,
      type: SNIPPET_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: {
        label: snippet.name || snippet.id || snippet.index || '',
        snippetType: snippet.type || 'info',
        snippetIndex,
        scriptId: snippet.scriptId,
        scriptName: snippet.scriptName,
        layoutDirection: 'TB',
        isEntry: entrySnippetIndex != null && snippet.index === entrySnippetIndex,
        isActive: activeSnippetIndex === snippet.index,
      },
      selected: activeSnippetIndex === snippet.index,
    });
    nodeIds.add(snippetIndex);
  });

  missingIndices.forEach((index) => {
    if (nodeIds.has(index)) {
      return;
    }
    nodes.push({
      id: index,
      type: SNIPPET_NODE_TYPE,
      position: { x: 0, y: 0 },
      data: buildMissingNodeData(index),
      selectable: false,
      draggable: true,
    });
    nodeIds.add(index);
  });

  const edges: Edge[] = [];
  const edgePairs = new Set<string>();

  snippetList.forEach((snippet) => {
    const sourceId = snippet.index as string;
    if (snippet.redirectSnippetIndex) {
      addPipeConnection(
        edges,
        nodes,
        nodeIds,
        snippetByIndex,
        edgePairs,
        sourceId,
        snippet.redirectSnippetIndex,
        'redirect',
        activeSnippetIndex,
        entrySnippetIndex,
        indexSet
      );
    }
  });

  appendProcessorFlowEdges(
    edges,
    nodes,
    nodeIds,
    snippetByIndex,
    edgePairs,
    indexSet,
    missingIndices,
    activeSnippetIndex,
    entrySnippetIndex
  );

  snippetList.forEach((snippet) => {
    const sourceId = snippet.index as string;
    const transitionId = snippet.transitionSnippetIndex;
    if (!transitionId || !indexSet.has(transitionId)) {
      return;
    }

    const transitionSnippet = snippetByIndex.get(transitionId);
    if (transitionSnippet) {
      ensureTransitionMiniNode(nodes, nodeIds, transitionSnippet, activeSnippetIndex);
    }

    const overtureLeg = `${sourceId}->${transitionId}`;
    if (edgePairs.has(overtureLeg)) {
      return;
    }

    edges.push(
      buildPipeEdge(
        `pipe-${overtureLeg}`,
        sourceId,
        transitionId,
        'transition',
        activeSnippetIndex,
        entrySnippetIndex,
        snippetByIndex,
        { deletable: false, selectable: false, variant: 'pipe' }
      )
    );
    edgePairs.add(overtureLeg);
  });

  const layoutRoot = entrySnippetIndex ?? nodes[0]?.id ?? null;
  const layoutedNodes =
    layoutRoot != null ? layoutFromEntry(layoutRoot, nodes, edges) : nodes;

  const dimmed = applyPlaybackDimming(
    layoutedNodes,
    edges,
    activeSnippetIndex,
    previewStarted
  );

  return {
    nodes: dimmed.nodes,
    edges: dimmed.edges,
    entrySnippetIndex,
  };
}
//#endregion
