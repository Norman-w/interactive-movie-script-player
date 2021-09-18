import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import InteractiveMovieScriptEditor from './InteractiveMovieScriptEditor';

ReactDOM.render(
    <InteractiveMovieScriptEditor />,
  document.getElementById('root')
);
if (module.hot)
{
  module.hot.accept();
}
