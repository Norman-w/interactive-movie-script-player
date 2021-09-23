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
  state={
    snippet:{},
    startTime:null,
    endTime:null,
    movieUrl:null,
    movieId:null,
  }
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    if (this.props.snippet)
    {
      let pSnippet = this.props.snippet;
      this.setState({snippet:this.props.snippet,
        startTime:pSnippet.startTime,
        endTime:pSnippet.endTime,
        movieUrl:pSnippet.movieUrl,
        movieId:pSnippet.movieId,
        posterUrl:pSnippet.posterUrl,
        autoPlay:true,
      })
    }
    else
    {
      this.setState(
          {
            startTime:this.props.startTime,
            endTime:this.props.endTime,
            movieUrl:this.props.movieUrl,
            movieId:this.props.movieId,
            posterUrl:this.props.posterUrl,
            autoPlay:this.props.autoPlay,
          }
      )
    }
  }


  onPlayerTimeUpdate(e)
  {
    let time = e.target.currentTime;
    if (time>=this.state.endTime)
    {
      this.player.pause();
    }
  }
  onPlayerLoadedMetadata(e)
  {
    // console.log('视频加载完成:',e);
    this.player.seek(this.state.startTime);
  }
  onClick(e)
  {
    // console.log('跳转到开头处并开始播放');
    this.player.seek(this.state.startTime);
    this.player.play();
  }
  onPause(e)
  {
    let time = e.target.currentTime;
    if (time>=this.state.endTime)
    {
      if (this.props.onSnippetFinished)
      {
        this.props.onSnippetFinished(this.state.snippet);
      }
    }
  }
  //region 提供给外部调用的 切换视频
  changeSnippet(snippet,autoPlay)
  {
    let pSnippet = snippet;
    this.setState({
          snippet: pSnippet,
          startTime: pSnippet.startTime,
          endTime: pSnippet.endTime,
          movieUrl: pSnippet.movieUrl,
          movieId: pSnippet.movieId,
          posterUrl: pSnippet.posterUrl,
          autoPlay: autoPlay
        },()=>
        {
          // console.log('MovieSnippetPlayer现在播放新的片段:', snippet)
          this.player.load();
        }
    )
  }
  //endregion
  //region 重播
  rePlay()
  {
    this.player.seek(this.state.startTime);
    this.player.play();
  }
  //endregion
  render() {
    let onPlayerTimeUpdate = this.onPlayerTimeUpdate.bind(this);
    let snippet = this.state.snippet;
    return (
      <div
        className={classNames.main}>
        <Player
          ref={c => {
            this.player = c;
          }}
          poster={this.state.posterUrl}
          autoPlay={this.state.autoPlay}
          src={this.state.movieUrl}
          onPause={this.onPause.bind(this)}
          // onPlay={this.onPlayerPlay.bind(this)}
          onTimeUpdate={(e) => {
            onPlayerTimeUpdate(e)
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