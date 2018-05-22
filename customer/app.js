var md5 = require('utils/md5.js')
var sha1 = require('utils/sha1.js')
var utils = require('utils/util.js')
// "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
App({
  data: {
    url: 'https://test-auth.aobei.com',
    dev: 'https://test-api.aobei.com/graphql',
    // dev: 'https://test-api.aobei.com/graphql',
    timeUrl: 'https://test-api.aobei.com/server/time',
    code: '',
    key: 'ac928fb7-f11a-4d9f-894c-8283859bc914',
    appid: 'wx653dc689ca79ac81',
    scene: null,
    versionNum: 1.4,
    nostr: '',
    device: ''
  },
  globalData: {
    isAgree: false,
    updateTokenData: '',
    systemInfo: '',
    tokenStorage: '',
    token: '',
    serverTime: 0,
    saveTokenKey: '',
    userId: '',
    openId: '',
  },
  onLaunch: function (options) {
    // wx.clearStorageSync()
    // 判断环境
    if (this.data.dev.indexOf('dev') != -1) {
      this.globalData.saveTokenKey = 'devt_Token_';
    } else if (this.data.dev.indexOf('test') != -1) {
      this.globalData.saveTokenKey = 'testt_Token_';
    } else {
      this.globalData.saveTokenKey = 'formalt_Token_';
    }

    wx.getSystemInfo({  //获取系统信息
      success: res => {
        this.data.device = res.model;
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
    this.data.nostr = utils.randomWord(false, 32)
    this.data.scene = decodeURIComponent(options.scene)
    this.getServerTime();
    // 登录
    wx.login({
      success: res => {
        this.getOpenId(res.code)
        this.globalData.code = res.code
      }
    })
  },

  getOpenId(vcode) {  //获取openid     1
    wx.request({
      url: this.data.url + '/wxapi/jscode2session',
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "channel": this.data.scene,
        'platform': 'wxm',
        'Duuid': this.globalData.systemInfo,
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
        this.data.openId = res.data.openid.toString();
        this.globalData.tokenStorage = wx.getStorageSync(this.globalData.saveTokenKey + this.globalData.openId)
        console.log(this.globalData.tokenStorage)
        this.judgeToken();
      }
    })
  },
  getServerTime() {  //获取服务器时间，然后定时器增加时间
    wx.request({
      url: this.data.timeUrl,
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
      },
      success: timeData => {
        this.globalData.serverTime = timeData.data.second;
        setInterval(() => {
          this.globalData.serverTime += 1;
        }, 1000)
      }
    })
  },
  judgeToken() { //判断token
    console.log(this.globalData.serverTime, '-----------------time')
    console.log(this.globalData.tokenStorage, '=================????????')
    var serverTime = this.globalData.serverTime, tokenStorage = this.globalData.tokenStorage;
    if (!this.globalData.tokenStorage) {  //如果没有缓存的token
      this.touristToken();
      return false;
    }
    // 如果有缓存的token
    if (tokenStorage.token.time - serverTime < 10) {
      console.log(1)
      if (tokenStorage.refresh_token.time - serverTime < 10) {
        console.log(2)
        this.touristToken()
      } else {
        console.log(3)
        this.globalData.updateTokenData = tokenStorage.refresh_token.value
        this.upadteToken()
      }
    } else {
      console.log(4)
      this.globalData.updateTokenData = tokenStorage.refresh_token.value
      this.globalData.token = tokenStorage.token.value
    }
  },

  // 游客token
  touristToken() {
    wx.request({
      url: this.data.url + '/oauth/token',
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
        "Duuid": this.globalData.systemInfo
      },
      data: {
        'grant_type': 'client_credentials',
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token
      }
    })
  },

  setTokenStorage(res) {  //更新缓存token
    wx.request({
      url: this.data.timeUrl,
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
      },
      success: timeData => {
        var time = timeData.data.second;
        this.globalData.token = 'Bearer ' + res.data.access_token;
        this.globalData.userId = res.data.uuid;
        this.globalData.updateTokenData = res.data.refresh_token;
        wx.setStorage({
          key: this.globalData.saveTokenKey + this.globalData.openId,
          data: {
            "token": {
              time: time + (2 * 60),
              value: 'Bearer ' + res.data.access_token
            },
            "refresh_token": {
              time: time + (4 * 60),
              value: res.data.refresh_token
            }
          }
        })
      }
    })
  },

  upadteToken(key) {  //token 更新方法
    wx.request({
      url: this.data.url + '/oauth/token?d=' + new Date().getTime(), //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'refresh_token',
        refresh_token: this.globalData.updateTokenData
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
        "channel": this.data.scene,
        'platform': 'wxm',
        'Duuid': this.globalData.systemInfo,
        'version': this.data.versionNum,
        'device': this.data.device
      },
      success: res => {
        if (res.data.error == 'invalid_token') {  //如果更新出错，说明refresh_token 失效，登录失效走游客
          this.touristToken()
          return false;
        }
        this.setTokenStorage(res)
      }
    })
  },

  // 获得幂等code
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
        'device': this.data.device,
      },
      success: res => {
        return typeof fn == "function" && fn(res)
      }
    })
  },

  // 请求封装
  req(data, fn, htmlName, mts) {
    // 判断token   刷新token 是否过期
    this.globalData.tokenStorage = wx.getStorageSync(this.globalData.saveTokenKey + this.globalData.openId)
    this.judgeToken();
    this.nAjax(data, fn, mts)
  },
  nAjax(data, fn, mts) {
    var json = {
      "content-type": 'application/json',
      "Authorization": this.globalData.token,
      "channel": this.data.scene,
      'platform': 'wxm',
      'Duuid': this.globalData.systemInfo,
      'version': this.data.versionNum,
      'device': this.data.device,
      "nostr": this.data.nostr,
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
        return typeof fn == "function" && fn(res)
      },
      fail: res => {
        return typeof fn == "function" && fn(res)
      }
    })
  }

})