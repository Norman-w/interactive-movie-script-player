//#region 导入/依赖
import { Connection, Edge } from '@xyflow/react';
import { findSnippetByIndex } from './scriptsToFlow';
import { ScriptsMap } from './types';
//#endregion

//#region 私有成员
function cloneScripts(scripts: ScriptsMap): ScriptsMap {
  return JSON.parse(JSON.stringify(scripts)) as ScriptsMap;
}

function findSnippetInScript(
  script: ScriptsMap[string],
  snippetIndex: string
): ScriptsMap[string]['snippets'][string] | null {
  const keys = Object.keys(script.snippets ?? {});
  for (let i = 0; i < keys.length; i++) {
    const snippet = script.snippets[keys[i]];
    if (snippet.index === snippetIndex) {
      return snippet;
    }
  }
  return null;
}
//#endregion

//#region 公开 API
export function applyFlowConnection(scripts: ScriptsMap, connection: Connection): ScriptsMap {
  if (!connection.source || !connection.target) {
    return scripts;
  }

  const owner = findSnippetByIndex(scripts, connection.source);
  if (!owner?.scriptId || !scripts[owner.scriptId]) {
    return scripts;
  }

  const next = cloneScripts(scripts);
  const sourceSnippet = findSnippetInScript(next[owner.scriptId], connection.source);
  if (!sourceSnippet) {
    return scripts;
  }

  sourceSnippet.redirectSnippetIndex = connection.target;
  sourceSnippet.actionAtEnd = 'redirect';
  return next;
}

export function removeFlowConnection(scripts: ScriptsMap, edge: Edge): ScriptsMap {
  if (edge.data?.kind === 'transition' || edge.data?.kind === 'interaction') {
    return scripts;
  }

  const owner = findSnippetByIndex(scripts, edge.source);
  if (!owner?.scriptId || !scripts[owner.scriptId]) {
    return scripts;
  }

  const next = cloneScripts(scripts);
  const sourceSnippet = findSnippetInScript(next[owner.scriptId], edge.source);
  if (!sourceSnippet) {
    return scripts;
  }

  if (sourceSnippet.redirectSnippetIndex === edge.target) {
    delete sourceSnippet.redirectSnippetIndex;
    sourceSnippet.actionAtEnd = 'none';
  }
  return next;
}
//#endregion
