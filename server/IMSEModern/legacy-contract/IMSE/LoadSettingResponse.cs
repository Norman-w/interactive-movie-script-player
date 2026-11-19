using DomainBase;
using System;
using System.Collections.Generic;
using System.Text;

namespace IMSE.IMMERequestAndResponse
{
    public class LoadSettingResponse : NetResponse
    {
        public string SettingJson { get; set; }
    }
}
