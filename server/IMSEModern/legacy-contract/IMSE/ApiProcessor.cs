using DomainBase;
using IMSE.IMMERequestAndResponse;
using Norman.FastJSON;
using System;
using System.Collections.Generic;
using System.Text;
using System.Web;

namespace IMSE
{
    public class ApiProcessor
    {
        public SaveSettingResponse DoSaveSettingRequest(SaveSettingRequest req, string session, string physicalPath)
        {
            SaveSettingResponse rsp = req.AllocResponse();
            if (string.IsNullOrEmpty(req.SettingJson))
            {
                rsp.ErrMsg = "传入的settingjson 为空";
                return rsp;
            }
            if (string.IsNullOrEmpty(req.SettingName))
            {
                rsp.ErrMsg = "设置名称为空";
                return rsp;
            }

            try
            {
                //string realJson = HttpUtility.UrlDecode(req.SettingJson);
                //Dictionary<string, object> kvs = JSON.ToObject<Dictionary<string, object>>(realJson);
                //if (kvs!= null && kvs.Count >0)
                //{

                //}
            }
            catch (Exception parseJsonErr)
            {
                rsp.ErrMsg = string.Format("解析json失败:{0}", parseJsonErr.Message);
                return rsp;
            }
            string settingNamePath = string.Format("{0}\\Settings\\{1}.json", physicalPath, req.SettingName);
            string settingPath = System.IO.Path.GetDirectoryName(settingNamePath);
            try
            {
                if (System.IO.Directory.Exists(settingPath) == false)
                {
                    System.IO.Directory.CreateDirectory(settingPath);
                }
                if (System.IO.File.Exists(settingNamePath) == false)
                {
                    System.IO.File.Create(settingNamePath).Close();
                }
                System.IO.File.WriteAllText(settingNamePath, req.SettingJson);
                rsp.Success = true;
            }
            catch (Exception saveSettingFileErr)
            {

                rsp.ErrMsg = string.Format("保存文件失败{0}", saveSettingFileErr.Message);
                return rsp;
            }

            return rsp;
        }
        public LoadSettingResponse DoLoadSettingRequest(LoadSettingRequest req, string session, string physicalpath)
        {
            LoadSettingResponse rsp = req.AllocResponse();
            if (string.IsNullOrEmpty(req.SettingName))
            {
                rsp.ErrMsg = "设置名称为空";
                return rsp;
            }
            string settingNamePath = string.Format("{0}\\Settings\\{1}.json", physicalpath, req.SettingName);
            string settingPath = System.IO.Path.GetDirectoryName(settingNamePath);
            try
            {
                if (System.IO.File.Exists(settingNamePath) == true)
                {
                    string content = System.IO.File.ReadAllText(settingNamePath);
                    rsp.SettingJson = content;
                }
            }
            catch (Exception saveSettingFileErr)
            {

                rsp.ErrMsg = string.Format("读取文件失败{0}", saveSettingFileErr.Message);
                return rsp;
            }
            return rsp;
        }
    }
}
