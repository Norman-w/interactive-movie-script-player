import React, {Component} from 'react';
import classNames from './Splitter.module.css'
class Splitter extends Component {
    render() {
        return (
            <div className={classNames.main}>
                <div className={classNames.slider}>
                    <div className={classNames.fader} style={{left:'100%'}}></div>
                    <div className={classNames.fader} style={{left:'50%'}}></div>
                </div>
            </div>
        );
    }
}

export default Splitter;