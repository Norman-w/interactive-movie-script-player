export default class MovieScriptFactory {
  //region 创建视频结构体信息
  CreateMovie(param= {id:'',name:'',desc:'',duration:10.5,usedFor:'',url:'',extType:''})
  {
    return param;
  }
  //endregion
  //region 为视频创建锚点信息
  CreateAnchorInformation4Video(param=
                                  {
                                    movie: {}, name: '',
                                    desc: '',
                                    reWriteSubTitle: '',
                                    reWriteVoice: '',
                                    start: 0.00,
                                    end: 0.00,
                                    duration: 0.00,
                                    id: ''
                                  }) {
      if (!param.id)
      {
          param.id= new Date().getDate();
      }
    return param;
  }
  //endregion
}
