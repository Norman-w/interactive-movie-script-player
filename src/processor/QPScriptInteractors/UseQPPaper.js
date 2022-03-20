import React from 'react';
import styled from 'styled-components'
import AnswerSelector from "./AnswerSelector";
const UseQPPaperMainDom = styled.div`
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
`
const Top = styled.div`
  width: 100%;
  height: 30%;
`
const Bottom = styled.div`
width: 100%;
height: 70%;
//background-color: white;
display: flex;
flex-direction: row;
justify-content: center;
align-items: center;
//opacity: 0.6;
`

function UseQPPaper(props) {
  return (
    <UseQPPaperMainDom>
      <Top></Top>
      <Bottom>
        <AnswerSelector answerOptions={props.answerOptions} onSelectAnswer={props.onSelectAnswer}></AnswerSelector>
      </Bottom>
    </UseQPPaperMainDom>
  );
}

export default UseQPPaper;
