
App({
  data: {
    url: 'https://test-auth.aobei.com',
    dev:'https://test-api.aobei.com/graphql',
    // dev: 'https://test-api.aobei.com/graphql',
    code: '',
    appid: 'wx731d62ae850c6c5e',
    token: '',
    userId: '',
    systemInfo:'',
    isReload:false
  },
  
  onLaunch: function () {
    var _this=this;
    wx.getSystemInfo({
      success:res=>{
        this.data.systemInfo=JSON.stringify(res)
      }
    })
    // 展示本地存储能力
    // var logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // this.globalData.code=res.code
        // this.getJsApi(res.code)
        this.getToken(res.code)
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null
  },
  getJsApi(code){
    wx.request({
      url: 'http://10.10.30.72:9020/callback/wxpay?js_code='+code,
      method:"GET",
      data:{},
      header:{
        "content-type": 'application/x-www-form-urlencoded'
      },
      success:res=>{
        console.log(res,'========')   
      }
    })
  },
  
  getToken(code) {
    wx.request({
      url: this.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'password',
        username: 'WXM_' + this.data.appid + ':'+code,
        password: code,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
        "Duuid": this.data.systemInfo
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token
        this.globalData.userId = res.data.uuid
      }
    })
  }
})