import React, {Component} from 'react';
import classNames from './MovieSnippetPlayer.module.css'
//region  video-react的引用
import {
  Player,
  ControlBar,
  BigPlayButton,
} from 'video-react';
import "video-react/dist/video-react.css"; // import css
import './video-react-rewrite.css';
//endregion

class MovieSnippetPlayer extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
  }

  onPlayerTimeUpdate(e)
  {
    let time = e.target.currentTime;
    if (time>=this.props.endTime)
    {
      this.player.pause();
    }
  }
  onPlayerLoadedMetadata(e)
  {
    console.log('视频加载完成:',e);
    this.player.seek(this.props.startTime);
  }
  onClick(e)
  {
    console.log('跳转到开头处并开始播放');
    this.player.seek(this.props.startTime);
    this.player.play();
  }
  render() {
    return (
      <div
        className={classNames.main}>
        <Player
          ref={c => {
            this.player = c;
          }}
          poster={this.props.posterUrl}
          autoPlay={this.props.autoPlay}
          src={this.props.movieUrl}
          // onPause={this.onPlayerPause.bind(this)}
          // onPlay={this.onPlayerPlay.bind(this)}
          onTimeUpdate={(e) => {
            this.onPlayerTimeUpdate(e)
          }}

          onLoadedMetadata={this.onPlayerLoadedMetadata.bind(this)}
        >
          <ControlBar autoHide={false} disableDefaultControls={true} disableCompletely={true}>
          </ControlBar>
          <BigPlayButton position={'hide'}/>
        </Player>
        <div id={'mask遮罩层,让用户点了一下以后重新开始播放而不是触发播放器的点击'}
             className={classNames.mask}
             onClick={this.onClick.bind(this)}
        >
        </div>
      </div>
    );
  }
}

export default MovieSnippetPlayer;
