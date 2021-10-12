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
import {Button, message} from "antd";
// import 'antd/dist/antd.css'
import AnswerSelector from "./AnswerSelector";
import SenderMobileInputForm from "./QPScriptInteractors/SenderMobileInputForm";
import ItemInfoPrintingDestSelectForm from "./QPScriptInteractors/ItemInfoPrintingDestSelectForm";
//endregion
//region 正在交互中的问题类型枚举.
// const interactingQuestionTypeEnum=
//     {
//       //没有在交互
//       none:'',
//       //输入
//       input:'input',
//       //选择器
//       selector:'selector',
//     }
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
  answerSelectorRef = null;
  snippetPlayer=null;
  //region 页面数据  state
  state =
    {
      currentSnippet:null,
      //正在交互中的问题类型
      interactingQuestionDom:null,
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
    if (!first)
    {
      message.error('未能获取到作为入口的片段信息');
      return;
    }
    if(this.snippetPlayer)
    {
      this.setState({currentSnippet:first});
      this.snippetPlayer.changeSnippet(first,true);
      console.log('设置第一播放片段为:',first);
    }
    else
    {
      console.log('还没有获取到片段播放器');
    }
  }
  //endregion

  //region 获取第一个入口点片段

  getFirstEntrySnippet()
  {
    console.log('获取第一脚本视频')
    let keys = Object.keys(this.snippetsDic);
    for (let i = 0; i < keys.length; i++) {
      let current = this.snippetsDic[keys[i]];
      // if (current.type.indexOf('info') >=0)
      // {
      //   return current;
      // }
      if (current.index.indexOf('right') >=0)
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
    console.log('片段播放完毕,片段是:',snippet);
    //region 如果视频需要交互 展示交互页面
    if (snippet.type.indexOf('question')>=0) {
      //region 如果是需要输入手机号
      if (snippet.index.indexOf("setSenderMobile")>=0)
      {
        let senderMobileInputForm =<SenderMobileInputForm onSubmit={(e) => {
          // console.log(e);
          this.setState({interactingQuestionDom: null}, () => {
            //设置完了发货人的手机号以后,跳转到收件人手机号的  好的 剧本 ,然后 好的 剧本再跳转到 选择打印快递单模式
                this.changeSnippet('setSenderMoile.initMovieSet3.info.right');
              }
          );
        }}
        />;
        //如果当前的脚本是让输入手机号码,构造完了设置手机号的dom以后 显示在播放器的上层
        this.setState({interactingQuestionDom:senderMobileInputForm}
            ,()=>
            {
              //设置完以后,如果当前这个脚本视频需要有承接视频,显示承接视频
              if (snippet.transitionSnippetIndex)
              {
                this.changeSnippet(snippet.transitionSnippetIndex);
              }
            }
        )
        return;
      }
      //endregion
      //region 设置完毕手机号以后 的  好的  自动跳转到 选择打印方式
          //setSenderMoile.initMovieSet3.info.right
          //endregion
      //region 另外如果是需要选择如何打印商品详情
      else if(snippet.index ==='selectPrintMode.initMovieSet4.questionWithWaiter.selectPrintMode')
      {
        let answerOptions = [
          {
            id: 'a',
            snippetIndex: 'selectPrintMode.initMovieSet5.questionWithWaiter.selectedWaybill',
            title:'A',
            // desc:'',
            // content:<Button size={'large'} type={'primary'} danger>确认</Button>
            content:<div>
              <div>选项为图片</div>
              <img src={'https://www.enni.group/file/test2.png'} className={classNames.img}/>
            </div>
          },
          {
            id: 'b',
            snippetIndex: 'selectPrintMode.initMovieSet5.info.smartChoice',
            title:'B',
            desc:'打印到单独详单'
          },
          // {
          //   id: 'c',
          //   snippetIndex:Object.keys(this.snippetsDic)[4],
          //   title:'C',
          //   desc:''
          // },
          // {id:'a4'},
          // {id:'a5'},{id:'a6'},{id:'a7'},{id:'a8'},
          // {id:'a9'}
        ];
        let selectPrintModeForm=<ItemInfoPrintingDestSelectForm answerOptions={answerOptions} onSelectAnswer={(answer)=>{
          let id = answer.id;
          let destAnswerSnippetIndex = answer.snippetIndex;
          this.changeSnippet(destAnswerSnippetIndex);
          this.setState({interactingQuestionDom:null})
        }}/>
        this.setState({interactingQuestionDom:selectPrintModeForm}
            ,()=>
            {
              //设置完以后,如果当前这个脚本视频需要有承接视频,显示承接视频
              if (snippet.transitionSnippetIndex)
              {
                this.changeSnippet(snippet.transitionSnippetIndex);
              }
            }
        )
      }
      //endregion
      //region 提问  问用户要把大于5种商品的包裹  商品详情打印在哪里?
      else if(snippet.index==='selectPrintMode.initMovieSet5.questionWithWaiter.selectedWaybill')
      {
        //region 定义可选问题项
        let answerOptions = [
          {
            id: 'a',
            snippetIndex: 'selectPrintMode.initMovieSet5.questionWithWaiter.selectedWaybill',
            title:'使用面单纸',
            // desc:'',
            // content:<Button size={'large'} type={'primary'} danger>确认</Button>
            content:<div>
              <div>将使用快递单作为商品详单,但快递单不具备自动切纸功能,可能会造成浪费哦</div>
              {/*<img src={'https://www.enni.group/file/test2.png'} className={classNames.img}/>*/}
            </div>
          },
          {
            id: 'b',
            snippetIndex: 'selectPrintMode.initMovieSet5.info.smartChoice',
            title:'使用热敏纸',
            desc:'将包商品种类大于5种的详单,打印在80毫米的热敏打印机上,这需要一台热敏打印机',
          },
        ];
        //endregion
        let selectMoreItemDetailDeviceDom=<ItemInfoPrintingDestSelectForm answerOptions={answerOptions} onSelectAnswer={(answer)=>{
          let id = answer.id;
          let destAnswerSnippetIndex = answer.snippetIndex;
          this.changeSnippet(destAnswerSnippetIndex);
          this.setState({interactingQuestionDom:null})
        }}/>
        this.setState({interactingQuestionDom:selectMoreItemDetailDeviceDom}
          ,()=>
          {
            //设置完以后,如果当前这个脚本视频需要有承接视频,显示承接视频
            if (snippet.transitionSnippetIndex)
            {
              this.changeSnippet(snippet.transitionSnippetIndex);
            }
          }
        )
      }
      //endregion
      //region 如果需要用户反馈有没有或者使用不使用80毫米热敏打印机
      else if(snippet.index === 'deviceInfo.initMovieSet6.questionWithWaiter.pcandwaybillprinter')
      {
        //region 定义可选问题
        let answerOptions = [
          {
            id:'a',
            snippetIndex: '',
            title:'已准备好',
            desc:'打印机和电脑已经正确连接并可以使用'
          },
          {
            id:'b',
            snippetIndex: 'deviceInfo.initMovieSet6.info.giftPrinter',
            title:'需要赠送',
            desc:'我需要速配赠送打印机',
          },
          {
            id:'c',
            snippetIndex: '',
            title: '不需要',
            desc: '我不需要打印商品清单,也不使用后置打单功能',
          },
          {
            id:'d',
            snippetIndex: '',
            title:'什么是后置打单?',
            desc:'后置打单好处多,点击观看后置打单功能的说明',
          }
        ];
        //endregion
        let selectHas80PrinterDom=<ItemInfoPrintingDestSelectForm answerOptions={answerOptions} onSelectAnswer={(answer)=>{
          let id = answer.id;
          let destAnswerSnippetIndex = answer.snippetIndex;
          this.changeSnippet(destAnswerSnippetIndex);
          this.setState({interactingQuestionDom:null})
        }}/>
        this.setState({interactingQuestionDom:selectHas80PrinterDom}
            ,()=>
            {
              //设置完以后,如果当前这个脚本视频需要有承接视频,显示承接视频
              if (snippet.transitionSnippetIndex)
              {
                this.changeSnippet(snippet.transitionSnippetIndex);
              }
            }
        )
      }
      //endregion
      //region 其他的问题

      //这是个问题,那么要对问题进行答案的显示展示
      // this.answerSelectorRef.showAnswers(
      //   [
      //     {
      //       id: 'a1',
      //       snippetIndex: Object.keys(this.snippetsDic)[2],
      //       title:'A',
      //       desc:'打印到快递单',
      //       // content:<Button size={'large'} type={'primary'} danger>确认</Button>
      //       content:<div>
      //         <div>哈哈</div>
      //         <img src={'https://www.enni.group/file/test2.png'} className={classNames.img}/>
      //       </div>
      //     },
      //     {
      //       id: 'a2',
      //       snippetIndex: Object.keys(this.snippetsDic)[3],
      //       title:'B',
      //       desc:'打印到单独详单'
      //     },
      //     {
      //       id: 'a3',
      //       snippetIndex:Object.keys(this.snippetsDic)[4],
      //       title:'C',
      //       desc:'重新观看说明'
      //     },
      //     // {id:'a4'},
      //     // {id:'a5'},{id:'a6'},{id:'a7'},{id:'a8'},
      //     // {id:'a9'}
      //   ]
      // )

      //endregion
    }
    //endregion
    //如果当前视频不用动作直接跳转到下一个视频的话,直接跳转
    if (snippet.redirectSnippetIndex)
    {
      this.changeSnippet(snippet.redirectSnippetIndex);
      return;
    }
    //endregion
        //region 如果当前视频播放完毕后需要播放过场视频的话,转换到播放过场视频
    else if (snippet.transitionSnippetIndex)
    {
      this.changeSnippet(snippet.transitionSnippetIndex);
      return;
    }
    //endregion
        //region 如果当前视频是过场动画,直接进行重播
    else if(snippet.type==='transitions')
    {
      this.snippetPlayer.rePlay();
      return;
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
      message.error('脚本'+  index +'不存在');
      return;
    }
    // console.log('要播放的新片段是:',this.snippetsDic)
    this.setState({currentSnippet:newSnippet})
    this.snippetPlayer.changeSnippet(newSnippet,true);
  }
  //endregion

  //region 当用户对跳出来的问题进行了交互选择 onSelectAnswer
  onSelectAnswer(answer)
  {
    let id = answer.id;
    let destAnswerSnippetIndex = answer.snippetIndex;
    this.changeSnippet(destAnswerSnippetIndex);
    this.answerSelectorRef.showAnswers([]);
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
                                  console.log('设置当前页面播放器组件:',e);
                                  this.snippetPlayer=e;
                                }
                              }
                              }
          />
        </div>
        {interactingQuestionDom}
        {/*<AnswerSelector ref={e=>this.answerSelectorRef = e}*/}
        {/*                onSelectAnswer={e => {*/}
        {/*                  this.onSelectAnswer(e);*/}
        {/*                }*/}
        {/*                }*/}
        {/*/>*/}
      </div>
    )
  }

  //endregion
}

export default InteractiveMovieScriptPlayer;
