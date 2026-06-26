//#region 导入/依赖
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CompressOutlined,
  ExpandOutlined,
  ExportOutlined,
} from '@ant-design/icons';
import { Button, Tooltip } from 'antd';
import {
  PREVIEW_DESIGN_HEIGHT,
  PREVIEW_DESIGN_WIDTH,
} from './preview/previewSync';
import classes from './FloatingPreviewPanel.module.css';
//#endregion

//#region 常量/配置
const PANEL_MARGIN = 16;
const DEFAULT_TOP = 56;
const DEFAULT_PANEL_WIDTH = 480;
const MIN_PANEL_WIDTH = 320;
const MAX_PANEL_WIDTH = 960;
const PANEL_ASPECT = PREVIEW_DESIGN_WIDTH / PREVIEW_DESIGN_HEIGHT;
const HEADER_AND_HINT_HEIGHT = 72;
//#endregion

//#region 模型/类型
export type PreviewPanelMode = 'floating' | 'fullscreen';

export interface FloatingPreviewPanelProps {
  previewStarted: boolean;
  activeSnippetIndex: string | null;
  detachedActive: boolean;
  onStartPreview: () => void;
  onOpenDetached: () => void;
  children: React.ReactNode;
}
//#endregion

//#region 视图层
export default function FloatingPreviewPanel({
  previewStarted,
  activeSnippetIndex,
  detachedActive,
  onStartPreview,
  onOpenDetached,
  children,
}: FloatingPreviewPanelProps) {
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
  const [mode, setMode] = useState<PreviewPanelMode>('floating');
  const [position, setPosition] = useState({ x: PANEL_MARGIN, y: DEFAULT_TOP });
  const draggingRef = useRef(false);
  const resizingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
  const resizeStartRef = useRef({ x: 0, width: DEFAULT_PANEL_WIDTH });

  const bodyHeight = Math.round(panelWidth / PANEL_ASPECT);
  const panelHeight = bodyHeight + HEADER_AND_HINT_HEIGHT;
  const isFullscreen = mode === 'fullscreen';

  const resetToTopRight = useCallback(() => {
    if (isFullscreen) {
      return;
    }
    setPosition({
      x: Math.max(PANEL_MARGIN, window.innerWidth - panelWidth - PANEL_MARGIN),
      y: DEFAULT_TOP,
    });
  }, [isFullscreen, panelWidth]);

  useEffect(() => {
    resetToTopRight();
    const onResize = () => resetToTopRight();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [resetToTopRight]);

  const onHeaderPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isFullscreen) {
      return;
    }
    draggingRef.current = true;
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      posX: position.x,
      posY: position.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onHeaderPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || isFullscreen) {
      return;
    }
    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    setPosition({
      x: Math.max(0, dragStartRef.current.posX + dx),
      y: Math.max(0, dragStartRef.current.posY + dy),
    });
  };

  const onHeaderPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    draggingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onResizePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isFullscreen) {
      return;
    }
    resizingRef.current = true;
    resizeStartRef.current = { x: event.clientX, width: panelWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.stopPropagation();
  };

  const onResizePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) {
      return;
    }
    const dx = event.clientX - resizeStartRef.current.x;
    const nextWidth = Math.min(
      MAX_PANEL_WIDTH,
      Math.max(MIN_PANEL_WIDTH, resizeStartRef.current.width + dx)
    );
    setPanelWidth(nextWidth);
  };

  const onResizePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    resizingRef.current = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const toggleFullscreen = () => {
    setMode((current) => (current === 'fullscreen' ? 'floating' : 'fullscreen'));
  };

  return (
    <div
      className={`${classes.panel}${isFullscreen ? ` ${classes.panelFullscreen}` : ''}`}
      style={
        isFullscreen
          ? undefined
          : {
              left: position.x,
              top: position.y,
              width: panelWidth,
              height: panelHeight,
            }
      }
    >
      <div
        className={classes.header}
        onPointerDown={onHeaderPointerDown}
        onPointerMove={onHeaderPointerMove}
        onPointerUp={onHeaderPointerUp}
      >
        <span className={classes.title}>试播放</span>
        <div className={classes.headerActions}>
          {!previewStarted && (
            <Button
              type="primary"
              size="small"
              onClick={onStartPreview}
              onPointerDown={(e) => e.stopPropagation()}
            >
              开始
            </Button>
          )}
          <Tooltip title={isFullscreen ? '退出全屏' : '全屏预览'}>
            <Button
              type="text"
              size="small"
              className={classes.iconBtn}
              icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
              onClick={toggleFullscreen}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </Tooltip>
          <Tooltip title="在新窗口打开（与蓝图同步）">
            <Button
              type="text"
              size="small"
              className={classes.iconBtn}
              icon={<ExportOutlined />}
              onClick={onOpenDetached}
              onPointerDown={(e) => e.stopPropagation()}
            />
          </Tooltip>
        </div>
      </div>
      {activeSnippetIndex && (
        <div className={classes.hint} title={activeSnippetIndex}>
          当前: {activeSnippetIndex}
        </div>
      )}
      <div className={classes.body}>
        {detachedActive ? (
          <div className={classes.bodyPlaceholder}>
            已在独立窗口播放，片段切换会与蓝图同步
          </div>
        ) : (
          children
        )}
      </div>
      {!isFullscreen && (
        <div
          className={classes.resizeHandle}
          onPointerDown={onResizePointerDown}
          onPointerMove={onResizePointerMove}
          onPointerUp={onResizePointerUp}
        />
      )}
    </div>
  );
}
//#endregion
