import React from 'react';
import classes from './AutoPrintRule.module.css'
import TimeSelector from "draggable-time-selector";
import {Button} from "antd";
import 'antd/dist/antd';

//自动打印规则设置的组件
function AutoPrintRule(props) {
  let currentTime = {};
  return (
    <div className={classes.main}>
      <div className={classes.left}></div>
      <div className={classes.right}>
        <TimeSelector time={props.time} onChange={(t)=>{currentTime = t}}/>
        <Button type={'primary'} size={'large'} style={{marginTop:30,width:120}}
                onClick={()=>{props.onSubmit(currentTime)}}
        >确定</Button>
      </div>

    </div>
  );
}

export default AutoPrintRule;
