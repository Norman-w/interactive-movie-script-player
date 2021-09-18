import React, {Component} from 'react';
import {Slider, Button, Switch,Steps} from 'antd';
import classNames from './InteractiveMovieScriptEditor.module.css';
import 'antd/dist/antd.css'
//region  video-react的引用
import {
    Player,
    ControlBar,
    BigPlayButton,
} from 'video-react';
import "video-react/dist/video-react.css"; // import css
import './video-react-rewrite.css';
//endregion

import MovieScriptFactory from './movieScriptFactory' ;
import JsonComparer from "./jsonComparer";



const { Step } = Steps;


class InteractiveMovieScriptEditor extends Component {
    state={
        currentMovieUrl: 'https://www.enni.group/file/testmovie/2.MP4',
        currentPosterUrl: 'https://www.enni.group/file/test2.png',
        currentMovieState:null,
        timeSliderRange:0,
        timeSliderValue:0,
        timeSliderMarks:{},
        authPlayWhenSlid: false,
        playerPlaying:false,
    }
    //视频文件是否正在加载中
    movieLoading=false;
    //视频刚加载出来以后的状态信息,主要用于视频的时长获取并更新slider的长度信息
    initMovieState=null;
    //当前进度条控件是否在滑动中
    timeSliderSeeking=false;
    //拖动滚动条以后是否自动播放

    componentDidMount() {
        if (this.player) {
            this.player.subscribeToStateChange(this.handleStateChange.bind(this));
        }
    }

    //endregion

    //region 视频状态有变更 包括人的操作和视频主动发出来的时间变化之类的
    handleStateChange(state, prevState) {
      // console.log(prevState);return;
      // let jc = new JsonComparer();
      // let ret = jc.Compare(state, prevState);
        // console.log(ret);
      //视频的初始加载
        if (!this.initMovieState && state.duration)
        {
            this.initMovieState = state;
            this.setState({timeSliderRange:state.duration});
            console.log('加载完了视频,设置时间为:',state.duration);
        }
        else
        {
          return;
            // console.log(state);
            //currentTime: 1.950439
            //如果正在拖动,不更新进度条,如果是正在暂停状态 也不更新进度条.因为暂停的时候 并不会因为状态变更而触发进度条.
          //暂停的时候不更新进度条 解决了用户拖动以后 这个函数被调用 然后又重新设置了进度条 而重新设置进度条和拖动的不一致的问题
            if(!this.timeSliderSeeking && !this.state.playerPlaying) {
                this.setState({timeSliderValue: state.currentTime});
            }
        }
    }
    //endregion
    //region 当时间轴发生变化的时候
    onTimeSliderChange(e)
    {
        this.timeSliderSeeking = true;
        // console.log(e);
        this.setState({timeSliderValue:e});
    }
    //endregion
    //region 当时间轴发生鼠标抬起后变化的时候
    onTimeSliderAfterChange(e)
    {
        // console.log(e);
        this.player.seek(e);
        let playerState = this.player.getState().player;
        let paused = playerState.paused;
        console.log(this.player);
        if (this.state.authPlayWhenSlid) {
            if (paused) {
                this.player.play();
            }
        }
        else {
            // console.log();
            if (!paused) {
                this.player.pause();
            }
        }
        this.timeSliderSeeking=false;
    }
    //endregion
    //region 切换是否自动播放
    onAutoPlayChange(e)
    {
        this.setState({authPlayWhenSlid:e});
        // this.authPlayWhenSlid = e;
        // console.log(e)
    }
    //endregion
    //region 点击了添加节点信息
    onClickAddAnchorBtn(e)
    {
        let currentNode = this.state.timeSliderValue;
        let o = this.state.timeSliderMarks;
        // o[currentNode] = ''+currentNode;
        let keys = Object.keys(o);
        o[currentNode] = ''+keys.length;
        this.setState({timeSliderMarks:o});
        console.log('现在的节点是:',o);
    }
    //endregion
    //region 点击了删除节点信息
    onClickRemoveAnchorBtn(e)
    {
        let playerState = this.player.getState();
        console.log(playerState)
        if (playerState.player.paused)
        {
            let marks = this.state.timeSliderMarks;
            console.log('删除前:',marks);
            delete marks[this.state.timeSliderValue];
            console.log('删除后:', marks);
            this.setState({timeSliderMarks:marks})
        }
    }
    //endregion
    //region 播放器暂停事件
    onPlayerPause(e)
    {
        this.setState({playerPlaying:false});
    }
    //endregion
    //region 播放器开始播放事件
    onPlayerPlay(e)
    {
        this.setState({playerPlaying:true});
    }
    //endregion
  //region 当播放器的当前播放时间更新
  onPlayerTimeUpdate(e)
  {
    this.setState({timeSliderValue:e.target.currentTime});
  }
  //endregion
    render() {
        let movieUrl = this.state.currentMovieUrl;
        let posterUrl = this.state.currentPosterUrl;
        let duration = this.state.timeSliderRange;
        let onAutoPlayChange = this.onAutoPlayChange.bind(this);
        let onClickAddAnchorBtn = this.onClickAddAnchorBtn.bind(this);
        let onClickRemoveAnchorBtn = this.onClickRemoveAnchorBtn.bind(this);
        let sliderMarks = this.state.timeSliderMarks;
        let onPlayerTimeUpdate = this.onPlayerTimeUpdate.bind(this);
        let tipFormatter = (value)=>
        {
            let sec = value/1000;
            // let mil = value%1000;
            // return ''+sec+'.'+mil;
            return sec;
        }
        return (
            <div className={classNames.main}>
                <Player
                    ref={c => {
                        this.player = c;
                    }}
                    poster={posterUrl}
                    // autoPlay
                    src={movieUrl}
                    onPause={this.onPlayerPause.bind(this)}
                    onPlay={this.onPlayerPlay.bind(this)}
                    onTimeUpdate={(e)=>{
                      // console.log('时间更新',e,e.timeStamp);
                      onPlayerTimeUpdate(e)}}
                >
                    <ControlBar autoHide={false} disableDefaultControls={true} disableCompletely={true}>
                    </ControlBar>
                    <BigPlayButton position={'hide'}/>
                </Player>
                <div id={'下方时间轴和按钮'} className={classNames.editorBottomLine}>
                    <div id={'编辑器内部'} className={classNames.editorContent}>
                        <div id={'按钮集'} className={classNames.buttons}>
                            <div className={classNames.lineFlexRow}><div>拖拽后自动播放</div><Switch checked={this.state.authPlayWhenSlid}  defaultChecked size={'small'} onChange={onAutoPlayChange} /></div>
                            <Button  onClick={onClickAddAnchorBtn}>添加节点</Button>
                            <Button disabled={this.state.playerPlaying} onClick={onClickRemoveAnchorBtn}>删除节点</Button>
                        </div>
                        <div id={'时间轴'} className={classNames.timeSlider}>
                            <Slider
                                // tipFormatter={tipFormatter}
                                // range={true}
                                //     step={this.state.playerPlaying?0.001:null}
                              step={0.001}
                                    // defaultValue={[2000,5000]}
                                value={this.state.timeSliderValue}
                                    onChange={this.onTimeSliderChange.bind(this)}
                                    onAfterChange={this.onTimeSliderAfterChange.bind(this)}
                                    max={duration}
                                    marks={sliderMarks}
                            ></Slider>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default InteractiveMovieScriptEditor;
