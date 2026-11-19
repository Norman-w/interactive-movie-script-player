using DomainBase;
using Newtonsoft.Json;
using Norman.FastJSON;
using ServerBase;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Reflection;
using System.Text;
using System.Web;

public delegate bool OnNeedCheckIISSessionMethod(string session);
    public static class HttpContextProcessor
    {
        #region 处理网页请求

        /*
         * 执行网络请求时,
         *
         * 设置返回值类型
         * 解析请求字典
         *      获取post字典
         *      获取get字典
         *      获取fetch时的stream中的字典
         *      获取请求时携带的文件
         * 在SDK中获取该api名称(method)的request
         *
         */

        public static void Process(HttpContext context,object apiProcessor)
        {
            HttpRequest Request = context.Request;
            HttpResponse Response = context.Response;
            //设置/通知客户端 返回值类型为  json;
            Response.AddHeader("Content-Type", "application/json");
            #region ...
            //给过来的参数字典.
            System.Collections.Generic.Dictionary<string, string> dic = new System.Collections.Generic.Dictionary<string, string>();
            StringBuilder sb = new StringBuilder();
            //用户通过参数方式传递过来的session
            string userGivenSession = null;
            #region 读取body中的内容
             if (Request.HttpMethod.Equals("POST") && Request.InputStream.CanRead)
             {
                 StreamReader sm = new StreamReader(Request.InputStream);
                 string requestBody = sm.ReadToEnd();
                 sm.Close();
                 sm.Dispose();
                 if (requestBody != null)
                 {
                     try
                     {
                         Dictionary<string, object> bodyParamDic = JSON.ToObject<Dictionary<string, object>>(requestBody);
                         if (bodyParamDic!= null)
                         {
                             foreach (var item in bodyParamDic)
                             {
                                 if (item.Key.ToLower() == "session")
                                 {
                                     userGivenSession = string.Format("{0}", item.Value);
                                     continue;
                                 }
                                 if (dic.ContainsKey(item.Key) == false)
                                 {
                                     dic.Add(item.Key, string.Format("{0}", item.Value));
                                 }
                             }
                         }
                     }
                     catch (Exception parseBodyJsonErr)
                     {
                        Console.WriteLine("HttpContextProcessor.cs Process解析请求体到json失败");
                        Console.WriteLine(parseBodyJsonErr.Message);
                     }
                 }
             }

            #endregion
             #region 使用fetch的时候 Form中并没有内容 不知道为啥
             for (int i = 0; i < Request.Form.Count; i++)
             {
                 string key = Request.Form.AllKeys[i];
                 string val = Request.Form[i];

                 dic.Add(key, val);

                 if (key.ToLower() == "session")
                 {
                     userGivenSession = val;
                     continue;
                 }

                 sb.AppendFormat("{0}={1}\r\n", key, val);
                 val = HttpUtility.UrlEncode(val, Request.ContentEncoding);
             }
             #endregion
             #region 处理get请求


             if (Request.HttpMethod.Equals("GET"))
            {
                for (int i = 0; i < Request.QueryString.Count; i++)
                {
                    string key = Request.QueryString.AllKeys[i];
                    string val = Request.QueryString[key];
                    if (key == null)
                    {
                        continue;
                    }

                    dic.Add(key, val);

                    if (key.ToLower() == "session")
                    {
                        userGivenSession = val;
                        continue;
                    }

                    sb.AppendFormat("{0}={1}\r\n", key, val);
                    val = HttpUtility.UrlEncode(val, Request.ContentEncoding);
                }
            }
             #endregion


             #region 获取保存在iis内存中的session/token
             //从iis获取到的session;
             string iisSession = string.Format("{0}", context.Session["sessionKey"]);
             #endregion

             string json = JSON.ToJSON(dic);
            string apiname = null;
            if (dic.ContainsKey("method"))
            {
                apiname = dic["method"];
            }
            if (string.IsNullOrEmpty(apiname))
            {
                ReturnErrResponseString(context.Response, "missing api name", 400);
                return;
            }
            #region 请求中的文件获取
            List<FileItem> files = new List<FileItem>();
            if (Request.Files != null && Request.Files.Count > 0)
            {
                //Request.Files[0].SaveAs(Request.PhysicalApplicationPath + Request.Files[0].FileName);
                if (Request.Files != null && Request.Files.Count > 0)
                {
                    for (int i = 0; i < Request.Files.Count; i++)
                    {
                        FileItem current = new FileItem(Request.Files[i].FileName, Request.Files[i].InputStream);
                        files.Add(current);
                    }
                }
            }

            #endregion

            //2018年4月1日22:03:44开始已经不使用分别的处理器了,所有的过渡router里面都使用统一的RequestProcessor,然后在RequestProcessor的实例里面来解析具体是哪个处理器来处理请求
            //QPRequestProcessor processor = new QPRequestProcessor("", "", "", "qperp", 3306);
            string responseStr = null;

            #region 使用 norman 的 fastjson 序列化json时的参数
            JSONParameters jpr = new JSONParameters();
            jpr.UseUTCDateTime = false;
            //如果是关闭null的值的话 每一个null的值都会被序列化然后传递
            jpr.SerializeNullValues = false;
            jpr.UseExtensions = false;
            jpr.EnableAnonymousTypes = false;
            jpr.SerializerMaxDepth = 40;
            #endregion
            #region 使用Newtonsoft 的Json序列化时候的json参数
            Newtonsoft.Json.JsonSerializerSettings jss = new JsonSerializerSettings();
            jss.TypeNameHandling = TypeNameHandling.None;
            jss.DateTimeZoneHandling = DateTimeZoneHandling.Unspecified;
            jss.TypeNameAssemblyFormat = System.Runtime.Serialization.Formatters.FormatterAssemblyStyle.Simple;
            jss.DefaultValueHandling = DefaultValueHandling.Ignore;
            jss.DateFormatString = "yyyy-MM-dd HH:mm:ss";
            #endregion
            #region 尝试获取实际要使用的request类型,生成request,执行请求,序列化请求
            List<int> debugPos = new List<int>();
            try
            {
                debugPos.Add(1);
                Dictionary<string, Type> reqTypes = GetRequestNameAndTypeDic(apiProcessor);
                debugPos.Add(2);
                if (reqTypes.ContainsKey(apiname))
                {
                    debugPos.Add(3);
                    //根据api名称获取到的 request的类型
                    Type requestType = reqTypes[apiname];
                    //把json 序列化成 request
                    //object objFromJsonReq = JSON.ToObject(json, requestType, jpr);
                    object objFromJsonReq = Newtonsoft.Json.JsonConvert.DeserializeObject(json, requestType, jss);
                    debugPos.Add(4);
                    #region 调用request中的GetIsSessionRequired方法 来检查这个请求需要不需要session
                    MethodInfo getIsSessionRequiredMethod = requestType.GetMethod("GetIsSessionRequired");
                    if (getIsSessionRequiredMethod!= null)
                    {
                        bool needSession = (bool)getIsSessionRequiredMethod.Invoke(objFromJsonReq, null);
                        if (needSession)
                        {
                            bool noUserGivenSession = string.IsNullOrEmpty(userGivenSession);
                            bool noIISSession = string.IsNullOrEmpty(iisSession);
                            //api需要session或者token, 就是iis方式的session或者用户传递过来的session  一个都没有给 不行
                            if (noUserGivenSession && noIISSession)
                            {
                                ReturnErrResponseString(context.Response, "need session or token", 403);
                                return;
                            }
                            else if(noIISSession)
                            {
                                //如果没有iissession的话 不用校验 服务器会自动校验 如果给过来一个请求的话 请求里面会自带session
                            }
                            else if(noUserGivenSession)
                            {
                                //也不需要操作,执行processor中的函数时候会自动校验
                            }
                        }
                        else
                        {
                            //不需要校验session,所以有没有session都没有关系
                        }
                    }
                    else
                    {
                        ReturnErrResponseString(context.Response,"该SDK或Request类未实现一个检查API是否需要Session/Token的方法", 500);
                        return;
                    }
                    #endregion
                    debugPos.Add(5);
                    //使用父类来接收response,实际上的返回值应该是比父类更完善的子类对象.
                    NetResponse rsp = (NetResponse)Execute(objFromJsonReq, apiProcessor,
                        string.IsNullOrEmpty(userGivenSession)?iisSession: userGivenSession,
                         files,
                        System.IO.Path.GetDirectoryName(
                        context.Request.PhysicalPath),

                        ///当request中返回了新的session的时候,把连接的session设置为新的session值,以让浏览器下次继续使用.
                        (newSession) =>
                        {
                            context.Session["sessionKey"] = newSession;
                        },

                        (givenSession) =>
                        {
                            //在这里校验iis中的session是否有效
                            if (context.Session["sessionKey"] != null && context.Session["sessionKey"].Equals(givenSession) == true)
                            {
                                return true;
                            }
                            return false;
                        }

                        );
                    debugPos.Add(6);
                    #region 如果需要下载文件,把文件返回到response中
                    if (rsp.DownloadFileName != null && rsp.DownloadFileStream != null)
                    {
                        Response.Clear();
                        Response.ClearHeaders();

                        //byte [] buffer = rsp.DownloadFileStream.GetBuffer();
                        // Legacy test-file output was intentionally removed from the migrated reference copy.
                        //fs.Write(buffer, 0,buffer.Length);
                        //fs.Close();
                        //rsp.DownloadFileStream.Close();
                        //return;
                        Response.ContentType = "application/octet-stream";
                        Response.ContentEncoding = System.Text.Encoding.UTF8;
                        Response.Charset = "UTF-8";
                        Response.AddHeader("Content-disposition", string.Format("attachment; filename={0}", HttpUtility.UrlEncode(rsp.DownloadFileName, System.Text.Encoding.UTF8)));
                        //Response.BinaryWrite(buffer);
                        Response.BinaryWrite(rsp.DownloadFileStream.ToArray());
                        Response.Flush();
                        Response.Close();
                        //rsp.DownloadFileStream.WriteTo(Response.OutputStream);
                        //Response.End();
                        HttpContext.Current.ApplicationInstance.CompleteRequest();
                        rsp.DownloadFileStream.Close();
                        return;
                    }
                    #endregion
                    debugPos.Add(7);
                    //把返回的response序列化成json,序列化时,会根据rsp的真实类型来序列化,不会漏掉字段.
                    string rspjson2 = Newtonsoft.Json.JsonConvert.SerializeObject(rsp, jss);
                    //responseStr =  JSON.ToJSON(rsp, jpr);
                    responseStr = rspjson2;
                }
                else
                {
                    debugPos.Add(8);
                    string rspjson2 = Newtonsoft.Json.JsonConvert.SerializeObject(new ErrorResponse() {  ErrMsg = "无效的api名称" }, jss);
                    //responseStr =  JSON.ToJSON(rsp, jpr);
                    responseStr = rspjson2;
                }
            }

            #endregion
            #region 在以上请求发生错误时

            catch (Exception executeErr)
            {
                jpr.UseEscapedUnicode = false;
                ErrorResponse errRsp = new ErrorResponse();
                errRsp.ErrCode = "500";
                //string fileName = Request.Path
                //Dictionary<string, string> errInfos = new Dictionary<string, string>();
                //errInfos.Add("文件", Request.Path);
                //errInfos.Add("客户端", Request.UserHostAddress);
                //errInfos.Add("URL", Request.Url);

                errRsp.ErrMsg = string.Format("文件:\r\n{0}\r\n\r\nURL:\r\n{1}\r\n\r\n客户端:\r\n{2}\r\n\r\nErrMsg:\r\n{3}\r\n\r\n\r\nInfo:\r\n{4}",
                    Request.Path,
                    Request.Url,
                    Request.UserHostAddress,
                    executeErr.Message,
                    ///*executeErr.StackTrace*/""
                    //JsonConvert.SerializeObject(debugPos, Formatting.Indented)
                    json
                    );
                if (executeErr.InnerException != null)
                {
                    errRsp.SubErrMsg = string.Format("InnerError:{0}\r\nStackTrace:{1}\r\n", executeErr.InnerException.Message, /*executeErr.StackTrace*/"");
                }

                responseStr = JSON.ToNiceJSON(errRsp, jpr);
                //throw;
            }
            #endregion

            //还原request 成功
            //DataGetRequest req = JSON.ToObject<DataGetRequest>(json);
            Response.Write(responseStr);
            #endregion
        }

        #endregion

        #region 返回一个错误请求的方法
        /// <summary>
        /// 创建一个可以返回错误的Response的字符串
        /// </summary>
        /// <param name="errMsg"></param>
        /// <param name="errCode"></param>
        /// <param name="subErrMsg"></param>
        /// <param name="subErrCode"></param>
        /// <returns></returns>
        static void ReturnErrResponseString(HttpResponse response, string errMsg, int errCode, string subErrMsg = null, Nullable<int> subErrCode = null)
        {
            JSONParameters jpr = new JSONParameters();
            jpr.UseUTCDateTime = false;
            jpr.SerializeNullValues = false;
            jpr.UseExtensions = false;
            jpr.EnableAnonymousTypes = false;
            jpr.SerializerMaxDepth = 40;

            string rspJson = JSON.ToNiceJSON(CraeteErrResponse(errMsg, errCode, subErrMsg, subErrCode), jpr);
            response.Write(rspJson);
            return;
        }
        /// <summary>
        /// 创建一个可以返回错误的response
        /// </summary>
        /// <param name="errMsg"></param>
        /// <param name="errCode"></param>
        /// <param name="subErrMsg"></param>
        /// <param name="subErrCode"></param>
        /// <returns></returns>
        static NetResponse CraeteErrResponse(string errMsg, int errCode, string subErrMsg = null, Nullable<int> subErrCode = null)
        {
            NetResponse rsp = new ErrorResponse()
            {
                ErrCode = errCode.ToString(),
                ErrMsg = errMsg,
                SubErrCode = subErrCode == null ? null : subErrCode.Value.ToString(),
                SubErrMsg = subErrMsg
            };
            return rsp;
        }
        #endregion
        #region 使用内存缓存的方式,把该sdk下的所有的request类型和api名称对应的关系保存起来方便在后续的调用中加速

        /// <summary>
        /// 缓存在iis内存中的类型字典,key是api名称,value是对应的request的类型.
        /// </summary>
        static Dictionary<string, Type> requestNameAndTypeDic = null;
        /// <summary>
        /// 根据给定的apiprocessor,判断所在的dll,在那个dll(Assembly) 下面获取request集合.因为考虑速度,所以不通过某个Type获取ass的方式再传入这个参数
        /// 直接给定apiprocessor,不需要获取他的type.如果在dic为空的时候才获取ass
        /// </summary>
        /// <param name="apiProcessor"></param>
        /// <returns></returns>
        static Dictionary<string, Type> GetRequestNameAndTypeDic(object apiProcessor)
        {
            #region 如果没有对目标sdk进行类型的缓存,也就是该iis启动以来第一次访问,那么构建这个dic
            if (requestNameAndTypeDic == null || requestNameAndTypeDic.Count == 0)
            {
                requestNameAndTypeDic = new Dictionary<string, Type>();
                Assembly currentAss = Assembly.GetAssembly(apiProcessor.GetType());
                Type[] currentAssTypes = currentAss.GetTypes();

                if (currentAssTypes != null)
                {
                    for (int i = 0; i < currentAssTypes.Length; i++)
                    {
                        Type type = currentAssTypes[i];

                        MethodInfo getApiNameMethod = type.GetMethod("GetApiName", BindingFlags.Instance | BindingFlags.Public);
                        if (getApiNameMethod == null)
                        {
                            continue;
                        }
                        object request = Activator.CreateInstance(type);
                        object ret = getApiNameMethod.Invoke(request, new object[] { });
                        if (ret != null)
                        {
                            string apiNameRet = string.Format("{0}", ret);
                            if (requestNameAndTypeDic.ContainsKey(apiNameRet) == false)
                            {
                                requestNameAndTypeDic.Add(apiNameRet, type);
                            }
                        }
                    }
                }

            }
            #endregion
            //否则直接返回这个字典
            return requestNameAndTypeDic;
        }
        #endregion
        #region 执行请求,自动通过请求实体和请求处理器(sdk) 查找DoxxxxxxxRequest的方法进行执行.
        /// <summary>
        /// 执行请求
        /// </summary>
        /// <param name="request">请求主体,应当传入的已经是正确的请求格式</param>
        /// <param name="executor">请求主体的处理器,也就是能处理Request的相关的类</param>
        /// <param name="session">如果需要请求session,把session传递给函数</param>
        /// <param name="files">如果是需要上传文件的方法,把文件的列表传入</param>
        /// <param name="physicalPath">如果需要上传文件的方法,把文件保存的具体物理路径</param>
        /// <param name="onNewSession">如果一个方法里面会更新用户的session,执行这个方法</param>
        /// <returns></returns>
        static object Execute(object request, object executor, string session, List<FileItem> files, string physicalPath, Action<string> onNewSession, OnNeedCheckIISSessionMethod onNeedCheckIISSession)
        {
            Type requestType = request.GetType();
            object ret = null;
            try
            {
                #region 通过类型来反射要执行的函数并反射执行
                Type baseType = executor.GetType();
                //request的处理方法,以Do开头引导,非公共类型,实例
                MethodInfo requestMethod = baseType.GetMethod(string.Format("Do{0}", requestType.Name), BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Public);
                if (requestMethod == null)
                {
                    ErrorResponse retErr = new ErrorResponse();
                    retErr.ErrMsg = "根据api名称未找到处理方法";
                    ret = retErr;
                    return ret;
                }
                //要用到的参数集合
                List<object> parameters = new List<object>();
                //该request的处理方法中要传入的参数
                ParameterInfo[] parametersInfos = requestMethod.GetParameters();
                #region 遍历每一个要传入的参数,request的让request填充,session的让session填充,timeStamp的让timestamp填充
                if (parametersInfos != null && parametersInfos.Length > 0)
                {
                    for (int i = 0; i < parametersInfos.Length; i++)
                    {
                        object currentParam = null;
                        ParameterInfo currentParameterInfo = parametersInfos[i];
                        if (currentParameterInfo.ParameterType == requestType)
                        {
                            currentParam = request;
                        }
                        else if(currentParameterInfo.Name.ToLower().Equals("onneedcheckiissession"))
                        {
                            currentParam = onNeedCheckIISSession;
                        }
                        else if(currentParameterInfo.Name.ToLower().Equals("onnewsession"))
                        {
                            currentParam = onNewSession;
                        }
                        else if (currentParameterInfo.Name.ToLower().Equals("session"))
                        {
                            currentParam = session;
                        }
                        else if (currentParameterInfo.Name.ToLower().Equals("timestamp"))
                        {
                            currentParam = DateTime.Now;
                        }
                        else if (currentParameterInfo.Name.ToLower().Equals("physicalpath"))
                        {
                            currentParam = physicalPath;
                        }
                        parameters.Add(currentParam);
                    }
                }
                #endregion
                //执行请求

                ret = requestMethod.Invoke(executor, parameters.ToArray());
                #endregion
            }
            catch (Exception executeErr)
            {
                throw executeErr;
            }

            return ret;
        }

        #endregion
        #region 如果api需要mysql相关连接的话 使用mysql客户端 使用时候 直接 MysqlClient client = GetSqlClient(); 然后直接使用client.xxx就可以了
        static MysqlClient client = null;
        static MysqlClient GetSqlClient()
        {
            if (client != null)
            {
                return client;
            }
            string ip = ConfigurationManager.AppSettings["ip"];
            string user = ConfigurationManager.AppSettings["user"];
            string pass = ConfigurationManager.AppSettings["pass"];
            string database = ConfigurationManager.AppSettings["database"];
            string port_str = ConfigurationManager.AppSettings["port"];
            int port = 3306;
            if (string.IsNullOrEmpty(port_str) == false)
            {
                int.TryParse(port_str, out port);
            }
            MysqlClient sqlClient = new MysqlClient(ip, user, pass, database, port);
            client = sqlClient;
            return client;
        }
        #endregion
    }
    public class ErrorResponse : NetResponse
    {
    }
