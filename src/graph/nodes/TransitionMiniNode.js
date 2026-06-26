//#region 导入/依赖
import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { FLOW_IN_HANDLE, FLOW_OUT_HANDLE } from '../types';
import classes from './TransitionMiniNode.module.css';
//#endregion

//#region 视图层
function TransitionMiniNodeComponent({ data }) {
  const classNames = [
    classes.node,
    data.isDimmed ? classes.dimmed : '',
    data.isActive && !data.isDimmed ? classes.focusActive : '',
    data.isUpcoming && !data.isActive && !data.isDimmed ? classes.upcoming : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames}>
      <Handle
        id={FLOW_IN_HANDLE}
        type="target"
        position={Position.Top}
        className={classes.handleIn}
      />
      <div className={classes.badge}>过场</div>
      <div className={classes.title}>{data.label}</div>
      <Handle
        id={FLOW_OUT_HANDLE}
        type="source"
        position={Position.Bottom}
        className={classes.handleOut}
      />
    </div>
  );
}

export default memo(TransitionMiniNodeComponent);
//#endregion
