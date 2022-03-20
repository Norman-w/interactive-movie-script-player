class Utils {
    isDebugMode=false
    checkMobile = (mobile) => {
        let a = mobile;
        let isNum = /^\d+$/.test(a);

        if (isNum) {
            let firstNum = a[0];
            let firstCheck = parseInt(firstNum) === 1;
            let secondCheck = true;
            let lengthCheck = a.length <= 11;
            if (a.length > 1) {
                let secondNum = a[1];
                let secondNumInt = parseInt(secondNum)
                if (secondNumInt < 3) {
                    secondCheck = false;
                } else if (secondNumInt === 4) {
                    secondCheck = false;
                }
            }
            if (firstCheck && secondCheck && lengthCheck) {
                return a;
                // setMobile(e.target.value)
            }
        } else {

        }
    }
   jsonField2Array = function(jsonObj)
  {
    let ret = [];
    let keys = Object.keys(jsonObj);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let field = jsonObj[key];
      ret.push(field);
    }
    return ret;
  }
    doPost2 = function ({api, params, success, errProcFunc, failProcFunc, session}) {
        // let url = 'https://www.enni.group/interactivemoviescripteditor/';
        let url='https://www.enni.group/netserver/router.aspx'
        if (params)
        {
            params['method'] = api;

        }

        fetch(url,{method:'POST',mode:'cors',headers:{'Content-Type': 'application/json'}, body:params},).then(
            response => {
                console.log('fetch的response是:',response);
                let json = response.json();
                console.log('fetch的response.json()是', json);
                return json;
            }
        ).then(
            // data=>console.log('fetch后的结果是:',data)
            (data) => {
                if (data) {
                    if (this.debugMode)
                        console.log('获取到data:', data);
                    if (data.IsError === true)// || !data.ErrMsg || !data.ErrCode)
                    {
                        if (errProcFunc) {
                            errProcFunc(data)
                        } else {
                            console.warn(JSON.stringify(data));
                            if (this.debugMode)
                                console.log('%c在home.js中未获取到错误处理函数,由控制台输出,request发生错误:' + data.ErrMsg, 'color:red;font-size:12px');
                        }
                    } else {
                        if (success) {
                            success(data);
                        }
                    }
                } else {
                    if (failProcFunc) {
                        failProcFunc();
                    }
                }
            }
        ).catch((e)=>
        {
            console.error('app.js,fetch获取到json,进行回调函数的调用时发生错误e:',e,
                '请求名称:',api,
                '参数集:',params,
                '执行成功回调函数:', success,
                '服务器返回错误消息回调函数:',errProcFunc,
                '发生网络等错误回调函数:',failProcFunc,
                '授权码:',session,
                'url:', url
            );
        });
    }
     doPost = async function ({api, params, success, errProcFunc, failProcFunc, session,routerUrl}) {
        let url = 'https://www.enni.group/interactivemoviescripteditor/';
        if (routerUrl)
        {
          url = routerUrl;
        }
        if (params)
        {
            params['method'] = api;
          if (session)
          {
            params['session'] = session;
          }
        }
        let ft = fetch(url,{method:'POST',headers:{'Content-Type': 'application/json'}, body:JSON.stringify(params)})
            let ft2= (await ft);
        let data = (await ft2.json())
         console.log('doPost结束后 data是:',data);
         if (data.IsError === true)// || !data.ErrMsg || !data.ErrCode)
         {
             if (errProcFunc) {
                 errProcFunc(data)
             } else {
                 console.warn(JSON.stringify(data));
                 if (this.debugMode)
                     console.log('%c在home.js中未获取到错误处理函数,由控制台输出,request发生错误:' + data.ErrMsg, 'color:red;font-size:12px');
             }
         } else {
             if (success) {
                 success(data);
             }
         }
    }
    //region 让input的输入数字只能是大于0以上的数字. 如果是空字符串 就返回null.
  limitNumber = (value, min,max) =>{
      let ret = null;
    if (typeof value === 'string') {
      // console.log('是字符串')
      ret = !isNaN(Number(value)) ? value.replace(/\b(0+)/g, '') : null;
    } else if (typeof value === 'number') {
      // console.log('是数字')
      ret= !isNaN(value) ? String(value).replace(/\b(0+)/g, '') : null
    } else {
      ret= null
    }
    let num = parseInt(ret);
    if (!isNaN(num))
    {
      num = num>=min? num:min;
      num = num<=max? num:max;
      return num;
    }
    return ret;
  }
  //endregion
//region 把json的字段转换成array 就是把   {}转换成 []
  jsonField2Array(jsonObj)
  {
    let ret = [];
    let keys = Object.keys(jsonObj);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let field = jsonObj[key];
      ret.push(field);
    }
    return ret;
  }
  //endregion
}
const utils=new Utils();
export default utils;
