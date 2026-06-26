import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import InteractiveMovieScriptEditor from './editor/InteractiveMovieScriptEditor';
import DetachedFlowPreviewPage from './graph/preview/DetachedFlowPreviewPage';
import { isDetachedFlowPreviewUrl } from './graph/preview/previewSync';

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.render(
    isDetachedFlowPreviewUrl() ? <DetachedFlowPreviewPage /> : <InteractiveMovieScriptEditor />,
    rootElement
  );
}
