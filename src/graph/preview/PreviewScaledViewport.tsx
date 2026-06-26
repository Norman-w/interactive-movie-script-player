//#region 导入/依赖
import React, { useEffect, useRef, useState } from 'react';
import {
  PREVIEW_DESIGN_HEIGHT,
  PREVIEW_DESIGN_WIDTH,
} from './previewSync';
import classes from './PreviewScaledViewport.module.css';
//#endregion

//#region 模型/类型
export interface PreviewScaledViewportProps {
  children: React.ReactNode;
  designWidth?: number;
  designHeight?: number;
}
//#endregion

//#region 视图层
export default function PreviewScaledViewport({
  children,
  designWidth = PREVIEW_DESIGN_WIDTH,
  designHeight = PREVIEW_DESIGN_HEIGHT,
}: PreviewScaledViewportProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return undefined;
    }

    const updateScale = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      if (width <= 0 || height <= 0) {
        return;
      }
      const nextScale = Math.min(width / designWidth, height / designHeight);
      setScale(nextScale > 0 ? nextScale : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(element);
    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [designHeight, designWidth]);

  const scaledWidth = designWidth * scale;
  const scaledHeight = designHeight * scale;

  return (
    <div ref={viewportRef} className={classes.viewport}>
      <div
        className={classes.stageWrap}
        style={{ width: scaledWidth, height: scaledHeight }}
      >
        <div
          className={classes.stage}
          style={{
            width: designWidth,
            height: designHeight,
            transform: `scale(${scale})`,
          }}
        >
          <div className={classes.stageInner}>{children}</div>
        </div>
      </div>
    </div>
  );
}
//#endregion
