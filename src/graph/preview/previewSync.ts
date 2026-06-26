//#region 导入/依赖
import { ScriptsMap } from '../types';
//#endregion

//#region 常量/配置
export const PREVIEW_SESSION_STORAGE_KEY = 'ims-flow-preview-session';
export const PREVIEW_SYNC_CHANNEL_NAME = 'ims-flow-preview';

/** 交互式电影播放器设计稿尺寸（16:9） */
export const PREVIEW_DESIGN_WIDTH = 1280;
export const PREVIEW_DESIGN_HEIGHT = 720;
//#endregion

//#region 模型/类型
export type PreviewSyncSource = 'editor' | 'popup';

export interface PreviewSession {
  scripts: ScriptsMap;
  movieResources?: unknown[];
  entrySnippetIndex: string;
  activeSnippetIndex?: string | null;
  previewStarted: boolean;
}

export type PreviewSyncMessage =
  | { type: 'session'; payload: PreviewSession }
  | { type: 'request-session' }
  | { type: 'snippet'; snippetIndex: string; source: PreviewSyncSource }
  | { type: 'preview-started'; entrySnippetIndex: string; source: PreviewSyncSource }
  | { type: 'preview-stopped'; source: PreviewSyncSource };
//#endregion

//#region 私有成员
let sharedChannel: BroadcastChannel | null = null;

function getSharedChannel(): BroadcastChannel | null {
  if (typeof BroadcastChannel === 'undefined') {
    return null;
  }
  if (!sharedChannel) {
    sharedChannel = new BroadcastChannel(PREVIEW_SYNC_CHANNEL_NAME);
  }
  return sharedChannel;
}
//#endregion

//#region 方法/工具
export function writePreviewSession(session: PreviewSession): void {
  try {
    localStorage.setItem(PREVIEW_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('写入试播放会话失败', error);
  }
}

export function readPreviewSession(): PreviewSession | null {
  try {
    const raw = localStorage.getItem(PREVIEW_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as PreviewSession;
  } catch (error) {
    console.error('读取试播放会话失败', error);
    return null;
  }
}

export function publishPreviewMessage(message: PreviewSyncMessage): void {
  getSharedChannel()?.postMessage(message);
}

export function subscribePreviewMessages(
  listener: (message: PreviewSyncMessage) => void
): () => void {
  const channel = getSharedChannel();
  if (!channel) {
    return () => undefined;
  }

  const onMessage = (event: MessageEvent<PreviewSyncMessage>) => {
    listener(event.data);
  };

  channel.addEventListener('message', onMessage);
  return () => {
    channel.removeEventListener('message', onMessage);
  };
}

export function isDetachedFlowPreviewUrl(): boolean {
  return new URLSearchParams(window.location.search).get('preview') === 'flow';
}

export function buildDetachedPreviewUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.set('preview', 'flow');
  return url.toString();
}
//#endregion
