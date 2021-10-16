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
    function getTimeByAngle(byPointer,mouseMoveAngle)
    {
      let currentHour = save.hour;
      let currentMinute = save.minute;
      let draggingPointer = byPointer;
      let oldTime = save.lastUpdateTime;
      if (draggingPointer === 'hour') {
        currentHour = Math.floor(mouseMoveAngle / 30);
        currentMinute = Math.round((mouseMoveAngle % 30) * 2);
      } else if (draggingPointer === 'minute') {
        currentMinute = Math.round(mouseMoveAngle / 6);
      }
      //region 59.5-60秒 都会四舍五入到60,这时应该让60做为0展示
      if (currentMinute === 60) {
        currentMinute = 0;
        // let round = Math.round(mouseMoveAngle/30);
        // currentHour = round + currentHour;
        // console.log('正好60分的时候  hour是:', currentHour, 'round:',round);
      }
      //endregion
      //region 如果是往新的小时方向移动的话 增减小时
      if (save.lastUpdateTime.minute>45&&save.lastUpdateTime.minute<60 && currentMinute>=0&& currentMinute<15)
      {
        //向右侧移动;
        console.log('需要增加时间,当前早时间:', save.hour);
        let newHour = (save.hour + 1)% 12;
        if (newHour<0)
        {
          newHour = 12+newHour;
        }
        currentHour = newHour;
        save.hour = newHour;
        console.log('需要增加时间,当前', newHour)
      }
      else if(save.lastUpdateTime.minute>=0 && save.lastUpdateTime.minute <15 && currentMinute>45 && currentMinute<60)
      {
        //向右侧移动;
        let newHour = (save.hour -1 )% 12;
        if (newHour<0)
        {
          newHour = 12+newHour;
        }
        currentHour = newHour;
        save.hour = newHour;
      }
      //endregion
      let currentRound = save.round;
      if(oldTime.hour<12 && oldTime.hour>=9 && (currentHour >=0 || currentHour === 12) && currentHour <=3)
      {
        //增加时间
        currentRound = Math.abs(currentRound+1)%2;
      }
      else if((oldTime.hour>=0 || oldTime ===12) && oldTime<=3 && currentHour<12 && currentHour>=9)
      {
        currentRound = Math.abs(currentRound-1)%2;
        console.log('要减少时间了.');
      }
      let newTime =  {hour:currentHour,minute:currentMinute,round:currentRound};
      // console.log('新的时间是:',newTime);
      return newTime;
    }
//region 点下鼠标的时候记录点的角度
const handleMouseDown = (e)=>
{
  console.log('按下',save.draggingPointer)
  if (!save.draggingPointer)
  {
    return;
  }
  // let downAngle = getAngleByClientPoint(e.clientX,e.clientY);
  //   setMouseDownAngle(downAngle);
  save.moving=false;
}
//endregion
//region 鼠标移动的时候记录角度
const handleMouseMove =(e)=>
{
  if(!save.center || save.center.length !==2)
  {
    return false;
  }
  // console.log('移动:',save.draggingPointer);
  if (save.draggingPointer==='hour' || save.draggingPointer === 'minute')
  {
    save.moving=true;

    var x = e.clientX - save.center[0];
    var y = e.clientY - save.center[1];
    var currentAngle = _constValue.R2D * Math.atan2(x, -y);
    let currentAngle360 = currentAngle;
    if (currentAngle<0)
    {
      currentAngle360=180-(0-currentAngle) + 180;
    }
    // console.log('角度:', currentAngle);
    let needUpdate = setMouseMoveAngle(currentAngle360);
    return needUpdate;
  }
  return false;
}
//endregion
const setMouseMoveAngle = function (e)
{
  if (save.moving) {
    let time = getTimeByAngle(save.draggingPointer,e);
    if (save.lastUpdateTime.minute!== time.currentMinute)
    {
      save.hour = time.hour;
      save.minute = time.minute;
      save.round = time.round;
      // console.log('setMouseMoveAngle 需要更新时间呢:', time)
      return true;
    }
    else
    {
      return false;
    }
  }
  else {
    save.mouseMoveAngle = e;
    return false;
  }
}

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
  // const [hour,setHour] = useState(3);
  // const [minute,setMinute] = useState(21);
  //   const [draggingPointer, setDraggingPointer] =useState(null);
  // const [mouseDownAngle, setMouseDownAngle]=useState(0);
  // const [mouseMoveAngle, setMouseMoveAngle]=useState(0);

  let propTime = props.time ? props.time : {hour: 0, minute: 0, round: 0};
  const [time, setTime] = useState(propTime);
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
  console.log('中心您是:', center);


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


  return (
    <div className={classes.container}
         onMouseDown={(event) => {
           handleMouseDown(event)
         }}
         onMouseMove={event => {
           let needUpd = handleMouseMove(event);
           if (needUpd) {
             // console.log('需要更新时间,接收到的时间是:', save.hour,save.minute)
             let newHour = save.hour;
             let newMinute = save.minute;
             let newRound = save.round;
             save.lastUpdateTime.hour = newHour * 1;
             save.lastUpdateTime.minute = newMinute * 1;
             save.lastUpdateTime.round = newRound * 1;
             // setHour(newHour);
             // setMinute(newMinute);
             setTime({hour: newHour, minute: newMinute, round: newRound});
           }
         }}
         onMouseUp={event => {
           if (save.draggingPointer) {
             save.hour = currentHour;
             save.minute = currentMinute;
             save.moving = false;
             // setHour(currentHour);
             // setMinute(currentMinute)

             // setMouseDownAngle(0);
             // setIsDragging(false);
             setDraggingPointer(null);
             setMouseMoveAngle(0);
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
        <div className={classes.hour}>{('' + time.hour).padStart(2, '0')}</div>
        <div className={classes.maoHao}>
          <div className={classes.maoHao1}></div>
          <div className={classes.maoHao2}></div>
        </div>
        <div className={classes.minute}>{('' + time.minute).padStart(2, '0')}</div>
        <div className={classes.rounds}>
          <div className={time.round === 0 ? classes.roundSelected : classes.round}>上午</div>
          <div className={time.round === 1 ? classes.roundSelected : classes.round}>下午</div>
        </div>
      </div>
    </div>
  );
}

export default TimeSelector;
