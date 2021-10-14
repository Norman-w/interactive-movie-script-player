import React, {useRef, useState} from 'react';
import {findDOMNode} from 'react-dom';


import classes from './TimeSelector.module.css'
var _constValue=
    {
        R2D : 180 / Math.PI,
    }
function TimeSelector(props) {
  const [hour,setHour] = useState(3);
  const [minute,setMinute] = useState(21);
  // const [isDragging, setIsDragging] =useState(false);
    const [draggingPointer, setDraggingPointer] =useState(null);
  const [mouseDownAngle, setMouseDownAngle]=useState(0);
  const [mouseMoveAngle, setMouseMoveAngle]=useState(0);
  const [mouseCurrentPos, setMouseCurrentPos] = useState([]);
  const [center, setCenter] = useState(null);
  const centerDom = useRef(null);
  let centerSize = 20;
  let clockSize = 200;
  let centerLocation = [750,360];
  //region 获取表的中心
    if (!center)
    {
        var c = document.getElementById('centerDom')
        // console.log(c)
        var centerPoint = findDOMNode(c);
        if(centerPoint)
        {
            // console.log(centerPoint);
            let bound = centerPoint.getBoundingClientRect();
            setCenter( [bound.left+bound.width/2, bound.top + bound.height/2])
        }
    }

    //endregion
  // console.log('当前角度:', angle);
  //region 表盘
  let clockStyle={
    width: clockSize +2,
    height: clockSize +2,
    borderRadius: (clockSize +2)/2,
  }
  //endregion
  //region 中心圆点的style
  let centerRedStyle = {
    width:centerSize,
    height:centerSize,
    top:(clockSize-centerSize)/2,
    left:(clockSize-centerSize)/2,
    borderRadius:centerSize/2,
  };
  //endregion

  //region 一刻钟的元素dom
  let quartersDom = [];
  let quarterMarkWidth=6;
  let quarterMarkHeight = 15;
  let quarterMarkOffsetX = (clockSize-quarterMarkWidth)/2;
  let quarterMarkOffsetY = (clockSize-quarterMarkHeight)/2;
  for (let i = 0; i <4; i++) {
    //region 一刻钟的显示
    let quarterStyle =
      {
        width: quarterMarkWidth,
        height: quarterMarkHeight,
        backgroundColor: 'salmon',
        position: 'absolute',
        left: quarterMarkOffsetX,
        top: quarterMarkOffsetY,
        transform: 'rotateZ('+ i*90 + 'deg) translateY(-'+(quarterMarkOffsetY-3)+'px)' ,
      }
    //endregion
        quartersDom.push(
          <div style={quarterStyle}></div>
        )
  }
  //endregion
  //region 五分钟的元素dom
  let fiveMDoms = [];
  let fiveMarkWidth=4;
  let fiveMarkHeight = 8;
  let fiveMarkOffsetX = (clockSize-fiveMarkWidth)/2;
  let fiveMarkOffsetY = (clockSize-fiveMarkHeight)/2;
  for (let i = 0; i <12; i++) {
    if (i%3 ===0)
    {
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
        transform: 'rotateZ('+ i*30 + 'deg) translateY(-'+(fiveMarkOffsetY-3)+'px)' ,
      }
    //endregion
    fiveMDoms.push(
      <div style={fiveStyle}></div>
    )
  }
  //endregion
  //region 一分钟的元素dom
  let oneMDoms = [];
  let oneMarkWidth=2;
  let oneMarkHeight = 4;
  let oneMarkOffsetX = (clockSize-oneMarkWidth)/2;
  let oneMarkOffsetY = (clockSize-oneMarkHeight)/2;
  for (let i = 0; i <60; i++) {
    if (i%5 ===0)
    {
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
        transform: 'rotateZ('+ i*6 + 'deg) translateY(-'+(oneMarkOffsetY-3)+'px)' ,
      }
    //endregion
    oneMDoms.push(
      <div style={oneStyle}></div>
    )
  }
  //endregion
  //region 时针的dom
  let hourPointerWidth = 8;
  let hourPointerLong = clockSize/2/2;
  let hourPointerOffsetX = (clockSize-hourPointerWidth)/2;
  let hourPointerOffsetY = (clockSize-hourPointerLong)/2;
  let angle = 0;
  if (draggingPointer === 'hour')
  {
      angle = mouseMoveAngle;
  }
  else if(draggingPointer === 'minute')
  {
      angle = mouseMoveAngle/12 + (parseInt(''+hour)*30);
  }
  else
  {
      angle = hour*30;
  }
  let hourStyle =
    {
      borderRadius:hourPointerWidth/2,
      position: 'absolute',
      left: hourPointerOffsetX,
      top: hourPointerOffsetY,
      width:hourPointerWidth,
      height:hourPointerLong,
      backgroundColor:'#cfeaa1',
      transform:'rotateZ('+ angle + 'deg) translateY(-'+((hourPointerLong/2)-hourPointerLong*0.1)+'px)' ,
      // transform:'rotateZ('+ (angle) + 'deg) translateY(-'+((hourPointerLong/2)-hourPointerLong*0.1)+'px)' ,
    }
  //endregion
  //region 分针的dom
  let minutePointerWidth = 4;
  let minutePointerLong = clockSize*0.4;
  let minutePointerOffsetX = (clockSize-minutePointerWidth)/2;
  let minutePointerOffsetY = (clockSize-minutePointerLong)/2;
  let minuteAngle = 0;
  if(draggingPointer === 'hour')
  {
      minuteAngle = mouseMoveAngle%30/30*360
  }
  else if(draggingPointer === 'minute')
  {
      minuteAngle = mouseMoveAngle;
  }
  else {
      minuteAngle = minute * 6
  }
  let minuteStyle =
    {
      borderRadius:minutePointerWidth/2,
      position: 'absolute',
      left: minutePointerOffsetX,
      top: minutePointerOffsetY,
      width:minutePointerWidth,
      height:minutePointerLong,
      backgroundColor:'#7bc0db',
      transform:'rotateZ('+ minuteAngle + 'deg) translateY(-'+((minutePointerLong/2)-minutePointerLong*0.1)+'px)' ,
    }
  //endregion
    //region 点下鼠标的时候记录点的角度
    const handleMouseDown = (e)=>
    {
        console.log('按下',draggingPointer)
        if (!draggingPointer)
        {
            return;
        }
        console.log('按下')
        var x = e.clientX - center[0];
        var y = e.clientY - center[1];
        var startAngle = _constValue.R2D * Math.atan2(x, -y);
        if (startAngle<0)
        {
            startAngle=180-(0-startAngle) + 180;
        }
        console.log('按下角度:',startAngle)
        setMouseDownAngle(startAngle);
        // setIsDragging(true);
    }
    //endregion
    //region 鼠标移动的时候记录角度
    const handleMouseMove =(e)=>
    {
        if (draggingPointer==='hour' || draggingPointer === 'minute')
        {
            var x = e.clientX - center[0];
            var y = e.clientY - center[1];
            var currentAngle = _constValue.R2D * Math.atan2(x, -y);
            let currentAngle360 = currentAngle;
            if (currentAngle<0)
            {
                currentAngle360=180-(0-currentAngle) + 180;
            }
            setMouseMoveAngle(currentAngle360);
        }
    }
    //endregion
  return (
    <div className={classes.container}
         // onMouseDown={(event)=>{handleMouseDown(event)}}
         onMouseMove={event=>handleMouseMove(event)}
         onMouseUp={event=>{
             if (draggingPointer === 'hour')
             {
                 console.log('新时间:',mouseMoveAngle/30)
                 setHour(mouseMoveAngle/30);
                 let newMinute = (mouseMoveAngle%30)/30*60;
                 console.log('新分钟',newMinute)
                 setMinute(newMinute);
             }
             else if(draggingPointer === 'minute')
             {
                 let newMinute = (mouseMoveAngle/6);
                 setMinute(newMinute);
                 setHour(parseInt(''+hour)+newMinute/60);
             }

             setMouseDownAngle(0);
             // setIsDragging(false);
             setDraggingPointer(null);
             setMouseMoveAngle(0) ;
         }}
    >
      <div className={classes.main} style={clockStyle}>

        {quartersDom}
        {fiveMDoms}
        {oneMDoms}
        <div className={classes.pointer} style={hourStyle}
             onMouseDown={event => setDraggingPointer('hour')}
             onMouseUp={event=>setDraggingPointer(null)}
        ></div>
        <div className={classes.pointer} style={minuteStyle}
             onMouseDown={event => setDraggingPointer('minute')}
             onMouseUp={event=>setDraggingPointer(null)}
        ></div>
        <div className={classes.centerRed} style={centerRedStyle} ref={centerDom} id={'centerDom'}></div>
        <div> 按下位置:{mouseDownAngle}</div>
          <div>移动中位置:{mouseMoveAngle}</div>
          <div>角度差:{mouseMoveAngle-mouseDownAngle}</div>
          <div>点击的指针:{draggingPointer}</div>
      </div>
    </div>
  );
}

export default TimeSelector;
