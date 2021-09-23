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
import MovieSnippetPlayer from "./MovieSnippetPlayer";
import {message} from "antd";
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
  snippetPlayer=null;
  //region 页面数据  state
  state =
    {
      currentSnippet:{},
    }
    scripts={};
    snippetsDic={};
    movieResources = [];
  //endregion

  //region  构造函数
  constructor(props) {
    super(props);
    // console.log('当前InteractiveMovieScriptPlayer的构造函数给入的参数是:', this.props);
    this.movieResources = this.props.movieResources;
    this.scripts = this.props.scripts;
    let scriptsKeys = Object.keys(this.scripts);
    for (let i = 0; i < scriptsKeys.length; i++) {
      let scriptKey = scriptsKeys[i];
      let script = this.scripts[scriptKey];
      // console.log('当前脚本:',script);
      let snippetsKeys = Object.keys(script.snippets);
      for (let j = 0; j < snippetsKeys.length; j++) {
        let snippetKey = snippetsKeys[j];
        let snippet = script.snippets[snippetKey];
        // console.log('当前片段:',snippet);
        this.snippetsDic[snippet.index] = snippet;
      }
    }
  }
  getSnippetFullKey(snippet)
  {
    let ret = snippet.scriptId+'.'+snippet.movieId+'.'+snippet.type+'.'+snippet.id;
    return ret;
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
    let first = this.getFirstEntrySnippet();
    this.setState({currentSnippet:first});
    this.snippetPlayer.changeSnippet(first,true);
    console.log('设置第一播放片段为:',first)
  }
  //endregion

  //region 获取第一个入口点片段

  getFirstEntrySnippet()
  {
    let keys = Object.keys(this.snippetsDic);
    for (let i = 0; i < keys.length; i++) {
      let current = this.snippetsDic[keys[i]];
      if (current.type.indexOf('question') >=0)
      {
        return current;
      }
    }
    return null;
  }
  //endregion

  //region 当播放器时间变更
  onSnippetFinished(snippet)
  {
    // console.log('片段播放完毕,片段是:',snippet);
    if (snippet.transitionSnippetIndex)
    {
      let newSnippet = this.snippetsDic[snippet.transitionSnippetIndex];
      if (!newSnippet)
      {
        message.error('脚本'+ snippet.transitionSnippetIndex+'不存在');
        return;
      }
      // console.log('要播放的新片段是:',this.snippetsDic)
      this.setState({currentSnippet:newSnippet})
      this.snippetPlayer.changeSnippet(newSnippet,true);
    }
    else if(snippet.type==='transitions')
    {
      this.snippetPlayer.rePlay();
    }
  }
  //endregion

  //region 渲染
  render() {
    let masked=false;
    // console.log('渲染播放器,url是:',this.state.currentMovie);
    if (!this.state || !this.state.currentSnippet)
    {
      return '加载中';
    }
    return (
      <div className={classNames.main}>
        <div className={masked ? classNames.playerMasked : classNames.player}>
          <MovieSnippetPlayer
                              movieId={this.state.currentSnippet.movieId}
                              autoPlay={true}
                              startTime={this.state.currentSnippet.startTime}
                              endTime={this.state.currentSnippet.endTime}
                              movieUrl={this.state.currentSnippet.movieUrl}
                              snippet={this.state.currentSnippet}
                              onSnippetFinished={(e)=>{this.onSnippetFinished(e)}
                              }
                              ref={e=>this.snippetPlayer=e}
          />
        </div>
      </div>
    )
  }

  //endregion
}

export default InteractiveMovieScriptPlayer;
