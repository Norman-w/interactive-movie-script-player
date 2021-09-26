import React from 'react';
import classNames from './ItemInfoPrintingDestSelectForm.module.css'
import AnswerSelector from "../AnswerSelector";

function ItemInfoPrintingDestSelectForm(props) {
    let {answerOptions,onSelectAnswer} = props;
    return (
        <div className={classNames.main}>
            <div className={classNames.content}>
                <div className={classNames.title}>您希望把商品信息打印在哪里?</div>
                <AnswerSelector answerOptions={answerOptions} onSelectAnswer={onSelectAnswer}/>
            </div>
        </div>
    );
}

export default ItemInfoPrintingDestSelectForm;