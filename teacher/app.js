var md5=require('./utils/md5.js')
var utils = require('./utils/util.js');
var sha1=require('./utils/sha1.js');
// client_id=wx_m_teache
// secret = 4891e747 - 2a9a- 4b68- b359 - 56c2a7596478
// "Authorization": 'Basic d3hfbV90ZWFjaGVyOjQ4OTFlNzQ3LTJhOWEtNGI2OC1iMzU5LTU2YzJhNzU5NjQ3OA==',
App({
  data: {
    url: 'https://dev-auth.aobei.com',
    dev: 'https://dev-api.aobei.com/graphql',
    // dev: 'https://test-api.aobei.com/graphql',
    code: '',
    appid: 'wx18b2a6ed40277856',
    key:'cce38319-116b-404d-b69a-dc2fdd36941b',
    nostr:'',
    token: '',
    dataUserInfo: "",
    userId: '',
    
    systemInfo: '',
    isAgree: false,
    isReload: false,
    versionNum:1.4,
    device:''
  },
  globalData: {
    userInfo: null,
    updateTokenData: '',
    openId: '',
  },
  onLaunch: function () {
    var _this = this;
    wx.getSystemInfo({
      success: res => {
        this.data.device=res.model;
        var resCopy = {
          errMsg: res.errMsg,
          brand: res.brand,
          model: res.model,
          pixelRatio: res.pixelRatio,
          platform: res.platform,
          screenWidth: res.screenWidth,
          screenHeight: res.screenHeight,
          openId: ''
        }
        this.globalData.systemInfo = resCopy
      }
    })
    this.data.nostr = utils.randomWord(false,32)
    setInterval(()=>{
      this.upadteToken()
    },72000000)
    // 登录
    wx.login({
      success: res => {
        this.data.code=res.code
        this.getOpenId(res.code)
      }
    })
  },

  getOpenId(vcode) {
    wx.request({
      url: this.data.url + '/wxapi/jscode2session',
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "channel": this.data.scene,
        'platform': 'wxm',
        'Duuid': this.data.systemInfo,
        'version': this.data.versionNum,
        'device': this.data.device
      },
      data: {
        appid: this.data.appid,
        js_code: vcode
      },
      success: res => {
        this.globalData.openId = res.data.openid;
        this.globalData.systemInfo.openId = res.data.openid;
        this.globalData.systemInfo = md5.hexMD5(JSON.stringify(this.globalData.systemInfo))
        this.ifGetToken(res);
        // 用openid 提取缓存，
        // 有 --->判断token是否过期，如果过期执行更新，更新前也要判断refresh_token 是否过期
        // 无 --->获取token
        // this.getToken()
      }
    })
  },
  ifGetToken(res) {
    wx.getStorage({
      key: res.data.openid,
      success: res => {
        var nowTime = utils.formatTime();
        var nowMin = new Date(nowTime).getTime();
        // console.log(nowMin,'')
        // console.log(res, '===', utils.formatTime())
        if (nowMin - res.data.token.time < 6000) {
          // 如果当前时间减去 token存储时间小于一分钟则更新token
          if (nowMin - res.data.refresh_token.time < 600) {
            // 如果refresh_token 过期则重新请求
            this.getToken()
          } else {
            this.data.updateTokenData = res.data.refresh_token.value;
            this.upadteToken()
          }
        } else {
          // 如果token还在有效期内
          this.globalData.token = res.data.token.value
        }
      }, 
      fail: res => {
        this.getToken()
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
        // userinfo: this.data.dataUserInfo,
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
        console.log('===')
        this.globalData.token = 'Bearer ' + res.data.access_token
        this.globalData.userId = res.data.uuid;
        this.globalData.updateTokenData = res.data.refresh_token;
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