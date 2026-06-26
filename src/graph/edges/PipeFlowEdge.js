//#region 导入/依赖
import React, { memo } from 'react';
import { BaseEdge, MarkerType, getSmoothStepPath } from '@xyflow/react';
import classes from './PipeFlowEdge.module.css';
//#endregion

//#region 私有成员
const PIPE_COLORS = {
  redirect: { outer: '#0958d9', inner: '#1890ff' },
  interaction: { outer: '#ad4e00', inner: '#fa8c16' },
  transition: { outer: '#434343', inner: '#8c8c8c' },
  entry: { outer: '#237804', inner: '#52c41a' },
};

function resolvePipeColors(kind, isFromEntry) {
  if (isFromEntry) {
    return PIPE_COLORS.entry;
  }
  return PIPE_COLORS[kind] ?? PIPE_COLORS.redirect;
}
//#endregion

//#region 视图层
function PipeFlowEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: data?.variant === 'arrow' ? 8 : 16,
  });

  const kind = data?.kind ?? 'redirect';
  const colors = resolvePipeColors(kind, Boolean(data?.isFromEntry));
  const isFlowing = Boolean(data?.isFlowing);
  const isDimmed = Boolean(data?.isDimmed);
  const opacity = isDimmed ? 0.22 : 1;
  const variant = data?.variant ?? 'pipe';

  if (variant === 'arrow') {
    return (
      <>
        <BaseEdge
          id={id}
          path={edgePath}
          markerEnd={{
            type: MarkerType.ArrowClosed,
            width: 18,
            height: 18,
            color: colors.inner,
          }}
          style={{
            stroke: colors.inner,
            strokeWidth: 2,
            opacity,
          }}
        />
        {isFlowing && !isDimmed && (
          <path
            d={edgePath}
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="4 8"
            className={classes.flowChevrons}
          />
        )}
      </>
    );
  }

  const outerWidth = 16;
  const innerWidth = 10;

  return (
    <>
      <BaseEdge
        id={`${id}-outer`}
        path={edgePath}
        style={{
          stroke: colors.outer,
          strokeWidth: outerWidth,
          strokeLinecap: 'round',
          opacity,
        }}
      />
      <BaseEdge
        id={`${id}-inner`}
        path={edgePath}
        style={{
          stroke: colors.inner,
          strokeWidth: innerWidth,
          strokeLinecap: 'round',
          opacity,
        }}
      />
      {isFlowing && !isDimmed && (
        <>
          <path
            d={edgePath}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray="6 10"
            className={classes.flowOverlay}
          />
          <path
            d={edgePath}
            fill="none"
            stroke="#fff"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray="2 6 2 14"
            className={classes.flowChevrons}
          />
        </>
      )}
    </>
  );
}

export default memo(PipeFlowEdgeComponent);
//#endregion
