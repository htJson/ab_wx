var sha1 = require("utils/sha1.js");
var utils=require("utils/util.js");
var md5 =require("utils/md5.js")
// client_id=wx_m_student
// secret = 7c08e27e- b64f - 4518 - 9c69- 579508196813
// "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw==',
App({
  data:{
    url: 'https://dev-auth.aobei.com',
    // url:'http://10.10.30.70:9010',
    // dev:'http://10.10.30.70:9010/graphql',
    dev:'https://dev-api.aobei.com/graphql',
    key:'bc8b946d-1c3f-47a7-a28f-f692184aef67',
    code:'',
    name:'',
    dataUserInfo:'',
    phone:'',
    nostr:'',
    appid:'wxe15a4d44733c1121',
    openId:'',
    updateTokenData:'',
    userId:'',
    
  },
  globalData: {
    userInfo: null,
    systemInfo:null,
    updateTokenData: '',
    userId:'',
    token:'',
    openId:'',
    device: '',
    tokenData:null
  },
  onLaunch: function (options) {
    var _this = this;
    wx.getSystemInfo({
      success: res => {
        this.globalData.device = res.model;
        var resCopy={
          errMsg:res.errMsg,
          brand: res.brand,
          model: res.model,
          pixelRatio: res.pixelRatio,
          platform: res.platform,
          screenWidth: res.screenWidth,
          screenHeight: res.screenHeight,
          openId:''
        }
        this.globalData.systemInfo = resCopy
      }
    })
    this.data.nostr = utils.randomWord(false,32)
    this.data.scene = decodeURIComponent(options.scene)
    // 登录
    wx.login({
      success: res => {
        this.data.code = res.code
        this.getOpenId(res.code);
      }
    })
    
    // setInterval(()=>{
    //   this.upadteToken()
    // },7100000)
    setInterval(() => {
      this.upadteToken()
    }, 72000000)
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
        'device': this.globalData.device
      },
      data: {
        appid: this.data.appid,
        js_code: vcode
      },
      success: res => {
        this.globalData.openId=res.data.openid;
        this.globalData.systemInfo.openId =res.data.openid;
        this.globalData.systemInfo = md5.hexMD5(JSON.stringify(this.globalData.systemInfo))
        this.ifGetToken(res);
        // 用openid 提取缓存，
        // 有 --->判断token是否过期，如果过期执行更新，更新前也要判断refresh_token 是否过期
        // 无 --->获取token
        // this.getToken()
      }
    })
  },
  ifGetToken(res){
    wx.getStorage({
      key: res.data.openid,
      success: res=> {
        var nowMin = utils.getTime();
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
  upadteToken(){
    wx.request({
      url: this.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'refresh_token',
        refresh_token: this.data.updateTokenData
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw==',
        "Duuid": this.globalData.systemInfo
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token;
        this.globalData.refresh_token = res.data.refresh_token;
        wx.setStorage({
          key: app.globalData.openId,
          data: {
            token: {
              value: res.data.access_token,
              time: utils.getTowHoursMin()
            },
            refresh_token: {
              value: res.data.refresh_token,
              time: utils.getTowMonthTime()
            }
          }
        })
        this.globalData.userId = res.data.uuid;
      }
    })
  },

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
        'Duuid': this.globalData.systemInfo,
        'version': this.data.versionNum,
        'device': this.globalData.device,
      },
      success: res => {
        return typeof fn == "function" && fn(res)
      }
    })
  },

  req(data,fn,mts){
    var json = {
      "content-type": 'application/json',
      "Authorization": this.globalData.token,
      "channel": this.data.scene,
      'platform': 'wxm',
      'Duuid': this.globalData.systemInfo,
      'version': this.data.versionNum,
      'device': this.globalData.device,
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

  getToken() {
    wx.request({
      // url:'http://10.10.30.70:9010/oauth/token', //仅为示例，并非真实的接口地址
      url: this.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'wxm_code',
        appid: this.data.appid,
        code: this.data.code,
        // userinfo: this.data.dataUserInfo,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw==',
        "Duuid": this.globalData.systemInfo
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
    this.req({ "query": 'query{my_student_bindinfo{phone,name}}'},res=>{
      if (res.data.errors != undefined) {
        wx.redirectTo({
          url: '/pages/login/login',
        })
      }
    })
  }
})