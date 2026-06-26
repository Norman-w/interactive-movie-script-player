//#region 导入/依赖
import { Edge, Node } from '@xyflow/react';
import { SnippetNodeData } from './types';
//#endregion

//#region 常量/配置
const NODE_WIDTH = 220;
const LAYER_GAP_Y = 150;
const NODE_GAP_X = 260;
//#endregion

//#region 私有成员
function buildForwardAdjacency(edges: Edge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (!adj.has(edge.source)) {
      adj.set(edge.source, []);
    }
    const targets = adj.get(edge.source)!;
    if (!targets.includes(edge.target)) {
      targets.push(edge.target);
    }
  });
  return adj;
}

function bfsLayers(entryId: string, adj: Map<string, string[]>): string[][] {
  const layers: string[][] = [];
  const assigned = new Set<string>();
  let frontier = [entryId];

  while (frontier.length > 0) {
    const layer: string[] = [];
    const nextFrontier: string[] = [];

    frontier.forEach((nodeId) => {
      if (assigned.has(nodeId)) {
        return;
      }
      assigned.add(nodeId);
      layer.push(nodeId);
    });

    if (layer.length > 0) {
      layers.push(layer);
    }

    layer.forEach((nodeId) => {
      (adj.get(nodeId) ?? []).forEach((targetId) => {
        if (!assigned.has(targetId) && !nextFrontier.includes(targetId)) {
          nextFrontier.push(targetId);
        }
      });
    });

    frontier = nextFrontier;
  }

  return layers;
}

function positionLayers(layers: string[][]): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  layers.forEach((layer, layerIndex) => {
    const rowWidth = Math.max(layer.length - 1, 0) * NODE_GAP_X;
    layer.forEach((nodeId, indexInLayer) => {
      positions.set(nodeId, {
        x: indexInLayer * NODE_GAP_X - rowWidth / 2,
        y: layerIndex * LAYER_GAP_Y,
      });
    });
  });

  return positions;
}
//#endregion

//#region 公开 API
/**
 * 以 entry 为根自上而下分层布局，同层节点横向展开以体现分叉。
 * 未接入主流程的节点排在最下方独立一行。
 */
export function layoutFromEntry(
  entryId: string,
  nodes: Node<SnippetNodeData>[],
  edges: Edge[]
): Node<SnippetNodeData>[] {
  if (nodes.length === 0) {
    return nodes;
  }

  const adj = buildForwardAdjacency(edges);
  const layers = bfsLayers(entryId, adj);
  const placedIds = new Set<string>();
  layers.forEach((layer) => layer.forEach((id) => placedIds.add(id)));

  const orphans = nodes.filter((n) => !placedIds.has(n.id)).map((n) => n.id);
  if (orphans.length > 0) {
    layers.push(orphans);
  }

  const positions = positionLayers(layers);
  const orphanY = layers.length * LAYER_GAP_Y;

  return nodes.map((node) => {
    const pos = positions.get(node.id);
    return {
      ...node,
      position: pos ?? { x: 0, y: orphanY },
    };
  });
}

export { NODE_WIDTH, LAYER_GAP_Y, NODE_GAP_X };
//#endregion
