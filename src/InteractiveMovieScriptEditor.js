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

//region swal2
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
//endregion

import MovieScriptFactory from './movieScriptFactory' ;
import JsonComparer from "./jsonComparer";
import InteractiveMovieScriptPlayer from "./InteractiveMovieScriptPlayer";



const { Step } = Steps;
const MySwal = withReactContent(Swal)

class InteractiveMovieScriptEditor extends Component {
    state={
        currentMovie: {},
        currentMovieState:null,
        timeSliderRange:0,
        timeSliderValue:0,
        timeSliderMarks:{0:'开始'},
        authPlayWhenSlid: false,
        playerPlaying:false,
        currentSelectedNode:0,
        scripts: {
            //初始的脚本
            initScript: {
                movies: {
                    mid1: {
                        movieUrl: 'https://www.enni.group/file/testmovie/2.MP4',
                        posterUrl: 'https://www.enni.group/file/test2.png',
                    },
                    mid2:
                        {
                          movieUrl: 'https://www.enni.group/file/testmovie/3.MP4',
                            posterUrl: 'https://www.enni.group/file/test1.png',
                        }
                },
                anchors: {},
            },
            //设置电话的脚本
            setMobileScript:
                {
                    movies: {
                        mobileMovie1: {
                          movieUrl: 'https://www.enni.group/file/testmovie/2.MP4',
                            posterUrl: 'https://www.enni.group/file/test2.png',
                        },
                        mobileMovie2:
                            {
                              movieUrl: 'https://www.enni.group/file/testmovie/3.MP4',
                                posterUrl: 'https://www.enni.group/file/test1.png',
                            }
                    },
                    anchors: {

                    },
                }
        },
        //已经添加到当前编辑器中的视频素材列表
        moviesSources:[],
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
      //   if (!this.initMovieState && state.duration)
      //   {
      //       this.initMovieState = state;
      //       this.setState({timeSliderRange:state.duration});
      //       console.log('加载完了视频,设置时间为:',state.duration);
      //   }
      //   else
      //   {
      //     return;
      //       // console.log(state);
      //       //currentTime: 1.950439
      //       //如果正在拖动,不更新进度条,如果是正在暂停状态 也不更新进度条.因为暂停的时候 并不会因为状态变更而触发进度条.
      //     //暂停的时候不更新进度条 解决了用户拖动以后 这个函数被调用 然后又重新设置了进度条 而重新设置进度条和拖动的不一致的问题
      //       if(!this.timeSliderSeeking && !this.state.playerPlaying) {
      //           this.setState({timeSliderValue: state.currentTime});
      //       }
      //   }
    }
    //endregion
    //region 当时间轴发生变化的时候
    onTimeSliderChange(e)
    {
        if (this.timeSliderSeeking === true)
        {
            // console.log('当前正在修改')
            return;
        }
        this.setState({timeSliderValue:e});
    }
    //endregion
    //region 当时间轴发生鼠标抬起后变化的时候
    onTimeSliderAfterChange(e)
    {
        this.timeSliderSeeking = true;
        // console.log('松开的时候:',e);
        this.player.seek(e);
        this.setState({timeSliderValue:e});

        let playerState = this.player.getState().player;
        let paused = playerState.paused;
        // console.log(this.player);
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

        // console.log(e);
        // this.setState({timeSliderValue:e});
    }
    onTimeNodeSliderAfterChange(e)
    {
        this.timeSliderSeeking = true;
        this.player.seek(e);
        this.setState({timeSliderValue:e,currentSelectedNode:e});

        let playerState = this.player.getState().player;
        let paused = playerState.paused;
        // console.log(this.player);
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

        //region 生成和添加到scriptAnchors中
        if(!this.scriptAnchors)
        {
            this.scriptAnchors = [];
        }
        let mf = new MovieScriptFactory();
        console.log(this.initMovieState);
        let node = mf.CreateAnchorInformation4Video(this.state.currentMovie,'设置发货人手机', '请设置您用于打印在快递面单上的发货人手机号码', null,null,0,currentNode,currentNode,'setMobile');
        this.state.scripts.setMobileScript.anchors[node.id]=(node);
        console.log('现在 节点内容有:', this.state.scripts);
        //endregion
    }
    //endregion
    //region 点击了删除节点信息
    onClickRemoveAnchorBtn(e)
    {
        let playerState = this.player.getState();
        console.log(playerState)
        let marks = this.state.timeSliderMarks;
        console.log('删除前:',marks, '要删除的是:', this.state.currentSelectedNode);
        delete marks[this.state.currentSelectedNode];
        console.log('删除后:', marks);
        this.setState({timeSliderMarks:marks})
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
    //region 节点选择模式切换
    onSelectModeChange (e)
    {
        this.setState({onlySelectNode:e});
    }
    //endregion
  onPlayerTimeUpdate(e)
  {
      // console.log('事件更新事件:',e);
    this.setState({timeSliderValue:e.target.currentTime});
  }
  //endregion
    //region 视频预览
    onClickInnerBtn = (e)=>
    {
        console.log('you are clicked button in html', e.target.innerText)
        MySwal.clickConfirm();
    }
    viewPlayer = null;
    onClickPreViewBtn()
    {
      if(!this.viewPlayer)
      {
        this.viewPlayer = <InteractiveMovieScriptPlayer scripts={this.state.scripts}/>;
      }
        MySwal.fire({
            title: <p>Hello World</p>,
            html:
            this.viewPlayer,
            // footer: 'Copyright 2018',
            showConfirmButton : false,

            width:1000,
            height:800,
            didOpen: () => {
                // `MySwal` is a subclass of `Swal`
                //   with all the same instance & static methods
                // MySwal.clickConfirm()
            }
        }).then(() => {
            // return MySwal.fire(<p>Shorthand works too</p>)
        })
    }
    //endregion
    //region 添加视频素材
    onClickAddMovieSourceBtn()
    {
        this.player.load();
        let movieUrl = 'https://www.enni.group/file/testmovie/'+(this.state.moviesSources.length+2)+'.MP4';
        let moviePoster = '';//'https://www.enni.group/file/test2.png';
        let mf = new MovieScriptFactory();
        // console.log(this.initMovieState);
        let movie = mf.CreateMovie('initMovieSet'+(this.state.moviesSources.length+1),
          '视频素材'+(this.state.moviesSources.length+1),
          '这是速配的第一次测试使用视频做设置向导', 0,null,movieUrl,moviePoster,'mp4');

        let movies = this.state.moviesSources;
        movies.push(movie);
        this.setState({moviesSources:movies,currentMovie:movie});
        console.log('添加完了视频是:',movies);
        this.player.load();
    }
    //endregion
    //region 点击视频素材
    onClickMovieSourceBtn(item,index)
    {
        this.setState({currentMovie:item});
        this.player.load();
    }
    //endregion
  //region 播放器视频加载
  onPlayerLoadStart(e)
  {

  }
  //endregion
  //region 播放器加载完了视频的meta信息
  onPlayerLoadedMetadata(e)
  {
    console.log('加载完了视频的基本信息:',e.target)
    let url = e.target.currentSrc;
    let duration = e.target.duration;
    let m = this.state.currentMovie;
    if(url === this.state.currentMovie.movieUrl) {
      m.duration = duration;
    }
    this.setState({currentMovie:m,timeSliderRange:duration});
    //console.log('设置完了当前电影的duration以后 movies变了吗? 变了,所以可以说明 movies中的movie是引用', this.state.moviesSources);
  }
  //endregion
    render() {
        let movieUrl = this.state.currentMovie.movieUrl;
        let posterUrl = this.state.currentMovie.posterUrl;
        let duration = this.state.timeSliderRange;
        let onAutoPlayChange = this.onAutoPlayChange.bind(this);
        let onSelectModeChange = this.onSelectModeChange.bind(this);
        let onClickAddAnchorBtn = this.onClickAddAnchorBtn.bind(this);
        let onClickRemoveAnchorBtn = this.onClickRemoveAnchorBtn.bind(this);
        let onClickPreViewBtn = this.onClickPreViewBtn.bind(this);
        let sliderMarks = this.state.timeSliderMarks;
        let onPlayerTimeUpdate = this.onPlayerTimeUpdate.bind(this);
        let onTimeNodeSliderAfterChange= this.onTimeNodeSliderAfterChange.bind(this);
        let moviesSources= this.state.moviesSources;
        let onClickAddMovieSourceBtn = this.onClickAddMovieSourceBtn.bind(this);
        let onClickMovieSourceBtn = this.onClickMovieSourceBtn.bind(this);
        let onPlayerLoadStart = this.onPlayerLoadStart.bind(this);
        let onPlayerLoadedMetadata = this.onPlayerLoadedMetadata.bind(this);
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
                    autoPlay
                    src={movieUrl}
                    onPause={this.onPlayerPause.bind(this)}
                    onPlay={this.onPlayerPlay.bind(this)}
                    onTimeUpdate={(e)=>{
                      // console.log('时间更新',e,e.timeStamp);
                      onPlayerTimeUpdate(e)}}
                    // onLoadStart={onPlayerLoadStart}
                  // onLoadStart={e=>{console.log('onLoadStart:',e.target.duration)}}
                  //   onLoadedMetadata={e=>{console.log('onLoadedMetadata:',e.target.duration)}}
                    onLoadedMetadata={onPlayerLoadedMetadata}
                >
                    <ControlBar autoHide={false} disableDefaultControls={true} disableCompletely={true}>
                    </ControlBar>
                    <BigPlayButton position={'hide'}/>
                </Player>
                <div id={'下方时间轴和按钮'} className={classNames.editorBottomLine}>
                    <div id={'编辑器内部'} className={classNames.editorContent}>
                        <div id={'按钮集'} className={classNames.buttons}>
                            <Button  onClick={onClickAddMovieSourceBtn}>添加视频</Button>
                            <div className={classNames.lineFlexRow}><div>拖拽后自动播放</div><Switch checked={this.state.authPlayWhenSlid}  defaultChecked size={'small'} onChange={onAutoPlayChange} /></div>
                            <Button  onClick={onClickAddAnchorBtn}>添加节点</Button>
                            <Button onClick={onClickRemoveAnchorBtn}>删除节点</Button>
                            <Button onClick={onClickPreViewBtn}>预览</Button>
                        </div>
                        <div id={'时间轴'} className={classNames.timeSlider}>
                            <Slider
                                step={0.001}
                                value={this.state.timeSliderValue}
                                    onChange={this.onTimeSliderChange.bind(this)}
                                    onAfterChange={this.onTimeSliderAfterChange.bind(this)}
                                    max={duration}
                            ></Slider>
                        </div>
                        <div id={'已选择节点的时间轴'} className={classNames.timeSlider}>
                            <Slider
                                step={null}
    value={this.state.timeSliderValue}
    onAfterChange={onTimeNodeSliderAfterChange}
    max={duration}
    marks={sliderMarks}
                                included={false}
    />
                        </div>
                    </div>
                </div>
                <div id={'影片文件素材列表'} className={classNames.srcListLine}>
                    <div className={classNames.srcListLineContent}>
                        {
                            moviesSources.map((item,index)=>
                            {
                              let srcClass = classNames.srcElem;
                              if (item.id===this.state.currentMovie.id)
                              {
                                srcClass = classNames.srcElemCurrent;
                              }
                                return <div key={index} id={'一个素材'} className={srcClass}
                                            onClick={()=>{onClickMovieSourceBtn(item,index)}}
                                >
                                    {item.name}
                                </div>
                            })
                        }

                    </div>
                </div>
            </div>
        );
    }
}

export default InteractiveMovieScriptEditor;
