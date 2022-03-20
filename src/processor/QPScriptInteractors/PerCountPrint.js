import React, {useState} from 'react';
import styled, {keyframes} from "styled-components";
import {Radio, Input, Space, Button} from 'antd';


const PerCountPrintSettingMainDom = styled.div`
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
function PerCountPrint(props) {
  const [value,setValue] = useState(1);
  const [count, setCountString] = useState(10);
  const onChange=(e)=>
  {


    setValue(e.target.value);
    let selectCount = 0;
    switch (e.target.value)
    {
      case 1:
        selectCount = 10;
        break;
      case 2:
        selectCount = 100;
        break;
      case 3:
        selectCount = 1000;
        break;
      case 4:
        break;
    }
    setCountString(selectCount);
    console.log(e.target.value);
  }
  // methods 正则替换小数点
  const limitNumber = (value) =>{
    if (typeof value === 'string') {
      console.log('是字符串')
      return !isNaN(Number(value)) ? value.replace(/\b(0+)/g, '') : null
    } else if (typeof value === 'number') {
      console.log('是数字')
      return !isNaN(value) ? String(value).replace(/\b(0+)/g, '') : null
    } else {
      return null
    }
  }
  return <PerCountPrintSettingMainDom>
    <Left></Left>
    <Right>
      <Radio.Group onChange={onChange} value={value}
                   style={radioGroupStyle}
      >
          <Radio value={1} style={optionStyle}>够10个包裹自动打印</Radio>
          <Radio value={2} style={optionStyle}>够100个包裹自动打印</Radio>
          <Radio value={3} style={optionStyle}>够1000个包裹自动打印</Radio>
          <Radio value={4} style={optionStyle} disabled={false}>
            自定义数量
            {value === 4 ? <Input style={{ width: 100, marginLeft: 10 }} value={count}
                                  onChange={(e)=>{

                                    let val = limitNumber(e.target.value);
                                    let valParsed = parseInt(val);
                                    if (!isNaN(valParsed))
                                    {
                                      val = valParsed>100000?100000:valParsed;
                                    }
                                    // val =parseInt(val);
                                    setCountString(val);
                                  }}
            /> : null}
            个
          </Radio>
        <Button type={'primary'} style={{marginTop:10}} onClick={e=>{
          if (props&& props.onSubmit)
          {
            props.onSubmit(count);
          }
        }}
                disabled={!count}
        >{count?('确认,够'+count+'个包裹即打印'):'输入数量以确认'}</Button>
        <Button type={'ghost'} style={{marginTop:20}} onClick={e=>{
          if (props&& props.onSubmit)
          {
            props.onSubmit(-1);
          }
        }}>取消,只有到时间时才打印</Button>
      </Radio.Group>
    </Right>
  </PerCountPrintSettingMainDom>

}

export default PerCountPrint;
