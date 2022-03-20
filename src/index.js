import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import InteractiveMovieScriptEditor from './editor/InteractiveMovieScriptEditor';
import TimeSelector from "./component/TimeSelector";

ReactDOM.render(
    <InteractiveMovieScriptEditor />,
  // <TimeSelector time={{hour:0, Fminute:48, round: 1}} debug={false}></TimeSelector>,
  document.getElementById('root')
);
if (module.hot)
{
  module.hot.accept();
}
