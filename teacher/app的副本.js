var md5=require('./utils/md5.js')
var util = require('./utils/util.js');
var sha1=require('./utils/sha1.js');
// client_id=wx_m_teache
// secret = 4891e747 - 2a9a- 4b68- b359 - 56c2a7596478
// "Authorization": 'Basic d3hfbV90ZWFjaGVyOjQ4OTFlNzQ3LTJhOWEtNGI2OC1iMzU5LTU2YzJhNzU5NjQ3OA==',
App({
  data: {
    url: 'https://test-auth.aobei.com',
    dev: 'https://test-api.aobei.com/graphql',
    // dev: 'https://test-api.aobei.com/graphql',
    code: '',
    appid: 'wx18b2a6ed40277856',
    key:'cce38319-116b-404d-b69a-dc2fdd36941b',
    nostr:'',
    token: '',
    dataUserInfo: "",
    userId: '',
    openId:'',
    systemInfo: '',
    isAgree: false,
    updateTokenData:'',
    isReload: false,
    versionNum:1.4,
    device:''
  },
  onLaunch: function () {
    var _this = this;
    wx.getSystemInfo({
      success: res => {
        this.data.device=res.model;
        this.data.systemInfo = md5.hexMD5(JSON.stringify(res))
      }
    })
    
    this.data.nostr = util.randomWord(false,32)
    setInterval(()=>{
      this.upadteToken()
    },72000000)
    // 登录
    wx.login({
      success: res => {
        this.getOpenid(res.code)
        this.data.code=res.code
      }
    })
  },
  getmstCode(fn) {
    wx.request({
      url: this.data.dev,
      method: 'POST',
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
  req(data, fn, mts) {
    var json = {
      "content-type": 'application/json',
      "Authorization": this.globalData.token,
      "channel": this.data.scene,
      'platform': 'wxm',
      'Duuid': this.data.systemInfo,
      'version': this.data.versionNum,
      'device': this.data.device,
      'nostr': this.data.nostr,
      "sign": ""
    };
    var str = 'nostr=' + this.data.nostr + "&query=" + data.query + '&key=' + this.data.key;
    var n = sha1.sha1(str)
    json.sign = n.toUpperCase();
    wx.request({
      url: this.data.dev,
      method: "POST",
      header: json,
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
        "channel": this.data.scene,
        'platform': 'wxm',
        'Duuid': this.data.systemInfo,
        'version': this.data.versionNum,
        'device': this.data.device,
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
              this.getSetting();
            }
          },
          fail: result => {
            this.getSetting();
          }
        })
      }
    })
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
  globalData: {
    userInfo: null
  },
  getUserINfoFn() {
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        this.data.dataUserInfo = JSON.stringify(res);
        this.globalData.userInfo = res.userInfo
        wx.setStorage({
          key: this.data.openId,
          data: '',
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
  upadteToken() {
    wx.request({
      url: this.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'refresh_token',
        refresh_token: this.data.updateTokenData
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV90ZWFjaGVyOjQ4OTFlNzQ3LTJhOWEtNGI2OC1iMzU5LTU2YzJhNzU5NjQ3OA==',
        "channel": this.data.scene,
        'platform': 'wxm',
        'Duuid': this.data.systemInfo,
        'version': this.data.versionNum,
        'device': this.data.device
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token,
        this.globalData.userId = res.data.uuid
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
        code: this.data.code,
        userinfo: this.data.dataUserInfo,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV90ZWFjaGVyOjQ4OTFlNzQ3LTJhOWEtNGI2OC1iMzU5LTU2YzJhNzU5NjQ3OA==',
        "channel": this.data.scene,
        'platform': 'wxm',
        'Duuid': this.data.systemInfo,
        'version': this.data.versionNum,
        'device': this.data.device,
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token
        this.globalData.userId = res.data.uuid;
        this.data.updateTokenData = res.data.refresh_token;
        this.getInfo();
      }
    })
  },

  getInfo() {
    // 根据是否绑定判断进入哪个界面
    this.req({ "query": 'query{my_teacher_bindinfo{phone,identity_card}}'},res=>{
      if (res.data.errors != undefined) {
        wx.navigateTo({
          url: '/pages/login/login',
        })
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