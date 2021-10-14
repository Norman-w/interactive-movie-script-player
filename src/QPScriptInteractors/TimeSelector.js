import React, {useRef, useState} from 'react';
import classes from './TimeSelector.module.css'
function getAngle(cen, first, second) {
  // cen  : 中心点 [0,0]<br>　　　　 // first : 开始点 [1,3]<br>　　　　 // second : 结束位置 [3,4]
  console.log('获取角度入参:',cen,first,second)
  if (!cen || cen.length!==2 || !first || first.length!==2 || !second || second.length !==2)
  {
    return null;
  }
  var f_c_x = first[0] - cen[0],
    f_c_y = cen[1] - first[1],
    s_c_x = second[0] - cen[0],
    s_c_y = cen[1] - second[1];
  var c = Math.sqrt(f_c_x * f_c_x + f_c_y * f_c_y) * Math.sqrt(s_c_x * s_c_x + s_c_y * s_c_y);
  if (c == 0) return -1;
  var angle = Math.acos((f_c_x * s_c_x + f_c_y * s_c_y) / c);
  // 第一象限
  if (cen[0] - second[0] < 0 && cen[1] - second[1] < 0) {
    return angle
    // 第二象限
  } else if (cen[0] - second[0] < 0 && cen[1] - second[1] > 0) {
    return angle
    // 第三象限
  } else if (cen[0] - second[0] > 0 && cen[1] - second[1] < 0) {
    return 2 * Math.PI - angle
    // 第四象限
  } else if (cen[0] - second[0] > 0 && cen[1] - second[1] > 0) {
    return 2 * Math.PI - angle
  }
}

function TimeSelector(props) {
  const [hour,setHour] = useState(3);
  const [minute,setMinute] = useState(21);
  const [mouseDownPos, setMouseDownPos] = useState([]);
  const [mouseCurrentPos, setMouseCurrentPos] = useState([]);
  const centerDom = useRef(null);
  let centerSize = 20;
  let clockSize = 200;
  let centerLocation = [750,360];
  // if (centerDom)
  // {
  //   console.log(centerDom)
  //   centerLocation=  [centerDom.offsetWidth,centerDom.offsetHeight];
  // }
  let first=mouseDownPos;
  let second = mouseCurrentPos;
  let angle = getAngle(centerLocation,first,second);
  console.log('当前角度:', angle);
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
  let hourStyle =
    {
      borderRadius:hourPointerWidth/2,
      position: 'absolute',
      left: hourPointerOffsetX,
      top: hourPointerOffsetY,
      width:hourPointerWidth,
      height:hourPointerLong,
      backgroundColor:'#cfeaa1',
      transform:'rotateZ('+ (hour*30+minute*0.5) + 'deg) translateY(-'+((hourPointerLong/2)-hourPointerLong*0.1)+'px)' ,
      // transform:'rotateZ('+ (angle) + 'deg) translateY(-'+((hourPointerLong/2)-hourPointerLong*0.1)+'px)' ,
    }
  //endregion
  //region 分针的dom
  let minutePointerWidth = 4;
  let minutePointerLong = clockSize*0.4;
  let minutePointerOffsetX = (clockSize-minutePointerWidth)/2;
  let minutePointerOffsetY = (clockSize-minutePointerLong)/2;
  let minuteStyle =
    {
      borderRadius:minutePointerWidth/2,
      position: 'absolute',
      left: minutePointerOffsetX,
      top: minutePointerOffsetY,
      width:minutePointerWidth,
      height:minutePointerLong,
      backgroundColor:'#7bc0db',
      transform:'rotateZ('+ minute*6 + 'deg) translateY(-'+((minutePointerLong/2)-minutePointerLong*0.1)+'px)' ,
    }
  //endregion
  return (
    <div className={classes.container}
         onMouseDown={event => {setMouseDownPos([event.clientX,event.clientY])
           console.log(event)
         }}
         onMouseUp={event => setMouseDownPos([])}
         onMouseMove={event => setMouseCurrentPos([event.clientX,event.clientY])}
    >
      <div className={classes.main} style={clockStyle}>

        {quartersDom}
        {fiveMDoms}
        {oneMDoms}
        <div className={classes.pointer} style={hourStyle}

        ></div>
        <div className={classes.pointer} style={minuteStyle}></div>
        <div className={classes.centerRed} style={centerRedStyle} ref={centerDom}></div>
        <div>当前角度{angle} 按下位置{mouseDownPos} 移动中位置:{mouseCurrentPos}</div>
      </div>
    </div>
  );
}

export default TimeSelector;
