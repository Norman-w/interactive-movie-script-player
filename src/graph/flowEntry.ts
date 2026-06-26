//#region 导入/依赖
import { ScriptSnippet, ScriptsMap } from './types';
//#endregion

//#region 常量/配置
/** 与播放器默认入口一致的片段 index */
export const DEFAULT_ENTRY_SNIPPET_INDEX = 'introduce.initMovieSet1.info.introduce';
//#endregion

//#region 私有成员
interface SnippetWithScript extends ScriptSnippet {
  scriptId: string;
  scriptName: string;
}

function collectAllSnippets(scripts: ScriptsMap): SnippetWithScript[] {
  const result: SnippetWithScript[] = [];
  Object.keys(scripts).forEach((scriptId) => {
    const script = scripts[scriptId];
    Object.values(script.snippets ?? {}).forEach((snippet) => {
      if (snippet.index) {
        result.push({
          ...snippet,
          scriptId: snippet.scriptId || scriptId,
          scriptName: script.name || scriptId,
        });
      }
    });
  });
  return result;
}

function matchesIntroduceEntry(snippet: SnippetWithScript): boolean {
  const scriptKey = (snippet.scriptId || '').toLowerCase();
  if (scriptKey !== 'introduce') {
    return false;
  }
  if (snippet.type !== 'info') {
    return false;
  }
  return snippet.name === '介绍' || snippet.id === 'introduce';
}
//#endregion

//#region 公开 API
/** 解析主流程起点：优先固定 index，其次 introduce 脚本中的「介绍」info 节点 */
export function resolveEntrySnippetIndex(scripts: ScriptsMap): string | null {
  const all = collectAllSnippets(scripts);
  if (all.length === 0) {
    return null;
  }

  const exact = all.find((s) => s.index === DEFAULT_ENTRY_SNIPPET_INDEX);
  if (exact?.index) {
    return exact.index;
  }

  const introduceEntry = all.find(matchesIntroduceEntry);
  if (introduceEntry?.index) {
    return introduceEntry.index;
  }

  const introduceInfo = all.find(
    (s) => (s.scriptId || '').toLowerCase() === 'introduce' && s.type === 'info'
  );
  if (introduceInfo?.index) {
    return introduceInfo.index;
  }

  return all[0].index ?? null;
}
//#endregion
