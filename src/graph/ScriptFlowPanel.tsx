//#region 导入/依赖
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  type IsValidConnection,
  type OnConnect,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Empty, message } from 'antd';
import { applyFlowConnection, removeFlowConnection } from './applyFlowConnection';
import PipeFlowEdge from './edges/PipeFlowEdge';
import FloatingPreviewPanel from './FloatingPreviewPanel';
import SnippetNode from './nodes/SnippetNode';
import TransitionMiniNode from './nodes/TransitionMiniNode';
import FlowPreviewPlayer from './preview/FlowPreviewPlayer';
import {
  PreviewSyncMessage,
  buildDetachedPreviewUrl,
  publishPreviewMessage,
  subscribePreviewMessages,
  writePreviewSession,
} from './preview/previewSync';
import { scriptsToFlow } from './scriptsToFlow';
import {
  FLOW_IN_HANDLE,
  FLOW_OUT_HANDLE,
  PIPE_FLOW_EDGE_TYPE,
  ScriptsMap,
  SNIPPET_NODE_TYPE,
  TRANSITION_MINI_NODE_TYPE,
} from './types';
import classes from './ScriptFlowPanel.module.css';
//#endregion

//#region 常量/配置
const nodeTypes = {
  [SNIPPET_NODE_TYPE]: SnippetNode,
  [TRANSITION_MINI_NODE_TYPE]: TransitionMiniNode,
};
const edgeTypes = { [PIPE_FLOW_EDGE_TYPE]: PipeFlowEdge };
//#endregion

//#region 模型/类型
export interface ScriptFlowPanelProps {
  scripts: ScriptsMap;
  movieResources?: unknown[];
  onScriptsChange: (scripts: ScriptsMap) => void;
}
//#endregion

//#region 业务逻辑
function isValidFlowConnection(connection: Connection | Edge): boolean {
  const source = connection.source;
  const target = connection.target;
  const sourceHandle = connection.sourceHandle ?? null;
  const targetHandle = connection.targetHandle ?? null;
  if (!source || !target) {
    return false;
  }
  if (source === target) {
    return false;
  }
  return sourceHandle === FLOW_OUT_HANDLE && targetHandle === FLOW_IN_HANDLE;
}
//#endregion

//#region 视图层
function ScriptFlowPanelInner({
  scripts,
  movieResources,
  onScriptsChange,
}: ScriptFlowPanelProps) {
  const [activeSnippetIndex, setActiveSnippetIndex] = useState<string | null>(null);
  const [previewStarted, setPreviewStarted] = useState(false);
  const [detachedActive, setDetachedActive] = useState(false);
  const detachedWindowRef = useRef<Window | null>(null);

  const flowData = useMemo(
    () => scriptsToFlow(scripts, activeSnippetIndex, previewStarted),
    [scripts, activeSnippetIndex, previewStarted]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowData.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowData.edges);

  const entryIndex = flowData.entrySnippetIndex;
  const entryNode = flowData.nodes.find((n) => n.data.isEntry);

  const publishSession = useCallback(() => {
    if (!entryIndex) {
      return;
    }
    writePreviewSession({
      scripts,
      movieResources,
      entrySnippetIndex: entryIndex,
      activeSnippetIndex,
      previewStarted,
    });
    publishPreviewMessage({
      type: 'session',
      payload: {
        scripts,
        movieResources,
        entrySnippetIndex: entryIndex,
        activeSnippetIndex,
        previewStarted,
      },
    });
  }, [activeSnippetIndex, entryIndex, movieResources, previewStarted, scripts]);

  useEffect(() => {
    setNodes(flowData.nodes);
    setEdges(flowData.edges);
  }, [flowData.nodes, flowData.edges, setNodes, setEdges]);

  useEffect(() => {
    if (!detachedActive) {
      return undefined;
    }
    publishSession();
  }, [detachedActive, publishSession]);

  useEffect(() => {
    return subscribePreviewMessages((message: PreviewSyncMessage) => {
      if (message.type === 'request-session') {
        publishSession();
        return;
      }
      if (message.type === 'snippet' && message.source === 'popup') {
        setActiveSnippetIndex(message.snippetIndex);
        return;
      }
      if (message.type === 'preview-stopped' && message.source === 'popup') {
        setDetachedActive(false);
        detachedWindowRef.current = null;
      }
    });
  }, [publishSession]);

  useEffect(() => {
    if (!detachedActive) {
      return undefined;
    }
    const timer = window.setInterval(() => {
      if (detachedWindowRef.current && detachedWindowRef.current.closed) {
        setDetachedActive(false);
        detachedWindowRef.current = null;
      }
    }, 800);
    return () => window.clearInterval(timer);
  }, [detachedActive]);

  const onSnippetChange = useCallback((index: string) => {
    setActiveSnippetIndex(index);
  }, []);

  const startPreview = useCallback(() => {
    if (!entryIndex) {
      message.warning('未找到主流程起点节点');
      return;
    }
    setPreviewStarted(true);
    setActiveSnippetIndex(entryIndex);
    publishPreviewMessage({
      type: 'preview-started',
      entrySnippetIndex: entryIndex,
      source: 'editor',
    });
    publishSession();
  }, [entryIndex, publishSession]);

  const openDetachedPreview = useCallback(() => {
    if (!entryIndex) {
      message.warning('未找到主流程起点节点');
      return;
    }

    const nextPreviewStarted = previewStarted || true;
    setPreviewStarted(nextPreviewStarted);
    setActiveSnippetIndex((current) => current ?? entryIndex);

    const sessionPayload = {
      scripts,
      movieResources,
      entrySnippetIndex: entryIndex,
      activeSnippetIndex: activeSnippetIndex ?? entryIndex,
      previewStarted: nextPreviewStarted,
    };

    writePreviewSession(sessionPayload);

    const popup = window.open(
      buildDetachedPreviewUrl(),
      'ims-flow-preview',
      'width=1280,height=760'
    );

    if (!popup) {
      message.error('无法打开新窗口，请允许浏览器弹窗');
      return;
    }

    detachedWindowRef.current = popup;
    setDetachedActive(true);

    publishPreviewMessage({ type: 'session', payload: sessionPayload });
    publishPreviewMessage({
      type: 'preview-started',
      entrySnippetIndex: entryIndex,
      source: 'editor',
    });

    window.setTimeout(() => {
      publishPreviewMessage({ type: 'session', payload: sessionPayload });
    }, 200);
  }, [activeSnippetIndex, entryIndex, movieResources, previewStarted, scripts]);

  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (!isValidFlowConnection(connection)) {
        message.warning('仅支持从 flow-out 连接到 flow-in');
        return;
      }
      const nextScripts = applyFlowConnection(scripts, connection);
      onScriptsChange(nextScripts);
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: `redirect-${connection.source}`,
            type: PIPE_FLOW_EDGE_TYPE,
            data: { kind: 'redirect', variant: 'arrow', isFlowing: false, isFromEntry: false },
          },
          eds.filter((e) => e.source !== connection.source || e.data?.kind !== 'redirect')
        )
      );
    },
    [onScriptsChange, scripts, setEdges]
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      let nextScripts = scripts;
      deleted.forEach((edge) => {
        if (edge.data?.kind === 'redirect') {
          nextScripts = removeFlowConnection(nextScripts, edge);
        }
      });
      if (nextScripts !== scripts) {
        onScriptsChange(nextScripts);
      }
    },
    [onScriptsChange, scripts]
  );

  const snippetCount = useMemo(
    () => Object.values(scripts).reduce((n, s) => n + Object.keys(s.snippets ?? {}).length, 0),
    [scripts]
  );

  if (snippetCount === 0) {
    return (
      <div className={classes.emptyWrap}>
        <Empty description="暂无脚本片段，请先在时间轴页添加脚本与片段" />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.graphPane}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgesDelete={onEdgesDelete}
          isValidConnection={isValidFlowConnection as IsValidConnection}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          defaultEdgeOptions={{ type: PIPE_FLOW_EDGE_TYPE }}
          deleteKeyCode={['Backspace', 'Delete']}
        >
          <Panel position="top-left">
            <div className={classes.flowLegend}>
              <div className={classes.flowLegendTitle}>主流程 · 自上而下</div>
              <div className={classes.flowLegendArrow}>
                ↓ 细箭头=直连 · 粗管道=过场 · 播放时弱化非当前路径
              </div>
              {entryNode && (
                <div className={classes.flowLegendEntry}>
                  起点: {entryNode.data.label as string}
                  {entryNode.data.scriptName ? ` (${entryNode.data.scriptName})` : ''}
                </div>
              )}
            </div>
          </Panel>
          <Background gap={16} size={1} />
          <Controls />
          <MiniMap zoomable pannable />
        </ReactFlow>
      </div>
      <FloatingPreviewPanel
        previewStarted={previewStarted}
        activeSnippetIndex={activeSnippetIndex}
        detachedActive={detachedActive}
        onStartPreview={startPreview}
        onOpenDetached={openDetachedPreview}
      >
        {previewStarted && entryIndex ? (
          <FlowPreviewPlayer
            scripts={scripts}
            movieResources={movieResources}
            entrySnippetIndex={entryIndex}
            previewStarted={previewStarted && !detachedActive}
            syncSource="editor"
            onSnippetChange={onSnippetChange}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="点击「开始」试播放"
            style={{ marginTop: 48 }}
          />
        )}
      </FloatingPreviewPanel>
    </div>
  );
}

export default function ScriptFlowPanel(props: ScriptFlowPanelProps) {
  return (
    <ReactFlowProvider>
      <ScriptFlowPanelInner {...props} />
    </ReactFlowProvider>
  );
}
//#endregion
