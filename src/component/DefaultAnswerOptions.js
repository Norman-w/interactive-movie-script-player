import React, {Component} from 'react';
import classNames from './DefaultAnswerOptions.module.css'

class DefaultAnswerOptions extends Component {
  render() {
    return (
      <div className={classNames.main}>
        <div className={classNames.title}>{this.props.title}</div>
        <div className={classNames.desc}>{this.props.desc}</div>
      </div>
    );
  }
}

export default DefaultAnswerOptions;
