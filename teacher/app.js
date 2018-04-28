App({
  data: {
    url: 'https://dev-auth.aobei.com',
    dev: 'https://dev-api.aobei.com/graphql',
    // dev: 'https://test-api.aobei.com/graphql',
    code: '',
    appid: 'wx18b2a6ed40277856',
    token: '',
    dataUserInfo: "",
    userId: '',
    systemInfo: '',
    isAgree: false,
    isReload: false
  },
  onLaunch: function () {
    var _this = this;
    wx.getSystemInfo({
      success: res => {
        this.data.systemInfo = JSON.stringify(res)
      }
    })

    this.data.isAgree = wx.getStorage({
      key: 'isAgree',
      success: res => {
        this.data.isAgree = res
      }
    })

    // 登录
    wx.login({
      success: res => {
        this.globalData.code = res.code
        // this.getToken(res.code)
        if (this.data.isAgree) {
          this.getToken()
          return false;
        }
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
              this.getToken();
            }
          }
        })
      }
    })
  },
  globalData: {
    userInfo: null
  },
  getUserINfoFn() {
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        this.data.dataUserInfo = JSON.stringify(res);
        this.globalData.userInfo = res.userInfo
        this.data.isAgree = true

        wx.setStorage({
          key: 'isAgree',
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
        this.getToken();
      }
    })
  },
  getToken() {
    wx.request({
      url: this.data.url + '/oauth/token',
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
  },

  getInfo() {
    // 根据是否绑定判断进入哪个界面
    wx.request({
      url: this.data.dev,
      method: 'POST',
      data: {
        query: 'query{my_teacher_bindinfo{phone,identity_card}}'
      },
      
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": this.globalData.token
      },
      success: res => {
        if (res.data.errors != undefined) {
          wx.navigateTo({
            url: '/pages/login/login',
          })
        }
      }
    })
  },

  addSum(num){
      return num>9?num:'0'+num;
  },
  getFirstDay(){
    let [n = new Date(), y = n.getFullYear(),m=n.getMonth()+1]=[]
    return y + '-' + this.addSum(m)+'-01';
  },
  getToday(){
    let t=new Date();
    let y=t.getFullYear();
    var m=t.getMonth()+1;
    var d=t.getDate();
    return y + '-' + this.addSum(m) + '-' + this.addSum(d)
  }
})