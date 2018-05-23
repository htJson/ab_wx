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
    timeUrl:'https://dev-api.aobei.com/server/time',
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
    saveTokenKey:'',
    userId:'',
    token:'',
    openId:'',
    device: '',
    tokenData:null
  },
  onLaunch: function (options) {
    var _this = this;
    if(this.data.dev.indexOf('dev') !=-1){
      this.globalData.saveTokenKey = 'dev_Token_'
    }else if(this.data.dev.indexOf('test') !=-1){
      this.globalData.saveTokenKey = 'test_Token_'
    }else{
      this.globalData.saveTokenKey = 'formal_Token_'
    }
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
      }
    })
  },
  ifGetToken(res){
    wx.getStorage({
      key: this.globalData.saveTokenKey+res.data.openid,
      success: res=> {
        this.andOrTime(res)
      },
      fail: res => {
        this.getToken()
      }
    })
  },
  andOrTime(res){
    wx.request({
      url: this.data.timeUrl,
      method:'POST',
      header:{
        "content-type": 'application/x-www-form-urlencoded', // 默认值
      },
      success:re=>{
        var time=re.data.second;
        if (res.data.token.time - time < 10) {
          if (res.data.refresh_token.time - time < 10) {
            this.getToken()
          } else {
            this.globalData.updateTokenData = res.data.refresh_token.value;
            this.upadteToken()
          }
        } else {
          this.globalData.updateTokenData = res.data.refresh_token.value;
          this.globalData.token = res.data.token.value
        }
      }
    })
  },
  upadteToken(){
    wx.request({
      url: this.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'refresh_token',
        refresh_token: this.globalData.updateTokenData
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw==',
        "Duuid": this.globalData.systemInfo
      },
      success: res => {
        this.setTokenStorage(res)
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
        this.setTokenStorage(res)
        
      }
    })
  },

  setTokenStorage(res){
    wx.request({
      url: this.data.timeUrl,
      method:'POST',
      header:{
        "content-type": 'application/x-www-form-urlencoded', // 默认值
      },
      success:timeData=>{
        this.globalData.token = 'Bearer ' + res.data.access_token;
        this.globalData.updateTokenData = res.data.refresh_token;
        this.globalData.userId = res.data.uuid;
        this.getInfo();
        wx.setStorage({
          key: this.globalData.saveTokenKey + this.globalData.openId,
          data: {
            token: {
              value: 'Bearer ' + res.data.access_token,
              time: timeData.data.second+(2*60)
            },
            refresh_token: {
              value: res.data.refresh_token,
              time: timeData.data.second+(4*60)
            }
          }
        })
      }
    })
  },
  getInfo(){
    console.log('=============>?app.js')
    // 根据是否绑定判断进入哪个界面
    this.req({ "query": 'query{my_student_bindinfo{phone,name}}'},res=>{
      if (res.data.errors != undefined || res.data.error) {
        wx.redirectTo({
          url: '/pages/login/login',
        })
      }
    })
  }
})