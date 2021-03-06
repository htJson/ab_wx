var sha1 = require("utils/sha1.js");
var utils=require("utils/util.js");
// client_id=wx_m_student
// secret = 7c08e27e- b64f - 4518 - 9c69- 579508196813
// "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw==',
App({
  data:{
    url:'https://dev-auth.aobei.com',
    // dev:'http://10.10.30.70:9020/graphql',
    dev:'https://dev-api.aobei.com/graphql',
    key:'bc8b946d-1c3f-47a7-a28f-f692184aef67',
    code:'',
    name:'',
    dataUserInfo:'',
    phone:'',
    nostr:'',
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
    this.data.nostr = utils.randomWord(false,32)
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
  // 更新token
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
        "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw==',
        "Duuid": this.data.systemInfo
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token,
        this.globalData.userId = res.data.uuid
      }
    })
  },
  // 获取幂等code
  getmstCode(fn) {
    wx.request({
      url: this.data.dev,
      method: 'POST',
      data: {
        "query": 'query{apicode{code,expires_in}}'
      },
      header: {
        "content-type": 'application/json',
        "Authorization": this.globalData.token,
        "channel": this.data.scene,
        'platform': 'wxm',
        'Duuid': this.data.systemInfo,
        'version': this.data.versionNum,
        'device': this.data.device,
      },
      success: res => {
        return typeof fn == "function" && fn(res)
      }
    })
  },
// 小程序请求包装
  req(data,fn,mts){
    var json = {
      "content-type": 'application/json',
      "Authorization": this.globalData.token,
      "channel": this.data.scene,
      'platform': 'wxm',
      'Duuid': this.data.systemInfo,
      'version': this.data.versionNum,
      'device': this.data.device,
      'nostr':this.data.nostr,
      "sign": ""
    }, headerData = null, str = '';
    if (typeof mts == 'object' && mts.mts != '') {
      headerData = Object.assign({}, json, mts);
      str += '&mts=' + mts.mts +'&';
    } else {
      headerData = json
    } 
    str += 'nostr=' + this.data.nostr + "&query=" + data.query+'&key=' + this.data.key;
    var n = sha1.sha1(str)
    headerData.sign = n.toUpperCase();
    wx.request({
      url: this.data.dev,
      method: "POST",
      header: headerData,
      data: data,
      success: res => {
        if(res.data.error && res.data.error == 'sign_error'){
          wx.showToast({
            title: ' 签名错误 ',
            icon:'none'
          })
        }
        return typeof fn == "function" && fn(res)
      },
      fail: res => {
        return typeof fn == "function" && fn(res)
      }
    })
  },
// 获取openid
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
            if (this.data.isAgree) { //是否获取过  userInfo
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
  // 获取授权设置
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
  // 获取用户信息
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
//  获取token
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
        "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw==',
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
  // 获取用户是否绑定
  getInfo(){
    // 根据是否绑定判断进入哪个界面
    this.req({ "query": 'query{my_student_bindinfo{phone,name}}'},res=>{
      if (res.data.errors != undefined) {
        wx.redirectTo({
          url: '/pages/login/login',
        })
      }
    })
  }
})