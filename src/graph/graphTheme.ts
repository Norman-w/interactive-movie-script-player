//#region 常量/配置

const SNIPPET_TYPE_COLORS: Record<string, { border: string; background: string }> = {
  question: { border: '#fa8c16', background: '#fff7e6' },
  questionWithWaiter: { border: '#fa541c', background: '#fff2e8' },
  info: { border: '#1890ff', background: '#e6f7ff' },
  transitions: { border: '#8c8c8c', background: '#f5f5f5' },
  missing: { border: '#cf1322', background: '#fff1f0' },
};

const DEFAULT_COLORS = { border: '#595959', background: '#fafafa' };
const EXTERNAL_COLORS = { border: '#722ed1', background: '#f9f0ff' };

//#endregion

//#region 方法/工具

export function getSnippetTypeColors(
  snippetType?: string,
  isExternal?: boolean,
  isEntry?: boolean
) {
  if (isEntry) {
    return { border: '#389e0d', background: '#f6ffed' };
  }
  if (isExternal) {
    return EXTERNAL_COLORS;
  }
  if (!snippetType) {
    return DEFAULT_COLORS;
  }
  return SNIPPET_TYPE_COLORS[snippetType] ?? DEFAULT_COLORS;
}

export function shortenSnippetIndex(index: string): string {
  if (index.length <= 28) {
    return index;
  }
  const parts = index.split('.');
  if (parts.length >= 2) {
    return `…${parts.slice(-2).join('.')}`;
  }
  return `…${index.slice(-24)}`;
}

//#endregion
