using System;
using System.Collections.Generic;
using System.Text;
using DomainBase;

namespace IMSE.IMMERequestAndResponse
{
    /// <summary>
    /// 保存设置的请求
    /// </summary>
    public class SaveSettingRequest: BaseRequest<SaveSettingResponse>
    {
        public string SettingJson { get; set; }
        public string SettingName { get; set; }

        public override string GetApiName()
        {
            return "setting.save";
        }
        public override IDictionary<string, string> GetParameters()
        {
            QPNetDictionary param = new QPNetDictionary();
            param.Add("settingjson", SettingJson);
            param.Add("settingname", SettingName);
            return param;
        }
        public override void Validate()
        {
            if (string.IsNullOrEmpty(SettingJson))
            {
                throw new ArgumentNullException("参数SettingJson无效");
            }
            if (string.IsNullOrEmpty(SettingName))
            {
                throw new ArgumentNullException("参数SettingName无效");
            }
        }
    }
}
