//#region 模型/类型
/** 由 QPScriptProcessor 硬编码的交互跳转，未写入 snippet.redirectSnippetIndex */
export interface ProcessorFlowEdge {
  source: string;
  target: string;
}
//#endregion

//#region 常量/配置
/**
 * 与 QPScriptProcessor.getInteractionDom 中 changeSnippetFunc / answerOptions 保持一致。
 * 修改处理器逻辑时请同步更新此表。
 */
export const PROCESSOR_FLOW_EDGES: ProcessorFlowEdge[] = [
  {
    source: 'setSenderMobile.initMovieSet3.questionWithWaiter.setSenderMobile',
    target: 'setSenderMobile.initMovieSet3.info.right',
  },
  {
    source: 'selectPrintMode.initMovieSet4.questionWithWaiter.selectPrintMode',
    target: 'selectPrintMode.initMovieSet5.questionWithWaiter.selectedWaybill',
  },
  {
    source: 'selectPrintMode.initMovieSet4.questionWithWaiter.selectPrintMode',
    target: 'selectPrintMode.initMovieSet5.info.smartChoice',
  },
  {
    source: 'selectPrintMode.initMovieSet5.questionWithWaiter.selectedWaybill',
    target: 'selectPrintMode.initMovieSet5.info.smartChoice',
  },
  {
    source: 'deviceInfo.initMovieSet6.questionWithWaiter.pcAndWaybillPrinter',
    target: 'deviceInfo.initMovieSet6.info.needSpeaker',
  },
  {
    source: 'deviceInfo.initMovieSet6.questionWithWaiter.pcAndWaybillPrinter',
    target: 'deviceInfo.initMovieSet6.info.giftPrinter',
  },
  {
    source: 'autoPrintRule.initMovieSet7.questionWithWaiter.startTime',
    target: 'autoPrintRule.initMovieSet7.questionWithWaiter.perSpanPrint',
  },
  {
    source: 'autoPrintRule.initMovieSet7.questionWithWaiter.perSpanPrint',
    target: 'autoPrintRule.initMovieSet7.questionWithWaiter.lastPrintTime',
  },
  {
    source: 'autoPrintRule.initMovieSet7.questionWithWaiter.lastPrintTime',
    target: 'autoPrintRule.initMovieSet7.questionWithWaiter.perCountPrint',
  },
  {
    source: 'autoPrintRule.initMovieSet7.questionWithWaiter.perCountPrint',
    target: 'autoPrintRule.initMovieSet7.questionWithWaiter.printQPPaper',
  },
  {
    source: 'autoPrintRule.initMovieSet7.questionWithWaiter.printQPPaper',
    target: 'autoPrintRule.initMovieSet7.info.whatIsQPPaper',
  },
  {
    source: 'autoPrintRule.initMovieSet7.questionWithWaiter.printQPPaper',
    target: 'autoPrintRule.initMovieSet7.questionWithWaiter.howMuchUseQPPaper',
  },
  {
    source: 'autoPrintRule.initMovieSet7.questionWithWaiter.printQPPaper',
    target: 'autoPrintRule.initMovieSet7.questionWithWaiter.autoSend',
  },
  {
    source: 'autoPrintRule.initMovieSet7.questionWithWaiter.howMuchUseQPPaper',
    target: 'autoPrintRule.initMovieSet7.questionWithWaiter.autoSend',
  },
];
//#endregion
