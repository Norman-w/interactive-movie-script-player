//#region 导入/依赖
import { Edge, Node } from '@xyflow/react';
import { SnippetNodeData } from './types';
//#endregion

//#region 公开 API
export interface PlaybackFocus {
  upcomingIds: Set<string>;
}

export function computePlaybackFocus(
  activeSnippetIndex: string | null | undefined,
  previewStarted: boolean,
  edges: Edge[]
): PlaybackFocus {
  const upcomingIds = new Set<string>();
  if (!previewStarted || !activeSnippetIndex) {
    return { upcomingIds };
  }

  edges.forEach((edge) => {
    if (edge.source === activeSnippetIndex) {
      upcomingIds.add(edge.target);
    }
  });

  return { upcomingIds };
}

export function isNodePlaybackFocused(
  nodeId: string,
  activeSnippetIndex: string | null | undefined,
  previewStarted: boolean,
  upcomingIds: Set<string>
): boolean {
  if (!previewStarted || !activeSnippetIndex) {
    return true;
  }
  return nodeId === activeSnippetIndex || upcomingIds.has(nodeId);
}

export function isEdgePlaybackFocused(
  edge: Edge,
  activeSnippetIndex: string | null | undefined,
  previewStarted: boolean
): boolean {
  if (!previewStarted || !activeSnippetIndex) {
    return true;
  }
  return edge.source === activeSnippetIndex || edge.target === activeSnippetIndex;
}

export function applyPlaybackDimming(
  nodes: Node<SnippetNodeData>[],
  edges: Edge[],
  activeSnippetIndex: string | null | undefined,
  previewStarted: boolean
): { nodes: Node<SnippetNodeData>[]; edges: Edge[] } {
  if (!previewStarted || !activeSnippetIndex) {
    return { nodes, edges };
  }

  const { upcomingIds } = computePlaybackFocus(activeSnippetIndex, previewStarted, edges);

  return {
    nodes: nodes.map((node) => {
      const focused = isNodePlaybackFocused(
        node.id,
        activeSnippetIndex,
        previewStarted,
        upcomingIds
      );
      return {
        ...node,
        data: {
          ...node.data,
          isActive: node.id === activeSnippetIndex,
          isUpcoming: upcomingIds.has(node.id),
          isDimmed: !focused,
        },
      };
    }),
    edges: edges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        isDimmed: !isEdgePlaybackFocused(edge, activeSnippetIndex, previewStarted),
      },
    })),
  };
}
//#endregion
