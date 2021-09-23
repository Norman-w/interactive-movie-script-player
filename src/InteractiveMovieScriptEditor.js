import React, {Component} from 'react';
import {Slider, Button, Switch, Steps, Modal, message} from 'antd';
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
import Splitter from "./Splitter";
import ScriptEditor from "./ScriptEditor";
import SnippetEditor from "./SnippetEditor";


const {Step} = Steps;
const MySwal = withReactContent(Swal)

class InteractiveMovieScriptEditor extends Component {
    state = {
        currentMovie: {},
        currentMovieState: null,
        timeSliderRange: 0,
        timeSliderValue: 0,
        timeSliderMarks: {0: '开始'},
        timeSliderRangeValue: [0, 50],
        currentSelectRange: [0, 50],
        currentSelectScriptId:'',
        authPlayWhenSlid: false,
        playerPlaying: false,
        currentSelectedNode: 0,
        scripts: {
            // //初始的脚本
            // initScript: {
            //     movies: {
            //         mid1: {
            //             movieUrl: 'https://www.enni.group/file/testmovie/2.MP4',
            //             posterUrl: 'https://www.enni.group/file/test2.png',
            //         },
            //         mid2:
            //             {
            //                 movieUrl: 'https://www.enni.group/file/testmovie/3.MP4',
            //                 posterUrl: 'https://www.enni.group/file/test1.png',
            //             }
            //     },
            //     anchors: {},
            //     snippets:{},
            // },
            // //设置电话的脚本
            // setMobileScript:
            //     {
            //         movies: {
            //             mobileMovie1: {
            //                 movieUrl: 'https://www.enni.group/file/testmovie/2.MP4',
            //                 posterUrl: 'https://www.enni.group/file/test2.png',
            //             },
            //             mobileMovie2:
            //                 {
            //                     movieUrl: 'https://www.enni.group/file/testmovie/3.MP4',
            //                     posterUrl: 'https://www.enni.group/file/test1.png',
            //                 }
            //         },
            //         anchors: {},
            //         snippets:{},
            //     }
        },
        //已经添加到当前编辑器中的视频素材列表
        moviesSources: [],
    }
    //视频文件是否正在加载中
    movieLoading = false;
    //视频刚加载出来以后的状态信息,主要用于视频的时长获取并更新slider的长度信息
    initMovieState = null;
    //当前进度条控件是否在滑动中
    timeSliderSeeking = false;

    //拖动滚动条以后是否自动播放

    componentDidMount() {
        if (this.player) {
            this.player.subscribeToStateChange(this.handleStateChange.bind(this));
        }
        this.load();
    }
    save()
    {
      localStorage.setItem('movies',JSON.stringify(this.state.moviesSources));
      localStorage.setItem('scripts',JSON.stringify(this.state.scripts));
    }
    load()
    {
      //region 读取本地数据
      let moviesJson = localStorage.getItem('movies');
      if (moviesJson) {
        this.setState({moviesSources: JSON.parse(moviesJson)});
      }
      let scriptsJson = localStorage.getItem('scripts');
      if (scriptsJson)
      {
        this.setState({scripts:JSON.parse(scriptsJson)});
      }
      //endregion
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
    onTimeSliderChange(e) {
        if (this.timeSliderSeeking === true) {
            // console.log('当前正在修改')
            return;
        }
        this.setState({timeSliderValue: e});
    }

    //endregion
    //region 当时间轴发生鼠标抬起后变化的时候
    onTimeSliderAfterChange(e) {
        this.timeSliderSeeking = true;
        // console.log('松开的时候:',e);
        this.player.seek(e);
        this.setState({timeSliderValue: e});
        let playerState = this.player.getState().player;
        let paused = playerState.paused;
        // console.log(this.player);
        if (this.state.authPlayWhenSlid) {
            if (paused) {
                this.player.play();
            }
        } else {
            // console.log();
            if (!paused) {
                this.player.pause();
            }
        }
        this.timeSliderSeeking = false;

        // console.log(e);
        // this.setState({timeSliderValue:e});
    }

    onTimeNodeSliderAfterChange(e) {
        console.log(e)
        this.timeSliderSeeking = true;
        this.player.seek(e);
        this.setState({timeSliderValue:e,currentSelectedNode:e});
        // this.setState({timeSliderRangeValue: e, currentSelectedRange: e})
        if (this.state.timeSliderMarks[this.state.currentSelectedNode])
        {
            let marks = this.state.timeSliderMarks;
            let old = marks[this.state.currentSelectedNode];
            delete marks[this.state.currentSelectedNode];
            marks[e]=old;
            this.setState({timeSliderMarks:marks});
        }

        let playerState = this.player.getState().player;
        let paused = playerState.paused;
        // console.log(this.player);
        if (this.state.authPlayWhenSlid) {
            if (paused) {
                this.player.play();
            }
        } else {
            // console.log();
            if (!paused) {
                this.player.pause();
            }
        }
        this.timeSliderSeeking = false;

    }

    //endregion
    //region 切换是否自动播放
    onAutoPlayChange(e) {
        this.setState({authPlayWhenSlid: e});
        // this.authPlayWhenSlid = e;
        // console.log(e)
    }

    //endregion
    //region 点击了添加节点信息
    onClickAddAnchorBtn(e) {
        let currentNode = this.state.timeSliderValue;
        let o = this.state.timeSliderMarks;
        // o[currentNode] = ''+currentNode;
        let keys = Object.keys(o);
        o[currentNode] = '' + keys.length;
        this.setState({timeSliderMarks: o});
        console.log('现在的节点是:', o);
    }

    //endregion
    //region 点击了删除节点信息
    onClickRemoveAnchorBtn(e) {
        let playerState = this.player.getState();
        console.log(playerState)
        let marks = this.state.timeSliderMarks;
        console.log('删除前:', marks, '要删除的是:', this.state.currentSelectedNode);
        delete marks[this.state.currentSelectedNode];
        console.log('删除后:', marks);
        this.setState({timeSliderMarks: marks})
    }

    //endregion
    //region 播放器暂停事件
    onPlayerPause(e) {
        this.setState({playerPlaying: false});
    }

    //endregion
    //region 播放器开始播放事件
    onPlayerPlay(e) {
        this.setState({playerPlaying: true});
    }

    //endregion
    //region 当播放器的当前播放时间更新
    //region 节点选择模式切换
    onSelectModeChange(e) {
        this.setState({onlySelectNode: e});
    }

    //endregion
    onPlayerTimeUpdate(e) {
        // console.log('事件更新事件:',e);
        this.setState({timeSliderValue: e.target.currentTime});
    }

    //endregion
    //region 视频预览
    onClickInnerBtn = (e) => {
        console.log('you are clicked button in html', e.target.innerText)
        MySwal.clickConfirm();
    }
    viewPlayer = null;

    onClickPreViewBtn() {
        if (!this.viewPlayer) {
            this.viewPlayer = <InteractiveMovieScriptPlayer scripts={this.state.scripts}/>;
        }
        MySwal.fire({
            title: <p>Hello World</p>,
            html:
            this.viewPlayer,
            // footer: 'Copyright 2018',
            showConfirmButton: false,

            width: 1000,
            height: 800,
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
    onClickAddMovieSourceBtn() {
        this.player.load();
        let movieUrl = 'https://www.enni.group/file/testmovie/' + (this.state.moviesSources.length + 2) + '.MP4';
        let moviePoster = '';//'https://www.enni.group/file/test2.png';
        let mf = new MovieScriptFactory();
        // console.log(this.initMovieState);
        let movie = mf.CreateMovie('initMovieSet' + (this.state.moviesSources.length + 1),
            '视频素材' + (this.state.moviesSources.length + 1),
            '这是速配的第一次测试使用视频做设置向导', 0, null, movieUrl, moviePoster, 'mp4');

        let movies = this.state.moviesSources;
        movies.push(movie);
        this.setState({moviesSources: movies, currentMovie: movie});
        console.log('添加完了视频是:', movies);
        this.save();
        this.player.load();
    }

    //endregion
    //region 点击视频素材
    onClickMovieSourceBtn(item, index) {
        this.setState({currentMovie: item});
        this.player.load();
    }

    //endregion
    //region 播放器视频加载
    onPlayerLoadStart(e) {

    }

    //endregion
    //region 播放器加载完了视频的meta信息
    onPlayerLoadedMetadata(e) {
        console.log('加载完了视频的基本信息:', e.target)
        let url = e.target.currentSrc;
        let duration = e.target.duration;
        let m = this.state.currentMovie;
        if (url === this.state.currentMovie.movieUrl) {
            m.duration = duration;
        }
        this.setState({currentMovie: m, timeSliderRange: duration});
        //console.log('设置完了当前电影的duration以后 movies变了吗? 变了,所以可以说明 movies中的movie是引用', this.state.moviesSources);
    }

    //endregion
    //region 添加脚本 在当前选择的时间点
    onClickAddScriptBtn(e)
    {
        //region 弹窗展示脚本相关信息页面

        let newScript = {};
        let editor = <ScriptEditor mode={'create'} script={newScript}/>;
        let that = this;
        let m = Modal.info(
            {
                icon:null,
                content:editor,
                closable:true,
                // centered:true,
                onOk:(e)=>
                {
                    console.log(newScript);
                    if (!newScript.id || !newScript.name) {
                        message.warn('输入无效');
                    }
                    else if(that.state.scripts[newScript.id])
                    {
                        message.error('脚本'+ newScript.id + '已存在');
                    }
                    else
                    {
                        let s = that.state.scripts;
                        s[newScript.id] = {name:newScript.name, snippets:{} };
                        that.setState({scripts:s, currentSelectScriptId:newScript.id});
                        message.success('添加脚本 '+ newScript.id + '成功');
                        console.log(that.state.scripts);
                        m.destroy();
                        that.save()
                    }
                }
            }
        )
        //endregion
    }
    //endregion
    //region 点击脚本的时候切换脚本
    onClickScript(key)
    {
        this.setState({currentSelectScriptId:key});
    }
    //endregion
    //region 在选择的脚本中添加片段信息
    onClickAddSnippet(scriptId)
    {
      //return 获取该节点到什么时间点结束
      let ms = this.state.timeSliderMarks;
      let mskeys = Object.keys(ms);
      let currentSelectedNode = this.state.currentSelectedNode;
      let moreThanThisNodeMinNode = this.state.currentMovie.duration;//大于当前选择的时间点的最近一个时间点是什么
      for (let i = 0; i < mskeys.length; i++) {
        let key = mskeys[i];
        if (key>currentSelectedNode)
        {
          if(key<moreThanThisNodeMinNode)
          {
            moreThanThisNodeMinNode = parseFloat(key);
          }
        }
      }
      console.log('离当前选择的点和最近的后面的点是:',currentSelectedNode, moreThanThisNodeMinNode);
      //endregion

      if (currentSelectedNode===undefined || currentSelectedNode<0)
      {
        message.warn('请选择脚本起始点');
        return;
      }
      else if(moreThanThisNodeMinNode===undefined || moreThanThisNodeMinNode<=0)
      {
        message.warn('无效的脚本结束时间');
        return;
      }

      let that = this;
        let newSnippet = {
          startTime:currentSelectedNode,
          endTime:moreThanThisNodeMinNode,
          duration:moreThanThisNodeMinNode-currentSelectedNode,
          redirect:false,
          redirectSnippetId:null,
        };
        this.showSnippetEditor(scriptId,newSnippet);
    }
    showSnippetEditor(scriptId,newSnippet)
    {
      console.log('显示片段编辑器:', newSnippet);
      let that = this;
      let content = <SnippetEditor mode={'create'}
                                   movie={this.state.currentMovie}
                                   scriptId={this.state.currentSelectScriptId}
                                   snippet={newSnippet}/>;
      let md = Modal.info(
        {
          centered:true,
          width:400,
          icon:null,
          content:content,
          closable:true,
          onOk:(e)=>
          {
            if (!newSnippet.type)
            {
              message.warn('请选择片段类型');
            }
            else if (!newSnippet.id || !newSnippet.name)
            {
              message.warn('请正确输入id和名称');
            }
            else if(that.state.scripts[scriptId].snippets[newSnippet.id])
            {
              message.warn('片段id:'+newSnippet.id +'已存在');
            }
            else {
              let sc = that.state.scripts;
              let thisSc = sc[scriptId];
              这里信息不全面
              thisSc.snippets[newSnippet.id] = {name:newSnippet.name, type:newSnippet.type};
              that.setState({scripts:sc},()=>{
                message.success('添加片段'+newSnippet.id+'成功')
                md.destroy();
                console.log('当前脚本内容:',scriptId, that.state.scripts);
                that.save();
              });
            }
          }
        }
      )
    }
    //endregion
    render() {
        let movieUrl = this.state.currentMovie.movieUrl;
        let posterUrl = this.state.currentMovie.posterUrl;
        let duration = this.state.timeSliderRange;
        let onAutoPlayChange = this.onAutoPlayChange.bind(this);
        let onSelectModeChange = this.onSelectModeChange.bind(this);
        let onClickAddAnchorBtn = this.onClickAddAnchorBtn.bind(this);
        let onClickAddScriptBtn = this.onClickAddScriptBtn.bind(this);
        let onClickRemoveAnchorBtn = this.onClickRemoveAnchorBtn.bind(this);
        let onClickPreViewBtn = this.onClickPreViewBtn.bind(this);
        let sliderMarks = this.state.timeSliderMarks;
        let onPlayerTimeUpdate = this.onPlayerTimeUpdate.bind(this);
        let onTimeNodeSliderAfterChange = this.onTimeNodeSliderAfterChange.bind(this);
        let moviesSources = this.state.moviesSources;
        let onClickAddMovieSourceBtn = this.onClickAddMovieSourceBtn.bind(this);
        let onClickMovieSourceBtn = this.onClickMovieSourceBtn.bind(this);
        let onPlayerLoadStart = this.onPlayerLoadStart.bind(this);
        let onPlayerLoadedMetadata = this.onPlayerLoadedMetadata.bind(this);
        let onClickScript = this.onClickScript.bind(this);
        const scripts = this.state.scripts;
        let currentSelectScriptId = this.state.currentSelectScriptId;
        let tipFormatter = (value) => {
            let sec = value / 1000;
            // let mil = value%1000;
            // return ''+sec+'.'+mil;
            return sec;
        }
        return (
            <div className={classNames.main}>
                <div className={classNames.playerContent}>
                    <Player
                        ref={c => {
                            this.player = c;
                        }}
                        poster={posterUrl}
                        autoPlay
                        src={movieUrl}
                        onPause={this.onPlayerPause.bind(this)}
                        onPlay={this.onPlayerPlay.bind(this)}
                        onTimeUpdate={(e) => {
                            onPlayerTimeUpdate(e)
                        }}

                        onLoadedMetadata={onPlayerLoadedMetadata}
                        className={classNames.main}
                    >
                        <ControlBar autoHide={false} disableDefaultControls={true} disableCompletely={true}>
                        </ControlBar>
                        <BigPlayButton position={'hide'}/>
                    </Player>
                </div>
                <div id={'覆盖层各种工具栏'} className={classNames.toolsLayout}
                     // onClick={
                     //   ()=>{this.player.play()}
                     // }
                >
                    <div id={'影片文件素材列表'} className={classNames.leftColumn}>
                        <div className={classNames.srcListLineContent}>
                            {
                                moviesSources.map((item, index) => {
                                    let srcClass = classNames.srcElem;
                                    if (item.id === this.state.currentMovie.id) {
                                        srcClass = classNames.srcElemCurrent;
                                    }
                                    return <div key={index} id={'一个素材'} className={srcClass}
                                                onClick={() => {
                                                    onClickMovieSourceBtn(item, index)
                                                }}
                                    >
                                        {item.name}
                                    </div>
                                })
                            }

                        </div>
                    </div>
                    <div id={'中间的工具栏'} className={classNames.midColumn}>
                        <div id={'上方信息栏'} className={classNames.infoLine}>
                            <div>
                                当前视频:{this.state.currentMovie.id}
                            </div>
                            <div>
                                当前节点:{this.state.currentSelectedNode}
                            </div>
                            <div>
                                当前区域:{this.state.currentSelectRange}
                            </div>
                            <div>
                                当前脚本:{currentSelectScriptId}
                            </div>
                        </div>
                        <div id={'下方时间轴和按钮'} className={classNames.editorBottomLineContent}>
                            <div id={'编辑器内部'} className={classNames.editorContent}>
                                <div id={'按钮集'} className={classNames.buttons}>
                                    <Button onClick={onClickAddMovieSourceBtn}>添加视频</Button>
                                    <div className={classNames.lineFlexRow}>
                                        <div>拖拽后自动播放</div>
                                        <Switch checked={this.state.authPlayWhenSlid} defaultChecked size={'small'}
                                                onChange={onAutoPlayChange}/></div>
                                    <Button onClick={onClickAddAnchorBtn}>添加节点</Button>
                                    <Button onClick={onClickAddScriptBtn}>添加脚本</Button>
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
                                    />
                                </div>
                                <div id={'已选择节点的时间轴'} className={classNames.timeSlider}>
                                    <Slider
                                        step={1}
                                        onChange={e=>{
                                            // console.log('当前选中的节点是', e)
                                            if (this.state.timeSliderMarks[e])
                                            {
                                                console.log('选中的节点是mark:', e);
                                                this.setState({currentSelectedNode:e});
                                            }
                                        }}
                                        onAfterChange={onTimeNodeSliderAfterChange}
                                        max={duration}
                                        marks={sliderMarks}
                                        included={false}
                                    />
                                </div>
                                <div id={'自己写的时间节点编辑器'} className={classNames.timeSlider}>
                                    <Splitter></Splitter>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id={'右侧的工具栏'} className={classNames.rightColumn}>
                        <div id={'脚本列表集合'} className={classNames.scriptListContent}>
                            {
                                Object.keys(scripts).map(
                                    (key,index)=>
                                    {
                                        let obj = scripts[key];
                                        let scriptClass = classNames.script;
                                        let addSnippetBtn = null;
                                        if (currentSelectScriptId===key)
                                        {
                                            scriptClass = classNames.scriptCurrent;
                                            addSnippetBtn = <div className={classNames.addSnippetBtn}
                                                                 onClick={()=>{
                                                                     this.onClickAddSnippet(key);
                                                                 }}
                                            >+</div>
                                        }
                                        return <div key={key} className={scriptClass}
                                                    onClick={()=>{onClickScript(key)}}
                                        >
                                            <div className={classNames.scriptTitle}>{key}</div>
                                            <div className={classNames.scriptSubTitle}>{obj.name}</div>
                                            <div className={classNames.snippetListContent}>
                                                {/*<div className={classNames.snippet}></div>*/}
                                                {
                                                    Object.keys(obj.snippets).map((sKey, sIndex) => {
                                                        return <div key={sKey} className={classNames.snippet}
                                                                    onClick={
                                                                      // ()=>this.setState({currentSelectedSnippet:obj.snippets[sKey]})
                                                                      ()=>this.showSnippetEditor(key,obj.snippets[sKey])
                                                                    }
                                                        >
                                                            <div className={classNames.snippetTitle}>
                                                                {obj.snippets[sKey].name}
                                                            </div>
                                                            <div className={classNames.snippetSubTitle}>
                                                                {obj.snippets[sKey].type}
                                                            </div>
                                                        </div>
                                                    })
                                                }
                                                {addSnippetBtn}
                                            </div>
                                        </div>
                                    }
                                )
                            }

                            <div id={'添加脚本按钮'} className={this.state.addScriptHover? classNames.scriptAddBtnHover: classNames.scriptAddBtn} onClick={onClickAddScriptBtn}
                                 onMouseEnter={()=>{this.setState({addScriptHover:true})}}
                                 onMouseLeave={()=>{this.setState({addScriptHover:false})}}
                            >+</div>
                        </div>

                    </div>
                </div>

            </div>
        );
    }
}

export default InteractiveMovieScriptEditor;
