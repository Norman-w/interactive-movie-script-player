export default class ScriptProcessor {
    constructor(movies,anchors) {
        this.movies = movies;
        this.anchors = anchors;
    }
    movies={};
    anchors={};
    //根据当前的电影id和当前播放的时间,获取要触发的触发器是哪一个.如果获取到了触发器看触发器的类型,如果是问题,展示问题的过度视频,等待交互结果 如果交互完成了 使用交互完成的相关信息判断是继续还是跳到哪里
    getAnchors(movieId,startTime,currentTime)
    {
      // console.log('getAnchors:', movieId, startTime,currentTime);
        //根据movie的id,和从什么时间开始播放的,当前播放到了什么时间点,获取当前触发了的脚本
        let currentMovie = null;
        if(!this.movies[movieId])
        {
          console.log('getAnchors没有找到这个movieid', movieId)
            return null;
        }
        else
        {
          currentMovie = this.movies[movieId];
        }
        let currentAnchor = null;
        if (currentMovie)
        {
          // console.log('getAnchors中的节点集合:', this.anchors);
            let aks = Object.keys(this.anchors)
            for (let i = 0; i < aks.length; i++) {
                let anchor = this.anchors[aks[i]];
                if (anchor.movieId===currentMovie.id)
                {
                  if(anchor.start>=startTime && startTime<=anchor.end && anchor.end<=currentTime)
                  // if(anchor.end<currentTime)
                    {
                      console.log('得到anchor的时间:', startTime, anchor.start, anchor.end, currentTime);
                        currentAnchor = anchor;
                        break;
                    }
                }
            }
        }
        //如果获取到了触发点 返回这个触发点信息
        return currentAnchor;
    }
}
