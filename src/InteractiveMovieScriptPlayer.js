import React, {Component} from 'react';
import classNames from './InteractiveMovieScriptPlayer.module.css';
//region  video-react的引用
import {
  Player,
  ControlBar,
  BigPlayButton,
} from 'video-react';
import "video-react/dist/video-react.css"; // import css
import './video-react-rewrite.css';
import ScriptProcessor from "./scriptProcessor";
//endregion

//region 为了让他能有自动的代码提示和为以后结构设计有方向,直接定义了默认结构信息在这里.
const emptyTrigger={
  //触发器的编号
  id:'',
  //触发器的名称 比如  这是个游戏
  text:'',
  //触发器的明细  比如  如果你觉得这是一个游戏,请点击这里,我们会为您继续播放下一个提示视频或下一个提示片段
  desc:'',
  //图片的展示路径
  picPath:'',
  //点击后打开哪个网页
  href:'',
  //点击后把视频跳转到哪个url
  redirectMovieUrl:'',
  //该触发器是否被触发了 比如是否被点击了 点击以后就算是触发了.
  beTriggered:false,
  //是否为有效的trigger
  valid:true,
  //应在多少毫秒处触发事件
  triggerAtMS:0,
  //应该在播放结束后触发该事件
  triggerAtEnd:false,
  //应该在当前视频播放开始时触发事件
  triggerAtStart:false,
}
const emptyStopPoint={
  time: 3.3,
  pause: false,
  pass: false,
  triggers: [
    'movie', 'game'
  ]
}
const emptyMovieInfo =
  {
    //视频的id
    id: '',
    //视频文件的地址
    movieUrl: '',
    //视频封面的地址
    posterUrl: '',
    //视频的卡点信息
    stopPoints: [],
    triggers:[],
  }
//endregion
class InteractiveMovieScriptPlayer extends Component {

  //region 页面数据  state
  state =
    {
      currentMovie: {},
    }
    scriptProcessor = null;
  scripts={};
  //endregion

  //region  构造函数
  constructor(props) {
    super(props);
    this.scripts = this.props.scripts;
    let keys = Object.keys(this.scripts);
    let movies = {};
    let anchors = {};
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let script = this.scripts[key];
      if (script&&script.movies)
      {
        for (let j = 0; j < script.movies.length; j++) {
          let movie = script.movies[j];
          if (movies[movie.id])
          {

          }
          else
          {
            movies[movie.id] = movie;
          }
        }
      }
      if (script&& script.anchors)
      {
        for (let j = 0; j < script.anchors.length; j++) {
          let anchor = script.anchors[j];
          if (anchors[anchor.id])
          {

          }
          else
          {
            anchors[anchor.id] = anchor;
          }
        }
      }
    }
    this.scriptProcessor = new ScriptProcessor(movies,anchors);
    if (movies)
    {
      this.state.currentMovie = movies[keys[0]];
    }
  }

  componentDidMount() {
  }
  //endregion

  //region 当播放器时间变更
  onPlayerTimeUpdate(e)
  {
    let t = e.target.currentTime;
    this.scriptProcessor.getAnchors(this.state.currentMovie.id,0, t);
  }
  //endregion
  //region 渲染
  render() {
    let onClickStartBtn = ()=>{this.player.play()};
    let masked=false;
    return (
      <div className={classNames.main}>
        <div className={masked ? classNames.playerMasked : classNames.player}>
          <Player
            ref={c => {
              this.player = c;
            }}
            poster={this.state.currentMovie.url}
            autoPlay
            src={this.state.currentMovie.posterUrl}
            onTimeUpdate={this.onPlayerTimeUpdate.bind(this)}
          >
            <ControlBar autoHide={false} disableDefaultControls={true} disableCompletely={true}>
            </ControlBar>
            <BigPlayButton position={'hide'}/>
          </Player>
        </div>
        <div className={classNames.controlPanel}
             onClick={onClickStartBtn}
          // onMouseUp={onClickStartBtn}
        >

          <div className={classNames.closeBtn}>X</div>
        </div>
      </div>
    )
  }

  //endregion
}

export default InteractiveMovieScriptPlayer;
