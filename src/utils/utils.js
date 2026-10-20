const getImseConfig = () => (typeof window !== 'undefined' && window.__IMSE_CONFIG__) || {};

class Utils {
    isDebugMode=false
    normalizeImseMovieUrl = (value) => {
        if (typeof value === 'string') {
            const config = getImseConfig();
            const prefix = config.legacyMovieUrlPrefix;
            if (prefix && value.startsWith(prefix)) {
                const fileName = value.slice(prefix.length);
                const resourceId = (config.legacyMovieFiles || {})[fileName];
                if (resourceId) {
                    return `${config.movieMediaUrlPrefix || '/media/'}${encodeURIComponent(resourceId)}`;
                }
            }
            return value;
        }
        return value;
    }
    normalizeImseMediaUrls = (value) => {
        if (Array.isArray(value)) {
            return value.map(item => this.normalizeImseMediaUrls(item));
        }
        if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
            return Object.fromEntries(Object.entries(value).map(([key, item]) => [
                key,
                key === 'movieUrl'
                    ? this.normalizeImseMovieUrl(item)
                    : this.normalizeImseMediaUrls(item)
            ]));
        }
        return value;
    }
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
    doPost = async function ({api, params, success, errProcFunc, failProcFunc, routerUrl}) {
        const url = routerUrl || getImseConfig().settingsApiUrl || '/InteractiveMovieScriptEditor/Default.aspx';
        const requestParams = Object.assign({}, params || {}, {method: api});

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestParams)
            });
            const data = await response.json();
            if (data && data.IsError === true) {
                if (errProcFunc) {
                    errProcFunc(data);
                } else {
                    console.warn(JSON.stringify(data));
                    if (this.debugMode) {
                        console.log('%cIMSE 设置请求失败:' + data.ErrMsg, 'color:red;font-size:12px');
                    }
                }
            } else if (success) {
                success(data);
            }
        } catch (error) {
            console.error('IMSE settings request failed:', api, error && error.name ? error.name : 'Error');
            if (failProcFunc) failProcFunc(error);
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
