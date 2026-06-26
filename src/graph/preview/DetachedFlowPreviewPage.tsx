//#region 导入/依赖
import React, { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Spin } from 'antd';
import FlowPreviewPlayer from './FlowPreviewPlayer';
import {
  PreviewSession,
  PreviewSyncMessage,
  publishPreviewMessage,
  readPreviewSession,
  subscribePreviewMessages,
  writePreviewSession,
} from './previewSync';
import classes from './DetachedFlowPreviewPage.module.css';
//#endregion

//#region 视图层
export default function DetachedFlowPreviewPage() {
  const [session, setSession] = useState<PreviewSession | null>(() => readPreviewSession());
  const [loading, setLoading] = useState(() => !readPreviewSession());
  const [activeSnippetIndex, setActiveSnippetIndex] = useState<string | null>(
    session?.activeSnippetIndex ?? session?.entrySnippetIndex ?? null
  );
  const [previewStarted, setPreviewStarted] = useState(Boolean(session?.previewStarted));

  const applySession = useCallback((nextSession: PreviewSession) => {
    setSession(nextSession);
    writePreviewSession(nextSession);
    setLoading(false);
    if (nextSession.activeSnippetIndex) {
      setActiveSnippetIndex(nextSession.activeSnippetIndex);
    }
    if (nextSession.previewStarted) {
      setPreviewStarted(true);
    }
  }, []);

  useEffect(() => {
    const existing = readPreviewSession();
    if (existing?.entrySnippetIndex) {
      applySession(existing);
    } else {
      publishPreviewMessage({ type: 'request-session' });
    }

    const retryTimers = [100, 400, 900].map((delay) =>
      window.setTimeout(() => {
        const cached = readPreviewSession();
        if (cached?.entrySnippetIndex) {
          applySession(cached);
          return;
        }
        publishPreviewMessage({ type: 'request-session' });
      }, delay)
    );

    const stopLoadingTimer = window.setTimeout(() => setLoading(false), 1200);

    return () => {
      retryTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(stopLoadingTimer);
    };
  }, [applySession]);

  useEffect(() => {
    return subscribePreviewMessages((message: PreviewSyncMessage) => {
      if (message.type === 'session') {
        applySession(message.payload);
        return;
      }
      if (message.type === 'snippet' && message.source === 'editor') {
        setActiveSnippetIndex(message.snippetIndex);
        return;
      }
      if (message.type === 'preview-started' && message.source === 'editor') {
        setPreviewStarted(true);
        setActiveSnippetIndex(message.entrySnippetIndex);
      }
      if (message.type === 'preview-stopped' && message.source === 'editor') {
        setPreviewStarted(false);
      }
    });
  }, [applySession]);

  useEffect(() => {
    if (!session) {
      return;
    }
    writePreviewSession({
      ...session,
      activeSnippetIndex,
      previewStarted,
    });
  }, [activeSnippetIndex, previewStarted, session]);

  if (loading) {
    return (
      <div className={classes.emptyWrap}>
        <Spin tip="正在连接蓝图试播放会话…" />
      </div>
    );
  }

  if (!session?.entrySnippetIndex) {
    return (
      <div className={classes.emptyWrap}>
        <Empty description="未找到试播放会话，请从蓝图编排页点击「新窗口」打开" />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <span className={classes.title}>试播放 · 独立窗口</span>
        <span className={classes.hint} title={activeSnippetIndex ?? undefined}>
          {activeSnippetIndex ? `当前: ${activeSnippetIndex}` : '等待播放'}
        </span>
        {!previewStarted && (
          <Button
            type="primary"
            size="small"
            onClick={() => {
              setPreviewStarted(true);
              setActiveSnippetIndex(session.entrySnippetIndex);
            }}
          >
            开始
          </Button>
        )}
      </div>
      <div className={classes.body}>
        <FlowPreviewPlayer
          scripts={session.scripts}
          movieResources={session.movieResources}
          entrySnippetIndex={session.entrySnippetIndex}
          previewStarted={previewStarted}
          syncSource="popup"
          onSnippetChange={setActiveSnippetIndex}
        />
      </div>
    </div>
  );
}
//#endregion
