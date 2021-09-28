export default class MovieScriptFactory {
  //region 创建视频结构体信息
  CreateMovie(
      id,name,desc,duration,usedFor,url,poster,extType
      // param= {id:'',name:'',desc:'',duration:10.5,usedFor:'',url:'',extType:''}
  )
  {
      let param = {
          id:id,
          name:name,
          desc:desc,
          usedFor:usedFor,
          movieUrl:url,
        posterUrl:poster,
          extType:extType
      };
      if(!id)
      {
          id=new Date().getDate();
      }
    return param;
  }
  //endregion
  //region 为视频创建锚点信息
  CreateAnchorInformation4Video(
                                    movie, name,
                                    desc,
                                    reWriteSubTitle,
                                    reWriteVoice,
                                    start,
                                    end,
                                    id) {
      let param = {movie:movie,name:name,desc:desc,reWriteSubTitle:reWriteSubTitle,reWriteVoice:reWriteVoice,start:start,end:end,id:id};
      if (!id)
      {
          param.id= new Date().getDate();
      }
    return param;
  }
  //endregion
}
