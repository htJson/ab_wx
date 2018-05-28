var UTIL = require('utils/util.js');
var HTTP = require('utils/http.js');
App({
  data:{
    url:'https://dev-auth.aobei.com',
    dev:'https://dev-api.aobei.com/graphql',
    code:'',
    appid:'wx0f1d0cea94704330',
    token:'',
    openId:'',
    userId:'',
    dataUserInfo:'',
    name:'',
    phone:''
  },
  onLaunch: function () {
    // 获取用户信息
    wx.getSystemInfo({
      success: res => {
        this.data.systemInfo=JSON.stringify(res)
        HTTP.header.platform = res.platform
        HTTP.header.device = res.model
        HTTP.header.version = res.version
      }
    })
    // 登录
    wx.login({
      success: res => {
        this.getOpenid(res.code);
        this.data.code = res.code;
      }
    })
    setInterval(() => {
        this.upadteToken()
    },7100000);
  },
  getOpenid(vcode){
    wx.request({
      url: this.data.url + '/wxapi/jscode2session',
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
      },
      data: {
        appid: this.data.appid,
        js_code: vcode
      },
      success: res => {
        this.data.openId = res.data.openid.toString();
        wx.getStorage({
          key: this.data.openId,
          success: data => {
            this.data.isAgree = data.data;
            if (this.data.isAgree) {
              this.getToken()
            } else {
              this.getStting();
            }
          },
          fail: result => {
            this.getStting();
          }
        })
      }
    })
  },
  getStting(){
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo'] == undefined) {
          // 还未授权过
          this.getUserINfoFn();
        } else if (!res.authSetting['scope.userInfo']) {
          //  授权过，但是被拒绝了
          wx.showModal({
            title: '提示',
            content: '小程序想获得您的用户信息，以后保证用户信息正确',
            success: res => {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting['scope.userInfo']) {
                      this.getUserINfoFn()
                    } else {
                      this.getToken();
                    }
                  }
                })
              } else {
                this.getToken();
              }
            }
          })
        } else {
          this.getUserINfoFn();
        }
      }
    })
  },
  getUserINfoFn(){
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        this.data.dataUserInfo = JSON.stringify(res);
        this.globalData.userInfo = res.userInfo;
        HTTP.header.Duuid = this.data.Duuid = UTIL.getUserUnique(this.globalData.userInfo);
        wx.setStorage({
          key: this.data.openId,
          data: true,
        })
        this.getToken()
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (this.userInfoReadyCallback) {
          this.userInfoReadyCallback(res)
        }
      },
      fail:res=>{
        this.getToken();
      }
    })
  },
  globalData: {
    userInfo: null
  },
  getToken() {
    wx.request({
      url: this.data.url + '/oauth/token',
      method: "POST",
      data: {
        grant_type: 'wxm_code',
        appid: this.data.appid,
        code: this.data.code,
        userinfo: this.data.dataUserInfo,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9wYXJ0bmVyOjR4Z25iNzRlLTZhN20tYnI2di1wdHY5LXF6Y2lvazU2Nmczdw==',
        "Duuid": HTTP.header.Duuid,
        "platform": HTTP.header.platform,
        "device": HTTP.header.device,
        "version": HTTP.header.version
      },
      success: res => {
        HTTP.header.Authorization = this.globalData.token = 'Bearer ' + res.data.access_token
        this.globalData.userId = res.data.uuid
        this.globalData.updateTokenData = res.data.refresh_token
        this.getInfo()
      }
    })
  },
  upadteToken(){
    wx.request({
      url: this.data.url + '/oauth/token',
      method: "POST",
      data: {
        grant_type: 'refresh_token',
        refresh_token: this.globalData.updateTokenData
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9wYXJ0bmVyOjR4Z25iNzRlLTZhN20tYnI2di1wdHY5LXF6Y2lvazU2Nmczdw==',
        "Duuid": HTTP.header.Duuid,
        "platform": HTTP.header.platform,
        "device": HTTP.header.device,
        "version": HTTP.header.version
      },
      success: res => {
        HTTP.header.Authorization = this.globalData.token = 'Bearer ' + res.data.access_token,
        this.globalData.updateTokenData = res.data.refresh_token
        this.globalData.userId = res.data.uuid
        this.getInfo()
      }
    })
  },
  getInfo(){
    // 根据是否绑定判断进入哪个界面
    wx.request({
      url: this.data.dev,
      method:'POST',
      data:{
        query:'query{partner_bindinfo{phone,name}}'
      },
      header: {
        "content-type": 'application/json',
        "Authorization": this.globalData.token,
        "Duuid": HTTP.header.Duuid,
        "platform": HTTP.header.platform,
        "device": HTTP.header.device,
        "version": HTTP.header.version
      },
      success: res => {
        if(res.data.errors){
          wx.redirectTo({
            url: '/pages/login/login',
          })
        }
      }
    })
  },
  http: HTTP.request
})