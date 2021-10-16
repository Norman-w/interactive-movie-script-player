import React, {useEffect, useRef, useState} from 'react';
import {findDOMNode} from 'react-dom';


import classes from './TimeSelector.module.css'
var _constValue=
    {
        R2D : 180 / Math.PI,
    };
    const save={
      hour:0,
      minute:0,
      moving:false,
      lastUpdateTime:{hour:0,minute:0,round:0},
      draggingPointer:'',
      mouseMoveAngle:0,
      center:null,
      round:0,//圈数   圈数0 是从0点起的第一圈,圈数 1 是下午的那一圈. 下午那一圈的0点是12点.
    };

//region 鼠标移动的时候记录角度
const handleMouseMove =(e)=>
{
  if(!save.center || save.center.length !==2)
  {
    return false;
  }
  if (save.draggingPointer==='hour' || save.draggingPointer === 'minute')
  {
    save.moving=true;

    //region 计算鼠标角度
    var x = e.clientX - save.center[0];
    var y = e.clientY - save.center[1];
    var currentAngle = _constValue.R2D * Math.atan2(x, -y);
    let currentAngle360 = currentAngle;
    if (currentAngle<0)
    {
      currentAngle360=180-(0-currentAngle) + 180;
    }
    //endregion
      //region 根据指针名称和角度 计算时间
      let oldTime = save.lastUpdateTime;
      if (save.draggingPointer === 'hour') {
          save.hour = Math.floor(currentAngle360 / 30);
          save.minute = Math.round((currentAngle360 % 30) * 2);
      } else if (save.draggingPointer === 'minute') {
          save.minute = Math.round(currentAngle360 / 6);
      }
      //region 59.5-60秒 都会四舍五入到60,这时应该让60做为0展示
      if (save.minute === 60) {
          save.minute = 0;
          if(save.draggingPointer === 'hour')
          {
              save.hour = (save.hour+1)%12;
          }
      }
      //endregion
      //region 如果是分针往新的小时方向移动的话 增减小时
      if (save.draggingPointer === 'minute') {
          if (save.lastUpdateTime.minute > 45 && save.lastUpdateTime.minute < 60 && save.minute >= 0 && save.minute < 15) {
              //向右侧移动;
              // console.log('需要增加时间,当前早时间:', save.hour);
              let newHour = (save.hour + 1) % 12;
              if (newHour < 0) {
                  newHour = 12 + newHour;
              }
              save.hour = newHour;
              // console.log('需要增加时间,当前', newHour)
          } else if (save.lastUpdateTime.minute >= 0 && save.lastUpdateTime.minute < 15 && save.minute > 45 && save.minute < 60) {
              //向右侧移动;
              let newHour = (save.hour - 1) % 12;
              if (newHour < 0) {
                  newHour = 12 + newHour;
              }
              save.hour = newHour;
          }
      }
      //endregion
      if(oldTime.hour!==save.hour && oldTime.hour<12 && oldTime.hour>=9 && save.hour >=0 && save.hour <=3)
      {
          //增加时间
          save.round = Math.abs(save.round+1)%2;
          // console.log('需要更新上下午.',save.round);
      }
      else if(oldTime.hour!==save.hour &&  oldTime.hour>=0 && oldTime.hour<=3 && save.hour<12 && save.hour>=9)
      {
          save.round = Math.abs(save.round-1)%2;
          // console.log('需要更新上下午.',save.round);
      }
      let newTime =  {hour:save.hour,minute:save.minute,round:save.round};
      if (newTime.minute === oldTime.minute)
      {
          return null;
      }
      // console.log('新时间:',newTime,'老时间',oldTime)
      //endregion
      return newTime
  }
  return false;
}
//endregion

const setDraggingPointer = function (e)
{
  save.draggingPointer = e;
}
const setCenter = function (e)
{
  save.center = e;
}
function TimeSelector(props) {
  let msg = '';
  //region 表的参数
  let centerSize = 20;
  let clockSize = 200;
  //endregion
  //region state 和函数

  let propTime = props.time ? props.time : {hour: 0, minute: 0, round: 0};
  const [time, setTime] = useState(propTime);
  const [round, setRound] = useState(save.round);
  const center = save.center;
  useEffect(() => {
    if (!center) {
      var c = document.getElementById('centerDom')
      console.log('获取中心,获取dom', c);
      if (c) {
        var centerPoint = findDOMNode(c);
        if (centerPoint) {
          console.log('centerPoint', centerPoint);
          let bound = centerPoint.getBoundingClientRect();
          setCenter([bound.left + bound.width / 2, bound.top + bound.height / 2])
        }
      }
    }
  }, [save.center])

  // const [center, setCenter] = useState(null);


  const centerDom = useRef(null);
  //endregion

  //region 获取表的中心
  //endregion
  //region 表盘和中心
  //region 表盘
  let clockStyle = {
    width: clockSize + 2,
    height: clockSize + 2,
    borderRadius: (clockSize + 2) / 2,
  }
  //endregion
  //region 中心圆点的style
  let centerRedStyle = {
    width: centerSize,
    height: centerSize,
    top: (clockSize - centerSize) / 2,
    left: (clockSize - centerSize) / 2,
    borderRadius: centerSize / 2,
  };
  //endregion
  //endregion

  //region 刻度表
  //region 一刻钟的元素dom
  let quartersDom = [];
  let quarterMarkWidth = 6;
  let quarterMarkHeight = 15;
  let quarterMarkOffsetX = (clockSize - quarterMarkWidth) / 2;
  let quarterMarkOffsetY = (clockSize - quarterMarkHeight) / 2;
  for (let i = 0; i < 4; i++) {
    //region 一刻钟的显示
    let quarterStyle =
      {
        width: quarterMarkWidth,
        height: quarterMarkHeight,
        backgroundColor: 'salmon',
        position: 'absolute',
        left: quarterMarkOffsetX,
        top: quarterMarkOffsetY,
        transform: 'rotateZ(' + i * 90 + 'deg) translateY(-' + (quarterMarkOffsetY - 3) + 'px)',
      }
    //endregion
    quartersDom.push(
      <div style={quarterStyle}></div>
    )
  }
  //endregion
  //region 五分钟的元素dom
  let fiveMDoms = [];
  let fiveMarkWidth = 4;
  let fiveMarkHeight = 8;
  let fiveMarkOffsetX = (clockSize - fiveMarkWidth) / 2;
  let fiveMarkOffsetY = (clockSize - fiveMarkHeight) / 2;
  for (let i = 0; i < 12; i++) {
    if (i % 3 === 0) {
      continue;
    }
    //region 五分钟的显示
    let fiveStyle =
      {
        width: fiveMarkWidth,
        height: fiveMarkHeight,
        backgroundColor: 'salmon',
        position: 'absolute',
        left: fiveMarkOffsetX,
        top: fiveMarkOffsetY,
        transform: 'rotateZ(' + i * 30 + 'deg) translateY(-' + (fiveMarkOffsetY - 3) + 'px)',
      }
    //endregion
    fiveMDoms.push(
      <div style={fiveStyle}></div>
    )
  }
  //endregion
  //region 一分钟的元素dom
  let oneMDoms = [];
  let oneMarkWidth = 2;
  let oneMarkHeight = 4;
  let oneMarkOffsetX = (clockSize - oneMarkWidth) / 2;
  let oneMarkOffsetY = (clockSize - oneMarkHeight) / 2;
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) {
      continue;
    }
    //region 一分钟的显示
    let oneStyle =
      {
        width: oneMarkWidth,
        height: oneMarkHeight,
        backgroundColor: 'gray',
        position: 'absolute',
        left: oneMarkOffsetX,
        top: oneMarkOffsetY,
        transform: 'rotateZ(' + i * 6 + 'deg) translateY(-' + (oneMarkOffsetY - 3) + 'px)',
      }
    //endregion
    oneMDoms.push(
      <div style={oneStyle}></div>
    )
  }
  //endregion
  //endregion
  //region 先设置时间  再设置角度
  let currentHour = save.hour;
  let currentMinute = save.minute;
  // console.log('当前时间:',currentHour,currentMinute);

  //endregion
  //region 时针的dom
  let hourPointerWidth = 8;
  let hourPointerLong = clockSize / 2 / 2;
  let hourPointerOffsetX = (clockSize - hourPointerWidth) / 2;
  let hourPointerOffsetY = (clockSize - hourPointerLong) / 2;
  let hourAngle = 0;
  if (save.draggingPointer) {
    hourAngle = currentHour * 30 + currentMinute * 0.5;
  } else {
    hourAngle = time.hour * 30 + time.minute * 0.5;
  }


  let hourStyle =
    {
      borderRadius: hourPointerWidth / 2,
      position: 'absolute',
      left: hourPointerOffsetX,
      top: hourPointerOffsetY,
      width: hourPointerWidth,
      height: hourPointerLong,
      backgroundColor: '#cfeaa1',
      transform: 'rotateZ(' + hourAngle + 'deg) translateY(-' + ((hourPointerLong / 2) - hourPointerLong * 0.1) + 'px)',
      // transform:'rotateZ('+ (angle) + 'deg) translateY(-'+((hourPointerLong/2)-hourPointerLong*0.1)+'px)' ,
    }
  //endregion
  //region 分针的dom
  let minutePointerWidth = 4;
  let minutePointerLong = clockSize * 0.4;
  let minutePointerOffsetX = (clockSize - minutePointerWidth) / 2;
  let minutePointerOffsetY = (clockSize - minutePointerLong) / 2;
  let minuteAngle = 0;
  if (save.draggingPointer) {
    minuteAngle = currentMinute * 6;
  } else {
    minuteAngle = time.minute * 6;
  }
  let minuteStyle =
    {
      borderRadius: minutePointerWidth / 2,
      position: 'absolute',
      left: minutePointerOffsetX,
      top: minutePointerOffsetY,
      width: minutePointerWidth,
      height: minutePointerLong,
      backgroundColor: '#7bc0db',
      transform: 'rotateZ(' + minuteAngle + 'deg) translateY(-' + ((minutePointerLong / 2) - minutePointerLong * 0.1) + 'px)',
    }

  //是不是中午
  let isNoon = time.hour ===0 && round ===1;
  let hourText = ('' + (isNoon ? 12:time.hour)).padStart(2, '0');

  return (
    <div className={classes.container}
         onMouseDown={(event) => {
             if (!save.draggingPointer)
             {
                 return;
             }
             save.moving=false;
         }}
         onMouseMove={event => {
           let newTime = handleMouseMove(event);
           if (newTime) {
             setTime(newTime);
             if (newTime.round!== save.lastUpdateTime.round) {
                 setRound(newTime.round);
             }
             save.lastUpdateTime = newTime;
           }
         }}
         onMouseUp={event => {
           if (save.draggingPointer) {
               save.draggingPointer = null;
               save.moving = false;
           }
         }}
    >
      <div className={classes.main} style={clockStyle}>

        {quartersDom}
        {fiveMDoms}
        {oneMDoms}
        <div className={classes.pointer} style={hourStyle}
             onMouseDown={event => {
               setDraggingPointer('hour');
               // let angle = getAngleByClientPoint(event.clientX, event.clientY);
               // setMouseDownAngle(angle);
               // setMouseMoveAngle(angle);
             }}
          // onMouseUp={event=>setDraggingPointer(null)}
        />
        <div className={classes.pointer} style={minuteStyle}
             onMouseDown={event => {
               setDraggingPointer('minute');
               // let angle = getAngleByClientPoint(event.clientX, event.clientY);
               // setMouseDownAngle(angle);
               // setMouseMoveAngle(angle);
             }}
          // onMouseUp={event=>setDraggingPointer(null)}
        />
        <div className={classes.centerRed} style={centerRedStyle} ref={centerDom} id={'centerDom'}></div>
        <div id={'信息显示器'} style={{position: 'fixed', top: '0', left: '0'}}>
          {/*<div> 按下位置:{mouseDownAngle}</div>*/}
          <div>移动中位置:{save.mouseMoveAngle}</div>
          {/*<div>角度差:{mouseMoveAngle-mouseDownAngle}</div>*/}
          <div>点击的指针:{save.draggingPointer}</div>
          <div>时间: {time.hour}:{time.minute}</div>
          <div>小时指针角度:{hourAngle}</div>
          <div>当前小时:{currentHour}</div>
          <div>当前分钟:{currentMinute}</div>
          <div>{msg}</div>
          <div>{JSON.stringify(save)}</div>
        </div>
      </div>
      <div className={classes.timeTextEditor}>
        <div className={classes.hour}>{hourText}</div>
        <div className={classes.maoHao}>
          <div className={classes.maoHao1}></div>
          <div className={classes.maoHao2}></div>
        </div>
        <div className={classes.minute}>{('' + time.minute).padStart(2, '0')}</div>
        <div className={classes.rounds}>
          <div className={round=== 0 ? classes.roundSelected : classes.round}
               onClick={event => {
                   setRound(0);
               }}
          >上午</div>
          <div className={round === 1 ? classes.roundSelected : classes.round}
               onClick={event => {
                   setRound(1);
               }}
          >下午</div>
        </div>
      </div>
    </div>
  );
}

export default TimeSelector;
