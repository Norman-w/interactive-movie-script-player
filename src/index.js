import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import InteractiveMovieScriptEditor from './InteractiveMovieScriptEditor';
import TimeSelector from "./QPScriptInteractors/TimeSelector";

ReactDOM.render(
    // <InteractiveMovieScriptEditor />,
  <TimeSelector></TimeSelector>,
  document.getElementById('root')
);
if (module.hot)
{
  module.hot.accept();
}
