// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    //获取code，以提交服务端解密获取openid
    // GetCode();
  },
  globalData: {
    userInfo: null
  }
})

export function ClearCode() {
  wx.removeStorage({
    key: 'code',
  });
  wx.removeStorage({
    key: 'code_expire',
  });
}

export function GetCode(callback) {
  let code_expire = wx.getStorageSync("code_expire");
  let code = wx.getStorageSync("code");
  //code有效期为null或者有效期已过期时，重新获取code
  if (code_expire == null || code_expire.length==0 || code_expire <= new Date()) {
    wx.login({
      success: res => {
        let codeExpire = new Date();
        codeExpire.setMinutes(codeExpire.getMinutes() + 4);
        wx.setStorageSync("code", res.code);
        wx.setStorageSync("code_expire", codeExpire);
        console.log("loginResult:",res);
        if(callback!=null)
          callback(res.code);
      }
    });
  }else{
    if(callback!=null)
      callback(code);
  }
};
export const AuthServerAddress = 'https://www.sl56.com';
export const ServerAddress ='https://api.sl56.com/api';
export function NetRequest({
  url,
  data,
  success,
  fail,
  complete,
  method = "POST"
}) {
  var header= {
      'content-type': 'application/json',
      'Cookie':'ASP.NET_SessionId=' + wx.getStorageSync('session_id') + ';sl56Auth='+wx.getStorageSync('auth') +';OpenId='+wx.getStorageSync('OpenId')
    }
    console.log('header:',header);
  wx.request({
    url: url,
    method: method,
    data: data,
    header: header,
    success: res => {
      var data = res.data
      res['statusCode'] === 200 ? success(data) : fail(res)
    },
    fail: res => {},
    complete: complete
  })
}