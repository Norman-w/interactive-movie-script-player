//#region 导入/依赖
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { getSnippetTypeColors, shortenSnippetIndex } from '../graphTheme';
import { FLOW_IN_HANDLE, FLOW_OUT_HANDLE, TRANSITION_OUT_HANDLE } from '../types';
import classes from './SnippetNode.module.css';
//#endregion

//#region 私有成员
function getHandlePositions(layoutDirection) {
  if (layoutDirection === 'LR') {
    return {
      in: Position.Left,
      out: Position.Right,
      transition: Position.Bottom,
    };
  }
  return {
    in: Position.Top,
    out: Position.Bottom,
    transition: Position.Right,
  };
}
//#endregion

//#region 视图层
function SnippetNodeComponent({ data, selected }) {
  const nodeData = data;
  const colors = getSnippetTypeColors(
    nodeData.snippetType,
    nodeData.isExternal,
    nodeData.isEntry
  );
  const handles = getHandlePositions(nodeData.layoutDirection || 'TB');
  const classNames = [
    classes.node,
    nodeData.isEntry ? classes.entryNode : '',
    nodeData.isDimmed ? classes.dimmed : '',
    nodeData.isActive && !nodeData.isDimmed ? classes.focusActive : '',
    nodeData.isUpcoming && !nodeData.isActive && !nodeData.isDimmed
      ? classes.upcoming
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const nodeStyle = {
    borderColor: colors.border,
    backgroundColor: colors.background,
  };

  return (
    <div className={classNames} style={nodeStyle}>
      {nodeData.isEntry && <div className={classes.entryBadge}>起点</div>}
      <Handle
        id={FLOW_IN_HANDLE}
        type="target"
        position={handles.in}
        className={classes.handleIn}
      />
      <div className={classes.title}>{nodeData.label}</div>
      {nodeData.scriptName && (
        <div className={classes.meta}>脚本: {nodeData.scriptName}</div>
      )}
      <div className={classes.meta}>type: {nodeData.snippetType}</div>
      <div className={classes.index}>{shortenSnippetIndex(nodeData.snippetIndex)}</div>
      {!nodeData.isExternal && nodeData.snippetType !== 'missing' && (
        <>
          <Handle
            id={FLOW_OUT_HANDLE}
            type="source"
            position={handles.out}
            className={classes.handleOut}
          />
          <Handle
            id={TRANSITION_OUT_HANDLE}
            type="source"
            position={handles.transition}
            className={classes.handleTransition}
          />
        </>
      )}
    </div>
  );
}

export default memo(SnippetNodeComponent);
//#endregion
