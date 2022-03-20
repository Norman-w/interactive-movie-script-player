import React, {useState} from 'react';
import styled, {keyframes} from 'styled-components';
import {Button, Checkbox} from "antd";
import utils from "../../utils/utils";

const slowInFrame = keyframes`
from {
    transform: scale(0.1);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 100%;
  }
`
const UseQPPaperRuleMainDom = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  //border: 1px solid red;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: ${slowInFrame} 0.6s;
`
const Top = styled.div`
  width: 100%;
  height: 30%;
`
const Bottom = styled.div`
width: 80%;
height: 70%;
background-color: white;
display: flex;
flex-direction: column;
justify-content: space-around;
align-items: center;
//opacity: 0.6;
margin-bottom: 30px;
border-radius: 30px;
box-shadow: 0 0 8px 3px lightgrey;
`

const QuickPreparePaperDom = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
width: 80%;
`
const QuickDistinationPaperDom = styled.div`
display: flex;
flex-direction: row;
justify-content: space-between;
align-items: center;
flex-wrap: wrap;
width: 80%;
`



const MinCount = styled.input`
border: 1px dashed greenyellow;
width: 80px;
text-align: center;
`

const Title = styled.div`
font-size: 20px;
text-shadow: 1px 1px 3px skyblue;
`

const Line=styled.div`
margin-top: 3px;
display: flex;flex-direction: row;
justify-content: flex-start;
align-items: center;
flex-wrap: wrap;
`

const checkBoxStyle =
  {
    userSelect:'none',
    cursor:'pointer',
    fontSize:18,
  }

const UseQpPaperRule = (props) => {
  const [QPPaperMinItemCount,setQPPaperMinItemCount] = useState(1);
  const [QPPaperMinItemKind, setQPPaperMinItemKind] = useState(1);
  const [QPDPaperMinItemCount,setQPDPaperMinItemCount] =useState(1);
  const [QPDPaperMinItemKind, setQPDPaperMinItemKind] = useState(1);
  const [QPDPaperMinBagCount, setQPDPaperMinBagCount] = useState(1);
  const [useQPDPaper, setUseQPDPaper] = useState(false);
  return (
    <UseQPPaperRuleMainDom>
      <Top/>
      <Bottom>
        <Title>当多个包裹进行批量处理时:</Title>
        <QuickPreparePaperDom>
          商品至少
          <MinCount value={QPPaperMinItemCount} onChange={e => {
            setQPPaperMinItemCount(utils.limitNumber(e.target.value,0,1000))
}}/>
          种,且至少
          <MinCount value={QPPaperMinItemKind} onChange={e=>{setQPPaperMinItemKind(utils.limitNumber(e.target.value,0,1000))}}/>
          件时打印备货单
        </QuickPreparePaperDom>

        <QuickDistinationPaperDom>
          <Checkbox style={checkBoxStyle}
                    onChange={e=>{setUseQPDPaper(e.target.checked)}}
          >使用分派单</Checkbox>
          <Line hidden={!useQPDPaper}>商品至少
            <MinCount value={QPDPaperMinItemKind} onChange={e=>{setQPDPaperMinItemKind(utils.limitNumber(e.target.value,0,1000))}}/>
            种,且至少
            <MinCount value={QPDPaperMinItemCount} onChange={e => {
  setQPDPaperMinItemCount(utils.limitNumber(e.target.value, 0, 1000))
}}/>
            件,且该批次中至少
            <MinCount value={QPDPaperMinBagCount} onChange={e=>setQPDPaperMinBagCount(utils.limitNumber(e.target.value, 0, 1000))}/>
            个包裹同时处理时打印分配单</Line>
        </QuickDistinationPaperDom>
        <Button type={'primary'} size={'large'} style={{width:120}}
                onClick={()=>{
                  let ret = {
                    "QuickPreprationCheckList":
                      {
                        "Enable":true,
                        "MinKindCount":QPPaperMinItemKind?QPPaperMinItemKind:99999,
                        "MinGoodsCount":QPPaperMinItemCount?QPPaperMinItemCount:99999,
                      },
                    "DistributionCheckList":
                      {
                        "Enable":useQPDPaper,
                        "MinKindCount":QPDPaperMinItemKind?QPDPaperMinItemCount:99999,
                        "MinGoodsCount":QPDPaperMinItemCount?QPDPaperMinItemCount:99999,
                        "MinBagCount":QPDPaperMinBagCount?QPDPaperMinBagCount:99999,
                      },
                  }
                  if (props.onSubmit)
                  {
                    props.onSubmit(ret);
                  }
                }}
        >确认</Button>
      </Bottom>
    </UseQPPaperRuleMainDom>
  );
};

export default UseQpPaperRule;
