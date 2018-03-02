App({
  data:{
    url:'https://test-auth.aobei.com',
    // dev:'http://10.10.30.18:9004/graphql',
    dev:'https://test-api.aobei.com/graphql',
    code:'',
    appid:'wxe15a4d44733c1121',
    token:'',
    userId:'',
  },
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        // this.globalData.code=res.code
        this.getToken(res.code);
        // this.getUn(res.code)
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
  getUn(code){
    wx.request({
      url: 'https://api.weixin.qq.com/sns/jscode2session?appid='+this.data.appid+'&secret=SECRET&js_code=JSCODE&grant_type=authorization_code',
      data:{
        appid:this.data.appid,
        secret:"142d6b743d09bd6d2ebb62c0bace1498",
        js_code:code,
        grant_type:'authorization_code'
      },success:res=>{
        console.log(res,'===========')
      }
    })
  },
  globalData: {
    userInfo: null
  },
  // getOpenId(code) {
  //   wx.request({
  //     url: this.data.url + '/wxapi/jscode2session', //仅为示例，并非真实的接口地址
  //     method: "POST",
  //     data: {
  //       appid:this.data.appid,
  //       js_code: code
  //     },
  //     header: {
  //       "content-type": 'application/x-www-form-urlencoded' // 默认值
  //     },
  //     success: res => {
  //       this.getToken(res.data.openid);
  //     },
  //     fail: error => {
  //       console.log(error)
  //     }
  //   })
  // },
  getToken(code) {
    wx.request({
      url: this.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'password',
        username: 'WXM_' + this.data.appid + ':' + code,
        password: code,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw=='
      },
      success:res=>{
        this.globalData.token ='Bearer '+res.data.access_token
        this.globalData.userId=res.data.uuid
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
        query:'query{my_student_bindinfo{phone}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": this.globalData.token
      },
      success:res=>{
        console.log(res,'=++++++++++++++++++++++++++')
        if(res.data.errors !=undefined){
          wx.redirectTo({
            url: '/pages/login/login',
          })
        }
      }
    })
  }
})