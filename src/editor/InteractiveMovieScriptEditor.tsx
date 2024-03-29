import React, {Component} from 'react';
import {Input,Slider, Button, Switch, Modal, message} from 'antd';
import classNames from './InteractiveMovieScriptEditor.module.css';
import 'antd/dist/antd.css'
//region  video-react的引用
import {
    Player,
    ControlBar,
    BigPlayButton, PlayerReference, PlayerState,
} from 'video-react';
import "video-react/dist/video-react.css"; // import css
import '../video-react-rewrite.css';
//endregion

//region swal2
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'
//endregion

import MovieScriptFactory from '../movieScriptFactory' ;
// import JsonComparer from "../utils/jsonComparer";
import InteractiveMovieScriptPlayer from "../player/InteractiveMovieScriptPlayer";
import Splitter from "./Splitter";
import ScriptEditor from "./ScriptEditor";
import SnippetEditor from "./SnippetEditor";
import JSONResult from "../utils/JSONResult";
import utils from "../utils/utils";
import scriptProcessor from '../processor/QPScriptProcessor';


//region start and prop interface
interface IState
{
    addScriptHover:boolean,
    currentMovie:IMovie,
    currentMovieState: null,
    timeSliderValue: number,
    timeSliderMarks: {[key:number]:string},
    currentSelectScriptId:string,
    authPlayWhenSlid: boolean,
    playerPlaying: boolean,
    currentSelectedNode: number,
    scripts: {
        [key:string]:IScript
    },
    //已经添加到当前编辑器中的视频素材列表
    moviesSources: IMovie[],
    onlySelectNode:any,
}
interface IProp
{

}
//endregion


//region types
class IMovie
{
    constructor() {
        this.id = '';
        this.name = '';
        this.movieUrl = '';
        this.posterUrl = '';
        this.duration = 0;
    }
    id:string;
    name:string;
    movieUrl:string;
    posterUrl:string;
    duration:number;
}
class IScript
{
    constructor() {
        this.id='';
        this.name='';
        this.snippets = {}
    }
    id:string;
    name:string;
    snippets: { [key:string]:ISnippet }
}
interface ISnippet
{
    movieId?:string,
    movieUrl?:string,
    id?:string,
    name?:string,
    type?:any,
    startTime?:number,
    endTime?:number,
    actionAtEnd?:string,
    redirectSnippetIndex?:string,
    transitionSnippetIndex?:string,
    scriptId?:string,
}
//endregion

// const {Step} = Steps;
const MySwal = withReactContent(Swal)

class InteractiveMovieScriptEditor extends Component<IProp,IState> {
    constructor(props:IProp) {
        super(props);
        this.player = null;
        this.lastPlayerState = null;
    }
    lastPlayerState:PlayerState|null;
    state:IState = {
        currentMovie: new IMovie(),
        currentMovieState: null,
        timeSliderValue: 0,
        timeSliderMarks: {0: '开始'},
        currentSelectScriptId:'',
        authPlayWhenSlid: false,
        playerPlaying: false,
        currentSelectedNode: 0,
        scripts: {

        },
        //已经添加到当前编辑器中的视频素材列表
        moviesSources: [],
        addScriptHover:false,
        onlySelectNode:false
    }
    player:PlayerReference|null;
    //视频文件是否正在加载中
    // movieLoading = false;
    //视频刚加载出来以后的状态信息,主要用于视频的时长获取并更新slider的长度信息
    // initMovieState = null;
    //当前进度条控件是否在滑动中
    timeSliderSeeking = false;

    //拖动滚动条以后是否自动播放

    componentDidMount() {
      this.onClickLoadFromCloudBtn().then(r=>console.log(r));
    }
    //region 在本地存储中,保存和读取文件,也可以改成把文件存在远程服务器,然后进行api下载.但是远程服务器需要执行逻辑
    save()
    {
      // localStorage.setItem('movies',JSON.stringify(this.state.moviesSources));
      // localStorage.setItem('scripts',JSON.stringify(this.state.scripts));
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


    //endregion
    //region 当时间轴发生变化的时候
    onTimeSliderChange(e:any) {
        if (this.timeSliderSeeking) {
            // console.log('当前正在修改')
            return;
        }
        this.setState({timeSliderValue: e});
    }

    //endregion
    //region 当时间轴发生鼠标抬起后变化的时候
    onTimeSliderAfterChange(e:any) {
        if(!this.player) return;
        this.timeSliderSeeking = true;
        // console.log('松开的时候:',e);
        this.player.seek(e);
        this.setState({timeSliderValue: e});
        let playerState = this.player.getState();
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

    onTimeNodeSliderAfterChange(e:any) {
        if(!this.player)return;
        console.log(e)
        this.timeSliderSeeking = true;
        this.player.seek(e);
        this.setState({timeSliderValue:e,currentSelectedNode:e});
        if (this.state.timeSliderMarks[this.state.currentSelectedNode])
        {
            let marks = this.state.timeSliderMarks;
            let old = marks[this.state.currentSelectedNode];
            delete marks[this.state.currentSelectedNode];
            marks[e]=old;
            this.setState({timeSliderMarks:marks});
        }

        let playerState = this.player.getState();
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
    onAutoPlayChange(e:any) {
        this.setState({authPlayWhenSlid: e});
        // this.authPlayWhenSlid = e;
        // console.log(e)
    }

    //endregion
    //region 点击了添加节点信息
    onClickAddAnchorBtn() {
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
    onClickRemoveAnchorBtn() {
        if(!this.player)return;
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
    onPlayerPause() {
        this.setState({playerPlaying: false});
    }

    //endregion
    //region 播放器开始播放事件
    onPlayerPlay() {
        this.setState({playerPlaying: true});
    }

    //endregion
    //region 当播放器的当前播放时间更新
    //region 节点选择模式切换
    onSelectModeChange(e:any) {
        this.setState({onlySelectNode: e});
    }

    //endregion
    onPlayerTimeUpdate(e:any) {
        // console.log('事件更新事件:',e);
        this.setState({timeSliderValue: e.target.currentTime});
    }

    //endregion
    //region 视频预览
    onClickInnerBtn = (e:any) => {
        console.log('you are clicked button in html', e.target.innerText)
        MySwal.clickConfirm();
    }
    viewPlayer:any;

    onClickPreViewBtn() {
      // console.log('点击预览按钮,将要进行脚本的预览,给定的scripts是:', this.state.scripts);
        if (!this.viewPlayer) {
            this.viewPlayer = <InteractiveMovieScriptPlayer scripts={this.state.scripts}
                                                            entrySnippetIndex={'introduce.initMovieSet1.info.introduce'}
              // entrySnippetIndex={'autoPrintRule.initMovieSet7.questionWithWaiter.howMuchUseQPPaper'}
                                                            getInteractionDomFunc={
                                                              scriptProcessor.getInteractionDom.bind(this)
                                                            }/>;
        }
        MySwal.fire({
            // title: <p>Hello World</p>,
            html:
            this.viewPlayer,
            // footer: 'Copyright 2018',
            showConfirmButton: false,

            width: 1000,
            // height: 800,
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
        if(!this.player)return;
        this.player.load();
        let movieUrl = 'https://www.enni.group/file/testmovie/' + (this.state.moviesSources.length + 2) + '.MP4';
        if(this.state.moviesSources.length === 0)
        {
            movieUrl = 'https://www.enni.group/qp/pdd/moviescriptplayer/src/1.introduce.mp4';
        }
        else if(this.state.moviesSources.length ===1)
        {
            movieUrl='https://www.enni.group/qp/pdd/moviescriptplayer/src/2.setSenderMobile.mp4';
        }
        else if(this.state.moviesSources.length ===2)
        {
            movieUrl='https://www.enni.group/qp/pdd/moviescriptplayer/src/feedback.right.mp4';
        }
        else if(this.state.moviesSources.length ===3)
        {
            movieUrl='https://www.enni.group/qp/pdd/moviescriptplayer/src/3.selectPrintMode.mp4';
        }
        else if(this.state.moviesSources.length ===4)
        {
            movieUrl='https://www.enni.group/qp/pdd/moviescriptplayer/src/4.moreThan5How.mp4';
        }
        else if(this.state.moviesSources.length ===5)
        {
            movieUrl='https://www.enni.group/qp/pdd/moviescriptplayer/src/5.devicePrepare.mp4';
        }
        else if(this.state.moviesSources.length ===6)
        {
          movieUrl = 'https://www.enni.group/qp/pdd/moviescriptplayer/src/6.autoPrintRule.mp4';
        }
        let moviePoster = '';//'https://www.enni.group/file/test2.png';
        let mf = new MovieScriptFactory();
        // console.log(this.initMovieState);
        let movie:IMovie = mf.CreateMovie('initMovieSet' + (this.state.moviesSources.length + 1),
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
    onClickMovieSourceBtn(item:IMovie) {
        if(!this.player)return;
        this.setState({currentMovie: item});
        this.player.load();
    }

    //endregion
    //region 播放器视频加载
    // onPlayerLoadStart(e) {
    //
    // }

    //endregion
    //region 播放器加载完了视频的meta信息
    onPlayerLoadedMetadata(e:any) {
        console.log('加载完了视频的基本信息:', e.target)
        let url = e.target.currentSrc;
        let duration = e.target.duration;
        let m = this.state.currentMovie;
        if (url === this.state.currentMovie.movieUrl) {
            m.duration = duration;
        }
        this.setState({currentMovie: m});
        //console.log('设置完了当前电影的duration以后 movies变了吗? 变了,所以可以说明 movies中的movie是引用', this.state.moviesSources);
    }

    //endregion
    //region 添加脚本 在当前选择的时间点
    onClickAddScriptBtn()
    {
        //region 弹窗展示脚本相关信息页面

        let newScript:IScript = new IScript();
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
                    console.log(newScript,e);
                    if (!newScript.id || !newScript.name) {
                        message.warn('输入无效').then(r=>console.log(r));
                    }
                    else if(that.state.scripts[newScript.id])
                    {
                        message.error('脚本'+ newScript.id + '已存在').then(r=>console.log(r));
                    }
                    else
                    {
                        let s = that.state.scripts;
                        s[newScript.id] = newScript;//{name:newScript.name, snippets:{} };
                        that.setState({scripts:s, currentSelectScriptId:newScript.id});
                        message.success('添加脚本 '+ newScript.id + '成功').then(r=>console.log(r));
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
    onClickScript(key:any)
    {
        this.setState({currentSelectScriptId:key});
    }
    //endregion
    //region 在选择的脚本中添加片段信息
    onClickAddSnippet(scriptId:any)
    {
        console.log('在脚本集:',scriptId+'中添加片段')
      //return 获取该节点到什么时间点结束
      let ms = this.state.timeSliderMarks;
      let msKeys = Object.keys(ms);
      let currentSelectedNode = this.state.currentSelectedNode;
      let moreThanThisNodeMinNode = this.state.currentMovie.duration;//大于当前选择的时间点的最近一个时间点是什么
      for (let i = 0; i < msKeys.length; i++) {
        let key = msKeys[i];
        if (Number(key)>currentSelectedNode)
        {
          if(Number(key)<moreThanThisNodeMinNode)
          {
            moreThanThisNodeMinNode = parseFloat(key);
          }
        }
      }
      console.log('离当前选择的点和最近的后面的点是:',currentSelectedNode, moreThanThisNodeMinNode);
      //endregion



      if (currentSelectedNode===undefined || currentSelectedNode<0)
      {
        message.warn('请选择脚本起始点').then(r=>console.log(r));
        return;
      }
      else if(moreThanThisNodeMinNode===undefined || moreThanThisNodeMinNode<=0)
      {
        message.warn('无效的脚本结束时间').then(r=>console.log(r));
        return;
      }

        let newSnippet:ISnippet = {
            movieId:this.state.currentMovie.id,
            movieUrl:this.state.currentMovie.movieUrl,
          startTime:currentSelectedNode,
          endTime:moreThanThisNodeMinNode,
          actionAtEnd:'none',
            scriptId:scriptId,
        };
        this.showSnippetEditor(this.state.currentMovie.id, this.state.currentMovie.movieUrl,this.state.currentMovie.duration, scriptId,newSnippet,'create');
    }
    showSnippetEditor(movieId:string,movieUrl:string,movieDuration:number, scriptId:string,newSnippet:ISnippet,mode:string)
    {
      // console.log('显示片段编辑器:', newSnippet);

      let that = this;
        let editorRef:SnippetEditor|null;
      let content = <SnippetEditor mode={mode}
                                   movieId={movieId}
                                   movieUrl={movieUrl}
                                   movieDuration={movieDuration}
                                   scriptId={scriptId}
                                   snippet={newSnippet}
                                   onDelete={()=>{
                                       let sc = that.state.scripts;
                                       let thisSc = sc[scriptId];
                                       if(!thisSc.snippets)
                                       {
                                           thisSc.snippets = {};
                                       }
                                       if(newSnippet.id !== undefined)
                                       {
                                       delete thisSc.snippets[newSnippet.id];}
                                       that.setState({scripts:sc},()=>{
                                           message.success('删除片段'+newSnippet.id+'成功').then(r=>console.log(r))
                                           md.destroy();
                                           console.log('当前脚本内容:',scriptId, that.state.scripts);
                                           that.save();
                                       });
                                   }}
                                   ref={e=>editorRef=e}
                                   //可选的过场片段都有哪些
                                   // transitionSnippets={transitionSnippets}
                                   //所有的片段都有哪些,这些片段可以用来执行跳转
                                   // allSnippets={allSnippets}
                                   //直接把当前的脚本内容的集合传递过去,这样的话,可以通过手风琴的方式查看要选择的过场视频
                                   scripts={this.state.scripts}
      />;
        // console.log('即将显示新片段的编辑页面', newSnippet);

      let md = Modal.info(
        {
          centered:true,
          width:400,
          icon:null,
          content:content,
          closable:true,
          maskClosable:true,
            okText:'保存',
          onOk:(e)=>
          {
              if (!that.state.scripts[scriptId].snippets)
              {
                  that.state.scripts[scriptId].snippets = {};
              }
              console.log('片段编辑器的内容是:', newSnippet,e);
            if (!newSnippet.type)
            {
              message.warn('请选择片段类型').then(r=>console.log(r));
            }
            else if (!newSnippet.id || !newSnippet.name)
            {
              message.warn('请正确输入id和名称').then(r=>console.log(r));
            }
            else if(mode==='create' && that.state.scripts[scriptId].snippets[newSnippet.id])
            {
              message.warn('片段id:'+newSnippet.id +'已存在').then(r=>console.log(r));
            }
            else {
                console.log(editorRef);
              let sc = that.state.scripts;
              let thisSc = sc[scriptId];
              if(!thisSc.snippets)
              {
                  thisSc.snippets = {};
              }
              if(editorRef) {
                  thisSc.snippets[newSnippet.id] = editorRef.state.snippet;
              }
              //     {
              //     name:newSnippet.name,
              //     type:newSnippet.type,
              //     redirect:newSnippet.redirect,
              //     redirectSnippetId: newSnippet.redirectSnippetId,
              //
              // };
              that.setState({scripts:sc},()=>{
                message.success((mode==='create'?'添加片段':'修改片段')+newSnippet.id+'成功').then(r=>console.log(r))
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
  //region  在远端保存和获取设置
  async onClickSave2CloudBtn(){
  let scriptsJson = JSON.stringify(this.state.scripts);
  let srcJson = JSON.stringify(this.state.moviesSources);
  await utils.doPost({
                 api:'setting.save',
                 params:
                   {
                     settingJson:encodeURIComponent(scriptsJson),
  settingName:'scripts',
},
success:()=>
{
  message.success('保存脚本信息成功').then(r=>console.log(r));
},errProcFunc: undefined, failProcFunc: undefined,session: undefined,routerUrl: undefined
})
await utils.doPost({
  api:'setting.save',
  params:
    {
      settingJson:encodeURIComponent(srcJson),
      settingName:'movieResources',
    },
  success:()=>
  {
    message.success('保存片源信息成功').then(r=>console.log(r));
  },errProcFunc: undefined, failProcFunc: undefined,session: undefined,routerUrl: undefined
})
}
  async onClickLoadFromCloudBtn(){
  await utils.doPost({
                 api:'setting.load',
                 params:
                   {
                     settingName:'scripts',
                   },
                 success:(ret:any)=>
{
  if (ret && ret.SettingJson)
{
  let retJson = decodeURIComponent(ret.SettingJson);
  let jsonObj = JSON.parse(retJson);
  this.setState({scripts: jsonObj});
  message.success('加载云端脚本设置成功');
}
console.log('执行读取请求成功:', ret);
},errProcFunc: undefined, failProcFunc: undefined,session: undefined,routerUrl: undefined
})
//region 加载保存的视频资源脚本
await utils.doPost({
  api:'setting.load',
  params:
    {
      settingName:'movieResources',
    },
  success:(ret:any)=>
  {
    if (ret && ret.SettingJson)
    {
      let retJson = decodeURIComponent(ret.SettingJson);
      let jsonObj = JSON.parse(retJson);
      this.setState({moviesSources: jsonObj});
      message.success('加载云端电影片源设置成功');
    }
    console.log('执行读取请求成功:', ret);
  },
   errProcFunc: undefined, failProcFunc: undefined,session: undefined,routerUrl: undefined
})
//endregion
}
  //endregion

    render() {
      //region 变量定义和绑定
        let movieUrl = this.state.currentMovie.movieUrl;
        let posterUrl = this.state.currentMovie.posterUrl;
        let duration = this.state.currentMovie.duration;
        let onAutoPlayChange = this.onAutoPlayChange.bind(this);
        let onSelectModeChange = this.onSelectModeChange.bind(this);
        let onClickAddAnchorBtn = this.onClickAddAnchorBtn.bind(this);
        let onClickAddScriptBtn = this.onClickAddScriptBtn.bind(this);
        let onClickRemoveAnchorBtn = this.onClickRemoveAnchorBtn.bind(this);
        let onClickPreViewBtn = this.onClickPreViewBtn.bind(this);
        let sliderMarks = this.state.timeSliderMarks;
        // let onPlayerTimeUpdate = this.onPlayerTimeUpdate.bind(this);
        let onTimeNodeSliderAfterChange = this.onTimeNodeSliderAfterChange.bind(this);
        let moviesSources = this.state.moviesSources;
        let onClickAddMovieSourceBtn = this.onClickAddMovieSourceBtn.bind(this);
        let onClickMovieSourceBtn = this.onClickMovieSourceBtn.bind(this);
        // let onPlayerLoadStart = this.onPlayerLoadStart.bind(this);
        // let onPlayerLoadedMetadata = this.onPlayerLoadedMetadata.bind(this);
        let onClickScript = this.onClickScript.bind(this);
        const scripts = this.state.scripts;
        let currentSelectScriptId = this.state.currentSelectScriptId;
        // let tipFormatter = (value) => {
        //     let sec = value / 1000;
        //     let mil = value%1000;
        //     return ''+sec+'.'+mil;
            // return sec;
        // }
        //endregion
        // if(this.player){
        //     const newState = this.player.getState();
        //     if(newState.paused && !this.lastPlayerState?.paused)
        //     {
        //         this.onPlayerPause.bind(this)();
        //     }
        //     else if(!newState.paused && this.lastPlayerState?.paused)
        //     {
        //         this.onPlayerPlay.bind(this)();
        //     }
        //     else if(this.lastPlayerState.)
        // }
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
                        onTimeUpdate={(e:any) => {
                            this.onPlayerTimeUpdate.bind(this)(e)
                        }}

                        onLoadedMetadata={this.onPlayerLoadedMetadata.bind(this)}
                        className={classNames.main}
                    >
                        <ControlBar autoHide={false} disableDefaultControls={true} disableCompletely={true}>
                        </ControlBar>
                        <BigPlayButton position={'center'}/>
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
                                                    onClickMovieSourceBtn(item,
                                                        // index
                                                    )
                                                }}
                                    >
                                        {item.name}
                                    </div>
                                })
                            }
                          <Button onClick={onClickAddMovieSourceBtn} style={{marginTop:20}} type={'primary'}>添加视频</Button>
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
                                当前脚本:{currentSelectScriptId}
                            </div>
                        </div>
                        <div id={'下方时间轴和按钮'} className={classNames.editorBottomLineContent}>
                            <div id={'编辑器内部'} className={classNames.editorContent}>
                                <div id={'按钮集'} className={classNames.buttons}>
                                    <Button onClick={this.onClickSave2CloudBtn.bind(this)}>
                                        云保存
                                    </Button>
                                    <Button onClick={this.onClickLoadFromCloudBtn.bind(this)}>
                                        云读取
                                    </Button>
                                  <Button onClick={()=>{
                                    let md = Modal.info({
                                      icon:null,
                                      content:<JSONResult json={
  // JSON.stringify(this.state.scripts)
  this.state.scripts
}/>,
                                      closable:true,
                                      maskClosable:true,
                                      width:'100%',
                                      okType:"ghost",
                                      onOk:(e)=>{
                                          console.log(JSON.stringify(this.state.scripts),e);
                                        md.destroy();
                                      }
                                    })
                                  }}>查看脚本</Button>
                                  <Button onClick={
                                    ()=> {
                                      let inputValue:string;
                                      let setJsonMd = Modal.info(
                                        {
                                          title:'输入要解析的json',
                                          content:<Input onChange={(e) => {
  inputValue = e.target.value;
  console.log('输入了内容:', e.target.value);
}}/>,
                                          onOk:(e)=>
                                          {
                                            console.log('e是:',e);
                                            let json = JSON.parse(inputValue);
                                            if(!json || Object.keys(json).length<1)
                                            {
                                              message.error('输入的脚本json无效').then(r=>console.log(r));
                                            }
                                            else {
                                              console.log('json是:', json);
                                              this.setState({scripts:json});
                                              this.save();
                                              setJsonMd.destroy();
                                            }
                                          }
                                        }
                                      )
                                    }
                                  }>设置脚本</Button>
                                    <Button onClick={()=>{localStorage.clear();message.success('缓存已清空').then(r=>console.log(r));this.load()}}>清空缓存</Button>
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
                                    <Splitter/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id={'右侧的工具栏'} className={classNames.rightColumn}>
                        <div id={'脚本列表集合'} className={classNames.scriptListContent}>
                            {
                                Object.keys(scripts).map(
                                    (key)=>
                                    {
                                        let obj:IScript = scripts[key];
                                        if (!obj)
                                        {
                                            return null;
                                        }
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
                                          <div className={classNames.deleteScriptBtn}
                                               hidden={currentSelectScriptId!==key}
                                               onClick={()=>{
                                                 Modal.warn({
                                                   title:'确认要删除此脚本吗?',
                                                   okCancel:true,
                                                   okText:'删除',
                                                   cancelText:'取消',
                                                   onOk:()=>
                                                   {
                                                     delete scripts[key];
                                                     this.setState({scripts: scripts});
                                                   }
                                                 })
                                               }}
                                          >
                                            删除
                                          </div>

                                            <div id={'脚本标题'} className={classNames.scriptTitle}>{key}</div>
                                            <div id={'脚本副标题'} className={classNames.scriptSubTitle}>{obj.name}</div>
                                            <div id={'片段列表容器'} className={classNames.snippetListContent}>
                                                {/*<div className={classNames.snippet}></div>*/}
                                                {
                                                    Object.keys(obj.snippets?obj.snippets:[]).map((sKey) => {
                                                        return <div key={sKey} className={classNames.snippet}
                                                                    onClick={
                                                                      // ()=>this.setState({currentSelectedSnippet:obj.snippets[sKey]})
                                                                      ()=> {
                                                                          const getMovie = (movieId?: string): IMovie | null => {
                                                                              if(!movieId)
                                                                                  return null;
                                                                              for (let i = 0; i < this.state.moviesSources.length; i++) {
                                                                                  if (this.state.moviesSources[i].id === movieId) {
                                                                                      return this.state.moviesSources[i];
                                                                                  }
                                                                              }
                                                                              return null;
                                                                          }
                                                                          let movie = getMovie(obj.snippets[sKey].movieId);
                                                                          // console.log('获取电影的结果:',  obj.snippets[sKey]);
                                                                          if (movie) {
                                                                              this.showSnippetEditor(movie.id, movie.movieUrl, movie.duration, key, obj.snippets[sKey], 'edit')
                                                                          }
                                                                      }
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
