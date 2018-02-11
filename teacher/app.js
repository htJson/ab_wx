App({
  data: {
    url: 'https://test-auth.aobei.com',
    // dev: 'https://test-api.aobei.com/graphql',
    dev: 'http://10.10.30.18:9002/graphql',
    code: '',
    appid: 'wx731d62ae850c6c5e',
    token: '',
    userId: ''
  },
  onLaunch: function () {
    this.getFirstDay()
    console.log(this.getToday())
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // this.globalData.code=res.code
        this.getOpenId(res.code)
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
  getOpenId(code) {
    wx.request({
      url: this.data.url + '/wxapi/jscode2session', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        appid: this.data.appid,
        js_code: code
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded' // 默认值
      },
      success: res => {
        this.getToken(res.data.openid);
      },
      fail: error => {
        console.log(error)
      }
    })
  },
  getToken(openId) {
    wx.request({
      url: this.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'password',
        username: 'WX_' + openId + '__c',
        password: 'WX_' + openId + '__c',
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV90ZWFjaGU6NDg5MWU3NDctMmE5YS00YjY4LWIzNTktNTZjMmE3NTk2NDc4'
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token
        this.globalData.userId = res.data.uuid
        this.getInfo();
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