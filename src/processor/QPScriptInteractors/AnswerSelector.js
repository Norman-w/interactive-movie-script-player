import React, {Component} from 'react';
import classNames from './AnswerSelector.module.css';
import DefaultAnswerOptions from "../../component/DefaultAnswerOptions";

// import 'antd/dist/antd.css'

class AnswerSelector extends Component {
  state={
    answers:[],
    hoverAnswerIndex:-1,
  }
  componentDidMount() {
    this.setState({answers:this.props.answerOptions})
  }

  showAnswers(answersList)
  {
    this.setState({answers:answersList});
  }


  render() {
    if (!this.state.answers)
    {
      return null;
    }
    //region 根据元素的个数计算宽度,使用元素个数开平方的方式.比如9个,是三行三列,10个,就是根号10的Math.Floor +1 为每行数量
    let nodeCount = this.state.answers.length;
    let colCount = nodeCount;
    let rowCount = 1;
    if(colCount>3) {
      colCount = Math.sqrt(nodeCount);
      if (Math.floor(colCount)<colCount)
      {
        colCount = Math.floor(colCount) + 1;
      }
      // console.log('列数量是:', colCount);
      rowCount = nodeCount/ colCount;
      if (Math.floor(rowCount)<rowCount)
      {
        //除完了不是整数,要多出来了一点.那就是多出来一行
        rowCount = Math.floor(rowCount) +1;
      }
    }
    //endregion
    return (
      <div className={classNames.main}>
        {this.state.answers.map((item,index)=>
        {
          let aClass = classNames.node;
          if (this.state.hoverAnswerIndex === index)
          {
            aClass = classNames.nodeHover;
          }
          //region 可选择的元素,如果指定了dom的话,就显示dom,如果没有指定,就用默认的来展示
          let answerOptionDom = null;
          if (item.content)
          {
            answerOptionDom=item.content;
          }
          else
          {
            answerOptionDom = <DefaultAnswerOptions title={item.title} desc={item.desc}></DefaultAnswerOptions>
          }
          //endregion
          //region 根据元素的个数计算宽度,一共留下10%的空隙,然后让flex自动去分. 但是这些元素的大小要始终均分90%;
          let widthPercent = 90/colCount;
          let heightPercent = 90/rowCount;
          //endregion
          return   <div className={aClass}
                        key={item.id}
                        style={
                          {
                            width:''+widthPercent+'%',
                            height:'' + heightPercent + '%',
                        }}
                        onMouseEnter={()=>{this.setState({hoverAnswerIndex:index})}}
                        onMouseLeave={()=>{this.setState({hoverAnswerIndex:-1})}}
                        onClick={()=>{
                          if (this.props.onSelectAnswer)
                          {
                            this.props.onSelectAnswer(item);
                          }
                        }}
          >
            {answerOptionDom}
          </div>
        })}
      </div>
    );
  }
}

export default AnswerSelector;
