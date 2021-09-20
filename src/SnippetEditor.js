import React, {Component} from 'react';
import classNames from './SnippetEditor.module.css'
import {Input, Select} from "antd";
const {Option} = Select;

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