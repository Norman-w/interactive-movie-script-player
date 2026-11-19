using System;
using System.Collections.Generic;
using System.Text;
using DomainBase;

namespace IMSE.IMMERequestAndResponse
{
    /// <summary>
    /// 保存设置的请求
    /// </summary>
    public class LoadSettingRequest: BaseRequest<LoadSettingResponse>
    {
        public string SettingName { get; set; }

        public override string GetApiName()
        {
            return "setting.load";
        }
        public override IDictionary<string, string> GetParameters()
        {
            QPNetDictionary param = new QPNetDictionary();
            param.Add("settingname", SettingName);
            return param;
        }
        public override void Validate()
        {
            if (string.IsNullOrEmpty(SettingName))
            {
                throw new ArgumentNullException("参数SettingName无效");
            }
        }
    }
}
