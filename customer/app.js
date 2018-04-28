App({
  data: {
    url: 'https://test-auth.aobei.com',
    dev:'https://test-api.aobei.com/graphql',
    // dev: 'https://test-api.aobei.com/graphql',
    code: '',
    appid: 'wx653dc689ca79ac81',
    token: '',
    dataUserInfo:"",
    userId: '',
    openId:'',
    systemInfo:'',
    isAgree:false,
    isReload:false
  },
  onLaunch: function () {
    var _this=this;
    wx.getSystemInfo({
      success:res=>{
        this.data.systemInfo=JSON.stringify(res)
      }
    })

    this.data.isAgree= wx.getStorage({
      key: 'isAgree',
      success: res=> {
        this.data.isAgree=res
      }
    })
    
    // 登录
    wx.login({
      success: res => {
        // this.getToken(res.code)
          this.getOpenId(res.code)
          this.globalData.code = res.code
      }
    })
  },
  getOpenId(vcode){
    // wx.login({
    //   success: res => {
       
        wx.request({
          url: this.data.url + '/wxapi/jscode2session',
          // url: 'http://10.10.30.70:9010/wxapi/jscode2session',
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
              key: this.data.openId + '====wxm',
              success: data => {
                this.data.isAgree = data.data;
                if (this.data.isAgree) {
                  this.getToken()
                } else {
                  this.getSetting();
                }
              },
              fail: result => {
                this.getSetting();
              }
            })
          }
        })
    //   }
    // })
    
  },
  getSetting(){
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo'] == undefined) {
          // 还未授权过
          this.getUserINfoFn();
          return false;
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
                    return false;
                  }
                })
              } else {
                this.getToken();
                return false;
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
        this.globalData.userInfo = res.userInfo
        this.data.isAgree=true
      
        wx.setStorage({
          key: this.data.openId+'====wxm',
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
      // url:'http://10.10.30.70:9010/oauth/token',
      
      method: "POST",
      data: {
        grant_type: 'wxm_code',
        appid: this.data.appid,
        code: this.globalData.code,
        userinfo: this.data.dataUserInfo,
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