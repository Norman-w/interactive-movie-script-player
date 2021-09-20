import React, {Component} from 'react';
import classNames from './SnippetEditor.module.css'
import {Input, Select} from "antd";
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
        }
    render() {
        let snippet = this.props.snippet;
        return (
            <div>
                <div className={classNames.lineFlexRow}> <Input placeholder={'脚本id'} value={this.state.id}
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
                <Select defaultValue="脚本类型" style={{ width: 120 }}
                    onChange={e=>{snippet.type=e;}}
                >
                    <Option value="question">问题</Option>
                    <Option value="answer">回答</Option>
                    <Option value="transitions">
                        过场
                    </Option>
                </Select>
            </div>
        );
    }
}

export default SnippetEditor;