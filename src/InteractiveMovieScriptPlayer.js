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
      currentMovieId:'',
      lastPausePos:0,
    }
    scriptProcessor = null;
  scripts={};
  currentAnchor=null;
  //endregion

  //region  构造函数
  constructor(props) {
    super(props);
    console.log('当前InteractiveMovieScriptPlayer的构造函数给入的参数是:', this.props);
    this.scripts = this.props.scripts;
    let keys = Object.keys(this.props.scripts);
    let movies = {};
    let anchors = {};
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let script = this.scripts[key];
      console.log('当前脚本:', script);
      if (script && script.movies) {
        let a = movies;
        movies = {...a, ...script.movies};
      }
      if (script && script.anchors) {

        let a = anchors;
        anchors = {...a, ...script.anchors};
      }
      this.scriptProcessor = new ScriptProcessor(movies, anchors);
    }
    if (movies) {
      let movieKeys = Object.keys(movies);
      this.state.currentMovie = movies[movieKeys[0]];
      this.state.currentMovieId = movieKeys[0];
    }
    // console.log('InteractiveMovieScriptPlayer构造函数完成,movies:', movies, 'scripts:', this.scripts);
    console.log('当前的movie', this.state.currentMovie)
  }
  jsonField2Array(jsonObj)
  {
    let ret = [];
    let keys = Object.keys(jsonObj);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let field = jsonObj[key];
      ret.push(field);
    }
    return ret;
  }

  componentDidMount() {
  }
  //endregion

  //region 当播放器时间变更
  onPlayerTimeUpdate(e)
  {
    if (this.currentAnchor)
    {
      console.log('获取到了锚点,你是在获取到了锚点以后没有没有及时停止导致的播放器时间又更新了,你等 等一会的', this.currentAnchor);
      return;
    }
    // console.log('时间更新',e.target.currentTime, this.state.currentMovie);
    let t = e.target.currentTime;
    let anchor = this.scriptProcessor.getAnchors(this.state.currentMovieId,this.state.lastPausePos, t);
    if (anchor)
    {
      // this.currentAnchor= anchor;
      console.log('获取到了anchor', anchor);
      // this.player.pause();
      // this.player.seek(anchor.end);
      this.player.seek(anchor.start);
    }
  }
  //endregion
  //region 暂停
  onPause(e)
  {
    this.setState({lastPausePos: e.target.currentTime}
    ,e=>{
        console.log('上次停止时间:', this.state.lastPausePos)
      }
    );
  }
  //endregion
  //region 开始播放
  onPlay(e)
  {
    console.log('视频开始播放了:', e);
  }
  //endregion
  //region 渲染
  render() {
    let onClickStartBtn = ()=>{this.player.play();
    // console.log('播放了视频')
    };
    let masked=false;
    // console.log('渲染播放器,url是:',this.state.currentMovie);
    return (
      <div className={classNames.main}>
        <div className={masked ? classNames.playerMasked : classNames.player}>
          <Player
            ref={c => {
              this.player = c;
            }}
            poster={this.state.currentMovie.posterUrl}
            autoPlay
            src={this.state.currentMovie.movieUrl}
            onTimeUpdate={this.onPlayerTimeUpdate.bind(this)}
            onPause={this.onPause.bind(this)}
            onPlay={this.onPlay.bind(this)}
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
