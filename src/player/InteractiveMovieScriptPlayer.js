import React, {Component} from 'react';
import classNames from './InteractiveMovieScriptPlayer.module.css';
import "video-react/dist/video-react.css"; // import css
import '../video-react-rewrite.css';
import MovieSnippetPlayer from "./MovieSnippetPlayer";
import {message, Tooltip} from "antd";
class InteractiveMovieScriptPlayer extends Component {
  // answerSelectorRef = null;
  snippetPlayer=new MovieSnippetPlayer({});
  //region 页面数据  state
  state =
    {
      currentSnippet:null,
      interactingQuestionSnippet:null,
      //正在交互中的问题类型
      interactingQuestionDom:null,
      showHideInteractingDom:false,
    }
    scripts={};
    snippetsDic={};
    movieResources = [];
  //endregion

  //region  构造函数
  constructor(props) {
    super(props);
    console.log('当前InteractiveMovieScriptPlayer的构造函数给入的参数是:', this.props);
    this.movieResources = this.props.movieResources;
    this.scripts = this.props.scripts;
    this.fillScriptsDic(this.scripts);
  }
  fillScriptsDic(scripts)
  {
    let scriptsKeys = Object.keys(scripts);
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


  componentDidMount() {
    let first = this.getFirstEntrySnippet(this.props.entrySnippetIndex);
    if (!first)
    {
      message.error('未能获取到作为入口的片段信息').then(r => console.log(r));
      return;
    }
    if(this.snippetPlayer)
    {
      this.setState({currentSnippet:first});
      this.snippetPlayer.changeSnippet(first,true);
      if (this.props.onSnippetChange) {
        this.props.onSnippetChange(first.index);
      }
      console.log('设置第一播放片段为:',first);
    }
    else
    {
      console.log('还没有获取到片段播放器');
    }
  }
  //endregion

  //region 获取第一个入口点片段

  getFirstEntrySnippet(index)
  {
    let ret = null;
    let keys = Object.keys(this.snippetsDic);
    for (let i = 0; i < keys.length; i++) {
      let current = this.snippetsDic[keys[i]];
      if (current.index ===index)
      {
        ret = current;
        break;
      }
    }
    return ret;
  }
  //endregion
  //region 根据脚本,返回脚本所需要的交互页面dom
  getInteractionDom(snippet)
  {
    let that = this;
    if (this.props.getInteractionDomFunc) {
      return this.props.getInteractionDomFunc(
        {
          snippet: snippet,
          showHideInteractingDomFunc:(val)=>
          {
            that.setState({showHideInteractingDom:val});
          },
          clearInteractingQuestionFunc: ()=>{
            // console.log('清空问题显示 clearQuestionFunc',);
            that.setState({interactingQuestionSnippet: null, interactingQuestionDom: null});
          },
          changeSnippetFunc: that.changeSnippet.bind(this),
          getSnippetByIndexFunc: (index) => {
            return that.snippetsDic[index];
          }
        }
      );
    }
    else
    {
      return '请指定this.props.getInteractionDomFunc'
    }
  }
  //endregion
  //region 显示交互页面
  showInteractionDom(dom,snippet)
  {
    //如果当前的脚本是让输入手机号码,构造完了设置手机号的dom以后 显示在播放器的上层
    this.setState({interactingQuestionDom:dom,showHideInteractingDom:true}
      ,()=>
      {
        // console.log('显示交互dom:', dom, '所使用的脚本是:', snippet, '脚本的过场是:', snippet.transitionSnippetIndex);
        //设置完以后,如果当前这个脚本视频需要有承接视频,显示承接视频
        if (snippet && snippet.transitionSnippetIndex)
        {
          this.changeSnippet(snippet.transitionSnippetIndex);
        }
      }
    )
  }
  //endregion
  //region 当播放器时间变更
  onSnippetFinished(snippet) {
    if(snippet.type!=='transitions')
    {
      console.log('非过场片段播放完毕,片段是:',snippet.name, snippet);
    }

    if(snippet.type === 'info')
    {
      console.log('赠送视频播放完毕');
      let lastQ = this.state.interactingQuestionSnippet;
      console.log('上一个问题', lastQ);
      if (lastQ)
      {
        let lastQuestionDom = this.getInteractionDom(lastQ);
        this.showInteractionDom(lastQuestionDom, lastQ);
      }
    }
    //region 如果视频需要交互 展示交互页面
    if (snippet.type.indexOf('question') >= 0) {
      let dom = this.getInteractionDom(snippet);
      this.showInteractionDom(dom, snippet);
      this.setState({interactingQuestionSnippet:snippet});
    }
    //endregion
    //region 如果当前视频不用动作直接跳转到下一个视频的话,直接跳转
    if (snippet.redirectSnippetIndex) {
      this.changeSnippet(snippet.redirectSnippetIndex);
    }
      //endregion
    //region 如果当前视频播放完毕后需要播放过场视频的话,转换到播放过场视频
    else if (snippet.transitionSnippetIndex) {
      this.changeSnippet(snippet.transitionSnippetIndex);
    }
      //endregion
    //region 如果当前视频是过场动画,直接进行重播
    else if (snippet.type === 'transitions') {
      this.snippetPlayer.rePlay();
    }
    //endregion
  }
  //endregion

  //region 根据index,变换到指定的片段
  changeSnippet(index)
  {
    let newSnippet = this.snippetsDic[index];
    if (!newSnippet)
    {
      message.error('脚本' + index + '不存在').then(r => console.log(r));
      return;
    }
    // console.log('要播放的新片段是:',this.snippetsDic)
    this.setState({currentSnippet:newSnippet})
    this.snippetPlayer.changeSnippet(newSnippet,true);
    if (this.props.onSnippetChange) {
      this.props.onSnippetChange(index);
    }
  }
  //endregion

  //region 点击了重播按钮
  onClickRePlayBtn ()
  {
  }
  //endregion
  //region 点了跳过按钮
  onClickSkipBtn()
  {
    this.onSnippetFinished(this.state.currentSnippet);
  }
  //endregion

  //region 渲染
  render() {
    let currentSnippet = {};
    if (this.state.currentSnippet)
    {
      currentSnippet = this.state.currentSnippet;
    }
    let masked=currentSnippet.type==='transitions';
    let interactingQuestionDom = this.state.interactingQuestionDom;
    let showHideInteractingDom = this.state.showHideInteractingDom;
    let snippetActionPanelDom = null;
    let enableSnippetAction = true;
    if (enableSnippetAction)
    {
      snippetActionPanelDom = <div className={classNames.snippetControlPanel}>
        <Tooltip title={'重放'}>
          <div className={classNames.rePlayBtn} onClick={()=>{this.onClickRePlayBtn()}}>🔄</div>
        </Tooltip>
        <Tooltip title={'跳过'}>
          <div className={classNames.skipBtn} onClick={()=>{this.onClickSkipBtn()}}>⏭</div>
        </Tooltip>
      </div>
    }

    return (
      <div className={classNames.main}>
        <div className={masked ? classNames.playerMasked : classNames.player}>
          <MovieSnippetPlayer
                              movieId={currentSnippet.movieId}
                              autoPlay={true}
                              startTime={currentSnippet.startTime}
                              endTime={currentSnippet.endTime}
                              movieUrl={currentSnippet.movieUrl}
                              snippet={currentSnippet}
                              onSnippetFinished={(e)=>{this.onSnippetFinished(e)}
                              }
                              ref={e=>
                              {
                                if (e)
                                {
                                  // console.log('设置当前页面播放器组件:',e);
                                  this.snippetPlayer=e;
                                }
                              }
                              }
          />
        </div>
        {showHideInteractingDom&&interactingQuestionDom}
        {
          snippetActionPanelDom
        }
      </div>
    )
  }

  //endregion
}

export default InteractiveMovieScriptPlayer;
