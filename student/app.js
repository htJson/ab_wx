App({
  data:{
    url:'https://test-auth.aobei.com',
    // dev:'http://10.10.30.18:9004/graphql',
    dev:'https://test-api.aobei.com/graphql',
    code:'',
    name:'',
    dataUserInfo:'',
    phone:'',
    appid:'wxe15a4d44733c1121',
    token:'',
    openId:'',
    updateTokenData:'',
    userId:'',
  },
  onLaunch: function (options) {
    var _this = this;
    wx.getSystemInfo({
      success: res => {
        this.data.systemInfo = JSON.stringify(res)
      }
    })
    this.data.scene = decodeURIComponent(options.scene)
    // 登录
    wx.login({
      success: res => {
        this.getOpenid(res.code)
        this.data.code = res.code
      }
    })
    setInterval(()=>{
      this.upadteToken()
    },7100000)
  },
  upadteToken(){
    wx.request({
      // url:'http://10.10.30.70:9010/oauth/token', //仅为示例，并非真实的接口地址
      url: this.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'refresh_token',
        refresh_token: this.data.updateTokenData
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
        "Duuid": this.data.systemInfo
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token,
        this.globalData.userId = res.data.uuid
      }
    })
  },

  req(data,fn,headerData){
    // Object.assig
    wx.request({
      url: this.data.dev,
      method: "POST",
      header: {
        "content-type": "application/json",
        "Authorization": this.globalData.token,
        "channel": this.data.scene
      },
      data: data,
      success: res => {
        return typeof fn == "function" && fn(res)
      },
      fail: res => {
        return typeof fn == "function" && fn(res)
      }
    })
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
  getUserINfoFn() {
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        this.data.dataUserInfo = JSON.stringify(res);
        this.globalData.userInfo = res.userInfo
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
      fail: res => {
        // console.log('falie')
        this.getToken();
      }
    })
  },

  globalData: {
    userInfo: null
  },
 
  getToken() {
    wx.request({
      // url:'http://10.10.30.70:9010/oauth/token', //仅为示例，并非真实的接口地址
      url: this.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'wxm_code',
        appid: this.data.appid,
        code: this.data.code,
        userinfo: this.data.dataUserInfo,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
        "Duuid": this.data.systemInfo
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token,
        this.data.updateTokenData = res.data.refresh_token,
        this.globalData.userId = res.data.uuid
        this.getInfo();
      }
    })
  },
  getInfo(){
    // 根据是否绑定判断进入哪个界面
    wx.request({
      url: this.data.dev,
      method:'POST',
      data:{
        query:'query{my_student_bindinfo{phone,name}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": this.globalData.token
      },
      success:res=>{
        if(res.data.errors !=undefined){
          wx.redirectTo({
            url: '/pages/login/login',
          })
        }
      }
    })
  }
})