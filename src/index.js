import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import InteractiveMovieScriptPlayer from './InteractiveMovieScriptPlayer';

ReactDOM.render(
  <React.StrictMode>
    <InteractiveMovieScriptPlayer />
  </React.StrictMode>,
  document.getElementById('root')
);
if (module.hot)
{
  module.hot.accept();
}
