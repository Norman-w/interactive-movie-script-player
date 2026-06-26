//#region 模型/类型

export interface ScriptSnippet {
  movieId?: string;
  movieUrl?: string;
  id?: string;
  name?: string;
  type?: string;
  startTime?: number;
  endTime?: number;
  actionAtEnd?: string;
  redirectSnippetIndex?: string;
  transitionSnippetIndex?: string;
  scriptId?: string;
  index?: string;
}

export interface ScriptRecord {
  id: string;
  name: string;
  snippets: Record<string, ScriptSnippet>;
}

export type ScriptsMap = Record<string, ScriptRecord>;

export interface SnippetNodeData extends Record<string, unknown> {
  label: string;
  snippetType: string;
  snippetIndex: string;
  scriptId?: string;
  scriptName?: string;
  isExternal?: boolean;
  /** 主流程起点（如 introduce / 介绍） */
  isEntry?: boolean;
  isActive?: boolean;
  /** 试播放时即将从当前节点到达的下一跳 */
  isUpcoming?: boolean;
  /** 试播放时弱化非当前/非下一跳节点 */
  isDimmed?: boolean;
  /** 端口朝向：TB=自上而下，LR=自左而右 */
  layoutDirection?: 'TB' | 'LR';
}

export type FlowEdgeVariant = 'pipe' | 'arrow';

export interface PipeEdgeData extends Record<string, unknown> {
  kind: EdgeKind;
  variant?: FlowEdgeVariant;
  isFlowing?: boolean;
  isFromEntry?: boolean;
  isDimmed?: boolean;
}

export type EdgeKind = 'redirect' | 'transition' | 'interaction';

export const FLOW_IN_HANDLE = 'flow-in';
export const FLOW_OUT_HANDLE = 'flow-out';
export const TRANSITION_OUT_HANDLE = 'transition-out';

export const SNIPPET_NODE_TYPE = 'snippetNode';
export const TRANSITION_MINI_NODE_TYPE = 'transitionMiniNode';
export const PIPE_FLOW_EDGE_TYPE = 'pipeFlow';

//#endregion
