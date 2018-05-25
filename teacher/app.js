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
    timeUrl:'https://dev-api.aobei.com/server/tjkime',
    code: '',
    appid: 'wx18b2a6ed40277856',
    key:'cce38319-116b-404d-b69a-dc2fdd36941b',
    nostr:'',
    token: '',
    dataUserInfo: "",
    systemInfo: '',
    isAgree: false,
    isChange:false,
    isReload: false,
    versionNum:1.4,
    device:''
  },
  globalData: {
    userInfo: null,
    updateTokenData: '',
    openId: '',
    storageKey:'',
    refresh_token:'',
    serverTime:0,
    userId:''
  },
  onLaunch: function () {
    if(this.data.dev.indexOf('dev') !=-1){
      this.globalData.storageKey = 'devt_Token_'
    }else if(this.data.dev.indexOf('test') !=-1){
      this.globalData.storageKey = 'testt_Token_'
    }else{
      this.globalData.storageKey = 'formalt_Token_'
    }
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
        this.globalData.tokenStorage = wx.getStorageSync(this.globalData.storageKey + this.globalData.openId);
        this.getServerTime()
      }
    })
  },
  getServerTime(){
    wx.request({
      url: this.data.timeUrl,
      method:'POST',
      header:{
        "content-type": 'application/x-www-form-urlencoded', // 默认值
      },
      success:res=>{
        this.globalData.serverTime=res.data.second;
        setInterval(()=>{
          this.globalData.serverTime+=1;
        },1000)
        this.judgeToken()
      }
    })
  },
  judgeToken() {
    var tokenStorage = this.globalData.tokenStorage;
    if (!this.globalData.tokenStorage){
      this.getToken()
    }else{
      if (tokenStorage.token.time - this.globalData.serverTime < 60) {
        console.log(1)
        if (tokenStorage.refresh_token.time - this.globalData.serverTime < 60) {
          console.log(2)
          this.getToken()
        } else {
          console.log(3)
          this.data.updateTokenData = tokenStorage.refresh_token.value;
          this.upadteToken()
        }
      } else {
        console.log(4)
        this.data.isChange=true;
        this.data.updateTokenData = tokenStorage.refresh_token.value;
        this.globalData.token = tokenStorage.token.value
      }
    }
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
  req(data,fn,mts){
    this.globalData.tokenStorage = wx.getStorageSync(this.globalData.storageKey + this.globalData.openId);
    this.judgeToken();
    console.log(this.data.isChange,'====')
    var timer=setInterval(()=>{
      if(this.data.isChange){
        this.nAjax(data, fn, mts);
        clearInterval(timer)
      }
    },30)
  },
  nAjax(data, fn, mts) {
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
        this.data.isChange=false;
        return typeof fn == "function" && fn(res)
      },
      fail: res => {
        this.data.isChange=false;
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
        this.setTokenStorage(res)
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
        this.setTokenStorage(res)
      }
    })
  },

  setTokenStorage(res){
    this.globalData.token = 'Bearer ' + res.data.access_token
    this.globalData.userId = res.data.uuid;
    this.globalData.updateTokenData = res.data.refresh_token;
    this.data.isChange=true;
    wx.setStorage({
      key: this.globalData.storageKey + this.globalData.openId,
      data: {
        token: {
          value: 'Bearer ' + res.data.access_token,
          time: this.globalData.serverTime + res.data.expires_in
        },
        refresh_token: {
          value: res.data.refresh_token,
          time: this.globalData.serverTime + (60 * 24 * 60 * 60)
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