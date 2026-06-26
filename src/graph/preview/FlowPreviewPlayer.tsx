//#region 导入/依赖
import React, { useCallback } from 'react';
import InteractiveMovieScriptPlayer from '../../player/InteractiveMovieScriptPlayer';
import scriptProcessor from '../../processor/QPScriptProcessor';
import { ScriptsMap } from '../types';
import PreviewScaledViewport from './PreviewScaledViewport';
import {
  PreviewSyncSource,
  publishPreviewMessage,
} from './previewSync';
//#endregion

//#region 模型/类型
export interface FlowPreviewPlayerProps {
  scripts: ScriptsMap;
  movieResources?: unknown[];
  entrySnippetIndex: string;
  previewStarted: boolean;
  syncSource: PreviewSyncSource;
  onSnippetChange: (snippetIndex: string) => void;
}
//#endregion

//#region 视图层
export default function FlowPreviewPlayer({
  scripts,
  movieResources,
  entrySnippetIndex,
  previewStarted,
  syncSource,
  onSnippetChange,
}: FlowPreviewPlayerProps) {
  const handleSnippetChange = useCallback(
    (snippetIndex: string) => {
      onSnippetChange(snippetIndex);
      publishPreviewMessage({
        type: 'snippet',
        snippetIndex,
        source: syncSource,
      });
    },
    [onSnippetChange, syncSource]
  );

  if (!previewStarted) {
    return null;
  }

  return (
    <PreviewScaledViewport>
      <InteractiveMovieScriptPlayer
        key={`flow-preview-${entrySnippetIndex}-${previewStarted}`}
        scripts={scripts}
        movieResources={movieResources}
        entrySnippetIndex={entrySnippetIndex}
        getInteractionDomFunc={scriptProcessor.getInteractionDom.bind(scriptProcessor)}
        onSnippetChange={handleSnippetChange}
      />
    </PreviewScaledViewport>
  );
}
//#endregion
