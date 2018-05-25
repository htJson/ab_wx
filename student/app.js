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
    serverTime:0,
    userId:'',
    token:'',
    isChange:false,
    openId:'',
    device: '',
    tokenData:null
  },
  onLaunch: function (options) {
    var _this = this;
    if(this.data.dev.indexOf('dev') !=-1){
      this.globalData.saveTokenKey = 'devt_Token_'
    }else if(this.data.dev.indexOf('test') !=-1){
      this.globalData.saveTokenKey = 'testt_Token_'
    }else{
      this.globalData.saveTokenKey = 'formalt_Token_'
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
    // 32位随机字符串
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
  

  getOpenId(vcode) { //获得openId
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
        this.data.storageToken = wx.getStorageSync(this.globalData.saveTokenKey + res.data.openid)
        this.getServerTime(); 
      }
    })
  },
  getServerTime() {
    wx.request({
      url: this.data.timeUrl,
      method: 'POSt',
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
      },
      success: res => {
        this.globalData.serverTime = res.data.second;
        setInterval(() => {
          this.globalData.serverTime += 1;
        }, 1000)
        this.judgeToken();
      }
    })
  },
  judgeToken(){ //判断token是否过期
    if (!this.data.storageToken) {  //如果没有缓存的token
      this.getToken();
      return false;
    }
    console.log(this.data.storageToken,'===')
    var serverTime = this.globalData.serverTime, tokenStorage = this.data.storageToken;
    if (tokenStorage.token.time -serverTime< 10) {
      console.log('token过期')
      if (tokenStorage.refresh_token.time -serverTime < 10) {
        console.log('刷新token过期,则走获取token,但是没有用户信息')
        this.getToken()
      } else {
        console.log('刷新token没有过期')
        this.globalData.updateTokenData = tokenStorage.refresh_token.value;
        this.upadteToken()
      }
    } else {
      console.log('token未过期')
      // this.getInfo();     
      this.data.isChange=true; 
      this.globalData.updateTokenData = tokenStorage.refresh_token.value;
      this.globalData.token = tokenStorage.token.value
    }
  },

  upadteToken(){ //更新token
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

  getToken() { //获取token
    wx.request({
      url: this.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'wxm_code',
        appid: this.data.appid,
        code: this.data.code,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw==',
        "Duuid": this.globalData.systemInfo
      },
      success: res => { 
        this.setTokenStorage(res)
        // this.getInfo();
      }
    })
  },

  setTokenStorage(res){  //设置token
    this.globalData.token = 'Bearer ' + res.data.access_token;
    this.globalData.updateTokenData = res.data.refresh_token;
    this.globalData.userId = res.data.uuid;
    this.data.isChange = true;
    wx.setStorage({
      key: this.globalData.saveTokenKey + this.globalData.openId,
      data: {
        token: {
          value: 'Bearer ' + res.data.access_token,
          time: this.globalData.serverTime + (2 * 60 * 60)
          // time: this.globalData.serverTime+(2*60)
        },
        refresh_token: {
          value: res.data.refresh_token,
          time: this.globalData.serverTime + (60 * 24 * 60 * 60)
          // time: this.globalData.serverTime+(4*60)
        }
      }
    })
  },
  // getInfo(){ //判断是否登录
  //   // 根据是否绑定判断进入哪个界面
  //   this.req({ "query": 'query{my_student_bindinfo{phone,name,logo_img}}'},res=>{
  //     if (res.data.errors != undefined || res.data.error) {
  //       wx.redirectTo({
  //         url: '/pages/login/login',
  //       })
  //     }
  //   })
  // },

  getmstCode(fn) { //获得幂等coDe
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


  req(data, fn, mts) { //请求封装
    this.data.storageToken = wx.getStorageSync(this.globalData.saveTokenKey + this.globalData.openId)
    this.judgeToken();
    console.log(this.data.isChange,'><>>>>>>>>')
    var timer = setInterval(() => {
      if (this.data.isChange) {
        console.log('=======>>>>aaa')
        this.nAjax(data, fn, mts)
        clearInterval(timer)
      }
    }, 30)
  },
  nAjax(data, fn, mts){
    var json = {
      "content-type": 'application/json',
      "Authorization": this.globalData.token,
      "channel": this.data.scene,
      'platform': 'wxm',
      'Duuid': this.globalData.systemInfo,
      'version': this.data.versionNum,
      'device': this.globalData.device,
      'nostr': this.data.nostr,
      "sign": ""
    }, headerData = null, str = '';
    if (typeof mts == 'object' && mts.mts != '') {
      headerData = Object.assign({}, json, mts);
      str += 'mts=' + mts.mts + '&';
    } else {
      headerData = json
    }
    str += 'nostr=' + this.data.nostr + "&query=" + data.query + '&key=' + this.data.key;
    var n = sha1.sha1(str)
    headerData.sign = n.toUpperCase();
    wx.request({
      url: this.data.dev,
      method: "POST",
      header: headerData,
      data: data,
      success: res => {
        this.data.isChange=false;
        if (res.data.error && res.data.error == 'sign_error') {
          wx.showToast({
            title: ' 签名错误 ',
            icon: 'none'
          })
        }
        return typeof fn == "function" && fn(res)
      },
      fail: res => {
        this.data.isChange = false;
        return typeof fn == "function" && fn(res)
      }
    })
  }
})