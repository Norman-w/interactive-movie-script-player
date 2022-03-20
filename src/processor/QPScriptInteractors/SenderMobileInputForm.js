//直接使用rsf 可以创建一个这样的组件
import React, {useState} from 'react';
import classNames from './SenderMobileInputForm.module.css'
import {Button, Input, message} from "antd";
import '../../utils/utils';
import checkMobile from "../../utils/utils";
import utils from "../../utils/utils";

function SenderMobileInputForm(props) {
    let [mobile, setMobile] = useState('');
    let [canSubmit,setCanSubmit] =useState(false);
    let {onSubmit}=props;
    return (
        <div className={classNames.main}>
            {/*<div className={classNames.content}>*/}
            <div id={'左侧图片'} className={classNames.leftContent}>
                {/*<img src="https://www.enni.group/file/test2.png" alt="图片" className={classNames.img}/>*/}
            </div>
            <div id={'右侧输入'} className={classNames.rightContent}>
                <div>请输入用于打印在快递单上的发件人手机号码</div>
                <div id={'输入手机号码行'} className={classNames.inputLine}>
                    <Input
                        ref={function (input) {
                            if (input != null) {
                                input.focus();
                            }
                        }}
                        size={"large"}
                           placeholder={'请输入手机号码...'} value={mobile}
                           onChange={(e) => {
                               if (!e.target.value)
                               {
                                   //删除的时候
                                   setMobile('');
                                   setCanSubmit(false);
                                   return;
                               }
                               let checkedMobile = utils.checkMobile(e.target.value);
                               if (checkedMobile) {
                                   setMobile(checkedMobile);
                                   if (checkedMobile.length===11)
                                   {
                                       setCanSubmit(true);
                                   }
                                   else
                                   {
                                       setCanSubmit(false);
                                   }
                               }
                           }
                           }/>
                </div>
                <Button size={'large'} type={'primary'} disabled={!canSubmit} onClick={()=>{
                    onSubmit(mobile);
                }}>确定</Button>
            </div>

            {/*</div>*/}
        </div>
    );
}

export default SenderMobileInputForm;
