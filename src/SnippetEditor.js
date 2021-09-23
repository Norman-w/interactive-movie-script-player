import React, {Component} from 'react';
import classNames from './SnippetEditor.module.css'
import {Radio,Input,Select} from "antd";
import MovieSnippetPlayer from "./MovieSnippetPlayer";
import {act} from "@testing-library/react";
const {Option} = Select;
/*2021年09月20日17:23:01
已经实现了视频可以循环播放,接下来添加节点的时候,让节点可以选择播放完毕以后的动作
问题类 播放完毕后播放等待视频等待交互,回答类 播放完毕后跳转到目标视频, 等待类 播放完毕后重复播放 中间有交互后跳出视频播放转到回答类逻辑
snippetEditor可以继续进行细化了.各个片段的相关的信息 如时常,所属视频 所属脚本 开始时间结束时间 如果是问题类型可以选择现有的循环片段等.
* */
class SnippetEditor extends Component {
    state=
        {
            id:'',
            name:'',
            type:''
        }
        constructor(props) {
          super(props);
          this.state=this.props;
        }
    render() {
        let snippet = this.state.snippet;
        let movie = this.state.movie;
        let scriptId = this.state.scriptId;
        if (!snippet)
        {
          return null;
        }

        return (
            <div>
              <MovieSnippetPlayer
                autoPlay
                movieUrl={movie.movieUrl}
                startTime={snippet.startTime}
                endTime={snippet.endTime}/>
                <div className={classNames.info}>
                  <div className={classNames.ownerInfo}>
                    <div>所属视频:{movie.id}</div>
                    <div>所属脚本:{scriptId}</div>
                  </div>
                  <div className={classNames.timeInfo}>
                    <div>开始:{snippet.startTime}</div>
                    <div>结束:{snippet.endTime}</div>
                    <div>持续:{snippet.duration}</div></div>
                </div>
              <div className={classNames.idNameLine}>
                  <Input placeholder={'脚本id'} value={this.state.id}
                                                                maxLength={20}
                                                                onChange={
                                                                    (e)=>{
                                                                        this.setState({id:''+e.target.value})
                                                                        snippet.id=''+e.target.value;
                                                                    }
                                                                }
                />
                    <Input placeholder={'脚本名称'} value={this.state.name}
                           maxLength={20}
                           onChange={
                               (e)=>{
                                   this.setState({name:''+e.target.value})
                                   snippet.name=''+e.target.value;
                               }
                           }
                    /></div>
              <div style={{marginTop:22}}>选择该片段的类型:</div>
              <Radio.Group
                 onChange={v=>{
                   snippet.type=v.target.value;
                   this.setState({type:v.target.value})
                   console.log(v.target.value)
                 }}
                 value={this.state.type}
                // value={snippet.type}
              >
                <Radio value={'question'}>问题</Radio>
                <Radio value={'questionWithWaiter'}>带过场的问题</Radio>
                <Radio value={'info'}>一般</Radio>
                <Radio value={'transitions'}>过场</Radio>
              </Radio.Group>
              <div id={'可选择的过场集合'} style={{marginTop:22}}
                   hidden={this.state.type!=='questionWithWaiter'}
              >
                <div>选择过场视频:</div>
                <div className={classNames.transitionsList}>
                  <div className={classNames.transition}>
                    <MovieSnippetPlayer
                      autoPlay={false}
                      movieUrl={'https://www.enni.group/file/testmovie/2.MP4'}
                      startTime={88}
                      endTime={90}/>
                  </div>
                  <div className={classNames.transitionSelected}></div>
                </div>
              </div>

              <div
                hidden={this.state.type!=='info'}>
                <div style={{marginTop:22}}>片段播放结束后动作:</div>
              <Radio.Group
                onChange={(e)=>{
                  // console.log('eshi',e.target.value);
                  this.setState({redirect:e.target.value})
                }}
                value={this.state.redirect}
              >
                {/*<Radio value={'toWaiterSnippet'}>等待交互</Radio>*/}
                {/*<Radio value={'replay'}>重播</Radio>*/}
                <Radio value={true}>跳转</Radio>
                <Radio value={false}>无动作</Radio>
              </Radio.Group>
              </div>
              <div id={'可选择的目标视频'} style={{marginTop:22}}
                   hidden={!this.state.redirect || this.state.type!=='info'}
              >
                <div>选择将要跳转的目标视频:</div>
                <div className={classNames.transitionsList}>
                  <div className={classNames.transition}>
                    <MovieSnippetPlayer
                      autoPlay={false}
                      movieUrl={'https://www.enni.group/file/testmovie/2.MP4'}
                      startTime={88}
                      endTime={90}/>
                  </div>
                  {/*<div className={classNames.transition}></div>*/}
                  {/*<div className={classNames.transition}></div>*/}
                  {/*<div className={classNames.transition}></div>*/}
                  {/*<div className={classNames.transition}></div>*/}
                  {/*<div className={classNames.transition}></div>*/}
                  {/*<div className={classNames.transition}></div>*/}
                  {/*<div className={classNames.transition}></div>*/}
                  <div className={classNames.transitionSelected}></div>
                </div>
              </div>
            </div>
        );
    }
}

export default SnippetEditor;
