import React, {Component} from 'react';
import classNames from './ScriptEditor.module.css'
import {Input, Select} from 'antd';
import 'antd/dist/antd.css'
const { Option } = Select;

class ScriptEditor extends Component {
    state={
        id:'',
        name:'',
    }
    render() {
        let script = this.props.script;
        return (
            <div className={classNames.main}>
                设置脚本信息
                <div className={classNames.content}>
                    <div className={classNames.lineFlexRow}> <Input placeholder={'脚本id'} value={this.state.id}
                                                                    maxLength={20}
                                                                    onChange={
                                                                        (e)=>{
                                                                            this.setState({id:''+e.target.value})
                                                                            script.id=''+e.target.value;
                                                                        }
                                                                    }
                    />
                        <Input placeholder={'脚本名称'} value={this.state.name}
                               maxLength={20}
                               onChange={
                                   (e)=>{
                                       this.setState({name:''+e.target.value})
                                       script.name=''+e.target.value;
                                   }
                               }
                        /></div>
                </div>
            </div>
        );
    }
}

export default ScriptEditor;