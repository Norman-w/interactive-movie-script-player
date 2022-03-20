import React, {useState} from 'react';
import styled, {keyframes} from "styled-components";
import {Radio, Input, Space, Button} from 'antd';
import utils from "../../utils/utils";


const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Rotate = styled.div`
  display: inline-block;
  animation: ${rotate360} 2s linear infinite;
  padding: 2rem 1rem;
  font-size: 10.2rem;
  //background-color: chartreuse;
  color: rebeccapurple;
`;
const PerSpanPrintSettingMainDom = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  //border: 1px solid red;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`
const Left = styled.div`
  width: 40%;
  height: 100%;
`
const Right = styled.div`
width: 60%;
height: 100%;
//background-color: white;
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
//opacity: 0.6;
`

const optionStyle = {
  width:'100%',
  padding: 10,
  // height:'50px',
  // border:'1px solid green',
  // textAlign:'center',
  // verticalAlign:'center',
  display:'flex',
  flexDirection:'row',
  justifyContent:'center',
  alignItems:'center',
};
const radioGroupStyle =
  {
    width: '60%',
    height: 'auto',
    border: '1px solid lightgray',
    verticalAlign: 'center',
    backgroundColor: 'white',
    // opacity:0.6,
    padding:40,
    borderRadius:30,
    transform:'scale(1.5)',
  }
function PerSpanPrint(props) {
  const [value,setValue] = useState(1);
  const [second, setSecond] = useState(600);
  const onChange=(e)=>
  {
    setValue(e.target.value);
    let selectedSecond = 0;
    switch (e.target.value)
    {
      case 1:
        selectedSecond = 600;
        break;
      case 2:
        selectedSecond = 1800;
        break;
      case 3:
        selectedSecond = 3600;
        break;
      case 4:
        selectedSecond = 7200;
        break;
      case 5:
        selectedSecond = second;
        break;
    }
    setSecond(selectedSecond);
    console.log(e.target.value);
  }
  return <PerSpanPrintSettingMainDom>
    <Left></Left>
    <Right>
      <Radio.Group onChange={onChange} value={value}
                   style={radioGroupStyle}
      >
          <Radio value={1} style={optionStyle}>每隔10分钟</Radio>
          <Radio value={2} style={optionStyle}>每隔30分钟</Radio>
          <Radio value={3} style={optionStyle}>每隔一个小时</Radio>
        <Radio value={4} style={optionStyle}>每隔两个小时</Radio>
          <Radio value={5} style={optionStyle} disabled={false}>
            自定义时间
            {value === 5 ? <Input style={{ width: 100, marginLeft: 10 }} value={second}
                                  onChange={(e)=>{
                                    let val = utils.limitNumber(e.target.value);
                                    let valParsed = parseInt(val);
                                    if (!isNaN(valParsed))
                                    {
                                      val = valParsed>180000?180000:valParsed;
                                    }
                                    // val =parseInt(val);
                                    setSecond(val);
                                  }}
            /> : null}
            秒
          </Radio>
        <Button type={'primary'} onClick={e=>{
          if (props&& props.onSubmit)
          {
            props.onSubmit(second);
          }
        }}
        >确认</Button>
      </Radio.Group>
    </Right>
  </PerSpanPrintSettingMainDom>

}

export default PerSpanPrint;
