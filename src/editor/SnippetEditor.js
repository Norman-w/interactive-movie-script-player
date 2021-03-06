import React, {Component} from 'react';
import classNames from './SnippetEditor.module.css'
import {Radio, Input, Button, InputNumber,Collapse, Modal} from "antd";
import MovieSnippetPlayer from "../player/MovieSnippetPlayer";
import 'antd/dist/antd.css';
import utils from "../utils/utils";

const { Panel } = Collapse;

/*2021年09月20日17:23:01
已经实现了视频可以循环播放,接下来添加节点的时候,让节点可以选择播放完毕以后的动作
问题类 播放完毕后播放等待视频等待交互,回答类 播放完毕后跳转到目标视频, 等待类 播放完毕后重复播放 中间有交互后跳出视频播放转到回答类逻辑
snippetEditor可以继续进行细化了.各个片段的相关的信息 如时常,所属视频 所属脚本 开始时间结束时间 如果是问题类型可以选择现有的循环片段等.
2021年10月10日12:42:12 把过场视频的选择使用折叠方式
* */

/*
2021年10月06日22:32:45 下一步 让点击了可选择的过场或者要跳转等的视频上时候  当前的视频要暂停播放  然后播放点击的视频 弹窗出来
*
* */
class SnippetEditor extends Component {
  state =
    {
      snippet: {},
      movieId: '',
      movieUrl: '',
      scriptId: '',
      mode: 'create',
      scripts: {},
    }


  componentDidMount() {
    this.setState({
      snippet: this.props.snippet,
      movieId: this.props.movieId,
      movieUrl: this.props.movieUrl,
      movieDuration: this.props.movieDuration,
      scriptId: this.props.scriptId,
      mode: this.props.mode,
      scripts: this.props.scripts,
    });
  }

  //region 获取脚本的全index
  getSnippetFullKey(snippet) {
    let ret = snippet.scriptId + '.' + snippet.movieId + '.' + snippet.type + '.' + snippet.id;
    console.log('编辑页面 返回脚本index', ret);
    return ret;
  }
  //endregion
  //region 开始时间改变了
  onChangeStartTime(value) {
    let sn = this.state.snippet;
    sn.startTime = value;
    this.setState({snippet: sn}
      , () => {
        this.movieSnippetPlayerRef.rePlay(value);
      }
    );
  }

  //endregion
  //region 结束时间改变了
  onChangeEndTime(value) {
    let sn = this.state.snippet;
    sn.endTime = value;
    this.setState({snippet: sn}
      , () => {
        this.movieSnippetPlayerRef.rePlay(value);
      }
    );
  }

  //endregion
  //region 当小视频播放的时候要暂停大视频
  onClickPauseBtn() {
  }

  //endregion
  //region 预览小图标中的视频
  preView(snippet) {
    //region 暂停主视频并开启预览
    if (this.movieSnippetPlayerRef) {
      this.movieSnippetPlayerRef.player.pause();
      // console.log('点了小视频,大视频要暂停');
      //region 点了一个视频以后,让视频弹出一个弹窗播放预览.
      Modal.success(
        {
          width: 1000,
          title: '',
          icon: null,
          maskClosable: true,
          content:
            <div>
              <div>
                索引:{snippet.index} 名称:{snippet.name}
              </div>
              <MovieSnippetPlayer enableClickPlay={true}
                                  autoPlay={true}
                                  movieUrl={snippet.movieUrl}
                                  startTime={snippet.startTime}
                                  endTime={snippet.endTime}
              />
            </div>
          ,
        }
      )
      //endregion
    }
    //endregion
  }

  //endregion
  render() {
    let snippet = this.state.snippet;
    let movieId = this.state.movieId;
    let movieUrl = this.state.movieUrl;
    let movieDuration = this.state.movieDuration;
    let scriptId = this.state.scriptId;
    if (!snippet || !movieId || !scriptId || !movieUrl) {
      return null;
    }
    let scriptList = utils.jsonField2Array(this.state.scripts);
    // let player = this.movieSnippetPlayerRef;

    return (
      <div className={classNames.main}>
        <div>{snippet.index}</div>
        <MovieSnippetPlayer
          enableClickPlay={true}
          autoPlay
          movieUrl={movieUrl}
          startTime={snippet.startTime}
          endTime={snippet.endTime}
          ref={e => this.movieSnippetPlayerRef = e}
        />
        <div className={classNames.info}>
          <div className={classNames.ownerInfo}>
            <div>所属视频:{movieId}</div>
            <div>所属脚本:{scriptId}</div>
          </div>
          <div id={'时间信息'} className={classNames.timeInfo}>
            <div id={'开始时间行'} className={classNames.timeInfoLine}>
              <div className={classNames.timeLabel}>开始时间:</div>
              <div className={classNames.timeInput}>
                <InputNumber
                  style={{
                    width: "100%",
                  }}
                  defaultValue={snippet.startTime}
                  value={snippet.startTime}
                  min="0"
                  max={'' + movieDuration}
                  step="0.01"
                  onChange={(e) => this.onChangeStartTime(e)}
                  stringMode
                />
              </div>
            </div>
            <div id={'结束时间行'} className={classNames.timeInfoLine}>
              <div className={classNames.timeLabel}>结束时间:</div>
              <div className={classNames.timeInput}>
                <InputNumber
                  style={{
                    width: '100%',
                  }}
                  defaultValue={snippet.endTime}
                  value={snippet.endTime}
                  min="0"
                  max={'' + movieDuration}
                  step="0.01"
                  onChange={(e) => this.onChangeEndTime(e)}
                  stringMode
                />
              </div>
            </div>
          </div>
        </div>
        <div className={classNames.idNameLine}>
          <Input placeholder={'脚本id'} value={this.state.snippet.id}
                 disabled={this.state.mode !== 'create'}
                 maxLength={20}
                 onChange={
                   (e) => {
                     this.props.snippet.id = '' + e.target.value;
                     this.props.snippet.index = this.getSnippetFullKey(this.props.snippet);
                     this.setState({snippet: this.props.snippet})
                   }
                 }
          />
          <Input placeholder={'脚本名称'} value={this.state.snippet.name}
                 maxLength={20}

                 onChange={
                   (e) => {

                     this.props.snippet.name = '' + e.target.value;
                     this.setState({snippet: this.props.snippet})
                   }
                 }
          /></div>
        <div style={{marginTop: 22}}>选择该片段的类型:</div>
        <Radio.Group
          onChange={v => {
            this.props.snippet.type = v.target.value;
            this.props.snippet.index = this.getSnippetFullKey(this.props.snippet);
            this.setState({snippet: this.props.snippet})
          }}
          value={this.state.snippet.type}
          // value={snippet.type}
        >
          <Radio value={'question'}>问题</Radio>
          <Radio value={'questionWithWaiter'}>带过场的问题</Radio>
          <Radio value={'info'}>一般</Radio>
          <Radio value={'transitions'}>过场</Radio>
        </Radio.Group>
        <div id={'可选择的过场集合'} style={{marginTop: 22}}
             hidden={this.state.snippet.type !== 'questionWithWaiter'}
        >
          <div>选择过场视频:</div>
          <Collapse accordion className={classNames.scriptsSnippetsList}>
            {
              scriptList.map((script, index) => {
                let snippetsList = utils.jsonField2Array(script.snippets);
                return <Panel header={script.name} key={index}>
                  {
                    snippetsList.map((snippet) => {
                        if (snippet.id === this.state.snippet.id || snippet.type !== "transitions") {
                          return null;
                        }
                        let c = classNames.transition;
                        if (this.state.snippet.transitionSnippetIndex === snippet.index) {
                          c = classNames.transitionSelected;
                        }
                        return <div key={'transitions' + snippet.scriptId + snippet.movieId + snippet.id} className={c}
                                    onClick={() => {
                                      let oldSnippet = this.state.snippet;
                                      oldSnippet.transitionSnippetIndex = snippet.index;
                                      this.setState({snippet: oldSnippet});
                                      this.preView(snippet);
                                    }}
                        >
                          <MovieSnippetPlayer id={'就当做一个图片的图标了.'} enableClickPlay={false}
                                              autoPlay={false}
                                              movieUrl={snippet.movieUrl}
                                              startTime={snippet.startTime}
                                              endTime={snippet.endTime}
                          />
                        </div>
                      }
                    )
                  }
                </Panel>
              })
            }
          </Collapse>
        </div>

        <div
          hidden={this.state.snippet.type !== 'info'}>
          <div style={{marginTop: 22}}>片段播放结束后动作:</div>
          <Radio.Group
            onChange={(e) => {
              this.props.snippet.actionAtEnd = e.target.value;
              this.setState({snippet: this.props.snippet})
            }}
            value={this.state.snippet.actionAtEnd}
          >
            {/*<Radio value={'toWaiterSnippet'}>等待交互</Radio>*/}
            {/*<Radio value={'replay'}>重播</Radio>*/}
            <Radio value={'redirect'}>跳转</Radio>
            <Radio value={'none'}>停止</Radio>
            <Radio value={'return'}>跳出</Radio>
          </Radio.Group>
        </div>
        <div id={'可选择的目标视频'} style={{marginTop: 22}}
             hidden={!this.state.snippet.redirect || this.state.snippet.type !== 'info'}
        >
          <div>选择将要跳转的目标视频:</div>
          <Collapse accordion className={classNames.scriptsSnippetsList}>
            {
              scriptList.map((script, index) => {
                let snippetsList = utils.jsonField2Array(script.snippets);
                return <Panel header={script.name} key={index}>
                  {
                    snippetsList.map((snippet) => {
                        if (snippet.id === this.state.snippet.id || snippet.type === "transitions") {
                          return null;
                        }
                        let c = classNames.transition;
                        if (this.state.snippet.redirectSnippetIndex === snippet.index) {
                          c = classNames.transitionSelected;
                        }
                        if (snippet.id === this.state.snippet.id) {
                          return null;
                        }
                        return <div key={'all' + snippet.scriptId + snippet.movieId + snippet.id} className={c}
                                    onClick={() => {
                                      let oldSnippet = this.state.snippet;
                                      oldSnippet.redirectSnippetIndex = snippet.index;
                                      this.setState({snippet: oldSnippet});
                                      this.preView(snippet);
                                    }}
                        >
                          <MovieSnippetPlayer id={'就当做一个图片的图标了.'} enableClickPlay={false}
                                              autoPlay={false}
                                              movieUrl={snippet.movieUrl}
                                              startTime={snippet.startTime}
                                              endTime={snippet.endTime}
                          />
                        </div>
                      }
                    )
                  }
                </Panel>
              })
            }
          </Collapse>

        </div>
        <div id={'删除行'} hidden={this.state.mode === 'create'} style={{marginTop: '18px'}}><Button danger
                                                                                                  onClick={this.props.onDelete.bind(this)}>删除</Button>
        </div>
      </div>
    );
  }
}

export default SnippetEditor;
