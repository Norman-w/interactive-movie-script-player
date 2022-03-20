//根据脚本,获取用于用户交互的React Dom
import SenderMobileInputForm from "./QPScriptInteractors/SenderMobileInputForm";
import classNames from "../player/InteractiveMovieScriptPlayer.module.css";
import ItemInfoPrintingDestSelectForm from "./QPScriptInteractors/ItemInfoPrintingDestSelectForm";
import AutoPrintRule from "./QPScriptInteractors/AutoPrintRule";
import PerSpanPrint from "./QPScriptInteractors/PerSpanPrint";
import PerCountPrint from "./QPScriptInteractors/PerCountPrint";
import UseQPPaper from "./QPScriptInteractors/UseQPPaper";
import UseQpPaperRule from "./QPScriptInteractors/UseQPPaperRule";
import utils from "../utils/utils";
import React from "react";
import AutoSend from "./QPScriptInteractors/AutoSend";

let setting=null
const loadSetting=function ()
{
  console.log('执行加载函数');
  utils.doPost({
    api:'qp.ui.settings.get',
    routerUrl:'https://www.enni.group/netserver/router.aspx',
    params:{
      scope:'User',
      names:'BagsHandlerSetting',
    },success:(res)=>
    {
      console.log('执行完了post之后是:', res);
      if(res.Success&&res.Settings&&res.Settings.length>0)
      {
        if (res.Settings[0].Name==='BagsHandlerSetting') {
          setting = JSON.parse(res.Settings[0].JsonContent);
          console.log('设置setting是:', setting);
        }
      }
    },
    session:'1717',
  }).catch(reason => console.log(reason))
}
loadSetting();
class QPScriptProcessor {

  //当播放器需要脚本处理器给播放器一个页面信息时,调用这个方法,该方法的参数 依次为 需要根据哪个片段来获取dom,清空之前正在询问的问题片段信息函数,改变当前播放的脚本的函数,通过片段index获取片段的函数
  getInteractionDom = function (
    {snippet,clearInteractingQuestionFunc, showHideInteractingDomFunc, changeSnippetFunc, getSnippetByIndexFunc}
  )
  {
    //region 如果没有设置 先获取设置
    if (!setting) {
      loadSetting();
    }
    //endregion
    //region 如果是需要输入手机号
    if (snippet.index.indexOf("setSenderMobile") >= 0) {
      return <SenderMobileInputForm onSubmit={() => {
        // console.log(e);
        clearInteractingQuestionFunc();
        changeSnippetFunc('setSenderMobile.initMovieSet3.info.right');
      }}
      />;
    }
      //endregion
      //region 设置完毕手机号以后 的  好的  自动跳转到 选择打印方式
      //setSenderMobile.initMovieSet3.info.right
      //endregion
    //region 另外如果是需要选择如何打印商品详情
    else if (snippet.index === 'selectPrintMode.initMovieSet4.questionWithWaiter.selectPrintMode') {
      let answerOptions = [
        {
          id: 'a',
          snippetIndex: 'selectPrintMode.initMovieSet5.questionWithWaiter.selectedWaybill',
          title: 'A',
          // desc:'',
          // content:<Button size={'large'} type={'primary'} danger>确认</Button>
          content: <div>
            <div>选项为图片</div>
            <img src={'https://www.enni.group/file/test2.png'} className={classNames.img} alt={'选项图片'}/>
          </div>
        },
        {
          id: 'b',
          snippetIndex: 'selectPrintMode.initMovieSet5.info.smartChoice',
          title: 'B',
          desc: '打印到单独详单'
        },

      ];
      return <ItemInfoPrintingDestSelectForm answerOptions={answerOptions}
                                             onSelectAnswer={(answer) => {
                                               let destAnswerSnippetIndex = answer.snippetIndex;
                                               clearInteractingQuestionFunc();
                                               changeSnippetFunc(destAnswerSnippetIndex);
                                             }}/>;
    }
      //endregion
    //region 提问  问用户要把大于5种商品的包裹  商品详情打印在哪里?
    else if (snippet.index === 'selectPrintMode.initMovieSet5.questionWithWaiter.selectedWaybill') {
      //region 定义可选问题项
      let answerOptions = [
        {
          id: 'a',
          snippetIndex: 'selectPrintMode.initMovieSet5.questionWithWaiter.selectedWaybill',
          title: '使用面单纸',
          // desc:'',
          // content:<Button size={'large'} type={'primary'} danger>确认</Button>
          content: <div>
            <div>将使用快递单作为商品详单,但快递单不具备自动切纸功能,可能会造成浪费哦</div>
            {/*<img src={'https://www.enni.group/file/test2.png'} className={classNames.img}/>*/}
          </div>
        },
        {
          id: 'b',
          snippetIndex: 'selectPrintMode.initMovieSet5.info.smartChoice',
          title: '使用热敏纸',
          desc: '将包商品种类大于5种的详单,打印在80毫米的热敏打印机上,这需要一台热敏打印机',
        },
      ];
      //endregion
      return <ItemInfoPrintingDestSelectForm answerOptions={answerOptions}
                                             onSelectAnswer={(answer) => {
                                               let destAnswerSnippetIndex = answer.snippetIndex;
                                               clearInteractingQuestionFunc();
                                               changeSnippetFunc(destAnswerSnippetIndex);
                                             }}/>;
    }
      //endregion
    //region 如果需要用户反馈有没有或者使用不使用80毫米热敏打印机
    else if (snippet.index === 'deviceInfo.initMovieSet6.questionWithWaiter.pcAndWaybillPrinter') {
      //region 定义可选问题
      let answerOptions = [
        {
          id: 'a',
          snippetIndex: 'deviceInfo.initMovieSet6.info.needSpeaker',
          title: '已准备好',
          desc: '打印机和电脑已经正确连接并可以使用'
        },
        {
          id: 'b',
          snippetIndex: 'deviceInfo.initMovieSet6.info.giftPrinter',
          title: '需要赠送',
          desc: '我需要速配赠送打印机',
        },
        {
          id: 'c',
          snippetIndex: '',
          title: '不需要',
          desc: '我不需要打印商品清单,也不使用后置打单功能',
        },
        {
          id: 'd',
          snippetIndex: '',
          title: '什么是后置打单?',
          desc: '后置打单好处多,点击观看后置打单功能的说明',
        }
      ];
      //endregion
      return <ItemInfoPrintingDestSelectForm answerOptions={answerOptions}
                                             onSelectAnswer={(answer) => {
                                               // let answerSnippet = this.snippetsDic[answer.snippetIndex];
                                               let answerSnippet = getSnippetByIndexFunc(answer.snippetIndex);
                                               console.log('选择答案的片段:', answer.snippetIndex, answerSnippet);
                                               if (answerSnippet && answerSnippet.actionAtEnd === 'return') {
                                                 //如果是要返回到上一个问题的话,那就不能清空问题而是继续显示上一个问题
                                                 showHideInteractingDomFunc(false);
                                               } else {
                                                 //如果选择的选项不是要了解某些功能的,那就是已经对问题做出了回应. 如果已经做出了回应 最后交互的问题就设置为空.
                                                 clearInteractingQuestionFunc();
                                               }
                                               let destAnswerSnippetIndex = answer.snippetIndex;

                                               changeSnippetFunc(destAnswerSnippetIndex);
                                             }}/>;
    }
    //endregion
    //region 自动打印设置相关的脚本
    else if(snippet.index.indexOf('autoPrintRule') ===0) {
      //region 每天什么时候开始打单
      if (snippet.index === 'autoPrintRule.initMovieSet7.questionWithWaiter.startTime') {
        return <AutoPrintRule time={{hour: 8, minute: 45, round: 0}} onSubmit={() => {
          // console.log('确定了,', t)
          clearInteractingQuestionFunc();
          showHideInteractingDomFunc(false);
          changeSnippetFunc('autoPrintRule.initMovieSet7.questionWithWaiter.perSpanPrint');
        }
        }/>
      }
        //endregion
      //region 每隔多久打印一次订单
      else if (snippet.index === 'autoPrintRule.initMovieSet7.questionWithWaiter.perSpanPrint') {
        return <PerSpanPrint onSubmit={() => {
          clearInteractingQuestionFunc();
          showHideInteractingDomFunc(false);
          changeSnippetFunc('autoPrintRule.initMovieSet7.questionWithWaiter.lastPrintTime');
        }
        }/>
      }
        //endregion
      //region 最后一次打印截止到什么时候
      else if (snippet.index === 'autoPrintRule.initMovieSet7.questionWithWaiter.lastPrintTime') {
        return <AutoPrintRule time={{hour: 4, minute: 30, round: 1}} onSubmit={() => {
          // console.log('确定了,', t)
          clearInteractingQuestionFunc();
          showHideInteractingDomFunc(false);
          changeSnippetFunc('autoPrintRule.initMovieSet7.questionWithWaiter.perCountPrint');
        }
        }/>
      }
        //endregion
      //region 工作时间内是否需要订单够一定的数量就把他们打印出来
      else if (snippet.index === 'autoPrintRule.initMovieSet7.questionWithWaiter.perCountPrint') {
        return <PerCountPrint onSubmit={() => {
          clearInteractingQuestionFunc();
          showHideInteractingDomFunc(false);
          changeSnippetFunc('autoPrintRule.initMovieSet7.questionWithWaiter.printQPPaper');
        }
        }>

        </PerCountPrint>
      }
        //endregion
      //region 是否使用速配单速派单的页面
      else if (snippet.index === 'autoPrintRule.initMovieSet7.questionWithWaiter.printQPPaper') {
        //region 定义可选问题
        let answerOptions = [
          {
            id: 'a',
            snippetIndex: 'autoPrintRule.initMovieSet7.info.whatIsQPPaper',
            title: 'Introduce',
            desc: '了解详细介绍'
          },
          {
            id: 'b',
            snippetIndex: 'autoPrintRule.initMovieSet7.questionWithWaiter.howMuchUseQPPaper',
            title: 'Enable',
            desc: '使用',
          },
          {
            id: 'c',
            snippetIndex: 'autoPrintRule.initMovieSet7.questionWithWaiter.autoSend',
            title: 'Disable',
            desc: '不使用',
          },
        ];
        //endregion
        return <UseQPPaper answerOptions={answerOptions} onSelectAnswer={
          (answer) => {
            let answerSnippet = getSnippetByIndexFunc(answer.snippetIndex);
            console.log('选择答案的片段:', answer.snippetIndex, answerSnippet);
            if (answerSnippet && answerSnippet.actionAtEnd === 'return') {
              //如果是要返回到上一个问题的话,那就不能清空问题而是继续显示上一个问题
              showHideInteractingDomFunc(false);
            } else {
              //如果选择的选项不是要了解某些功能的,那就是已经对问题做出了回应. 如果已经做出了回应 最后交互的问题就设置为空.
              clearInteractingQuestionFunc();
            }
            let destAnswerSnippetIndex = answer.snippetIndex;

            changeSnippetFunc(destAnswerSnippetIndex);
          }
        }/>
      }
        //endregion
      //region 启用速配单和速派单的条件设置页面
      else if (snippet.index === 'autoPrintRule.initMovieSet7.questionWithWaiter.howMuchUseQPPaper') {
        return <UseQpPaperRule setting={setting} onSubmit={e => {
          console.log('确定后的设置内容是:', e);
          // message.warn('这个地方要保存到服务器上,然后跳转到下一个问题');
          clearInteractingQuestionFunc();
          showHideInteractingDomFunc(false);
          changeSnippetFunc('autoPrintRule.initMovieSet7.questionWithWaiter.autoSend');
        }
        }/>
      }
      //endregion
      //region 打印完快递单以后是否自动发货
      else if(snippet.index === 'autoPrintRule.initMovieSet7.questionWithWaiter.autoSend')
      {
        //region 定义可选问题
        let answerOptions = [
          {
            id: 'a',
            snippetIndex:null,
            title: '自动',
            desc: '自动处理时,自动打印快递单并执行发货'
          },
          {
            id: 'b',
            snippetIndex:null,
            title: '智能',
            desc: '有快递公司物流揽收记录时,自动执行发货'
          },
          {
            id: 'c',
            snippetIndex:null,
            title: '联动',
            desc: '等待扫码枪扫描快递单号,或执行出库校验及监控拍照后联动发货',
          },
          {
            id: 'd',
            snippetIndex:null,
            title: '手动',
            desc: '在电商后台手动执行单号上传',
          },
        ];
        //endregion
        return <AutoSend answerOptions={answerOptions} onSelectAnswer={e=> {
          console.log('自动发货执行方案的答案是:',e);
        }
        }/>
      }
      //endregion
    }
    //endregion
    //region 其他的问题


    //endregion
  }
}

const scriptProcessor = new QPScriptProcessor();
export  default scriptProcessor;
