var md5 = require('utils/md5.js')
var sha1 = require('utils/sha1.js')
var utils = require('utils/util.js')
// "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
App({
  data: {
    url: 'https://dev-auth.aobei.com',
    timeUrl:'https://dev-api.aobei.com/server/time',
    dev: 'https://dev-api.aobei.com/graphql',
    // dev: 'https://test-api.aobei.com/graphql',
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
    getDataSaveToken:null,
    systemInfo: '',
    token: '',
    saveTokenKey:'',
    userId: '',
    openId: '',
  },
  onLaunch: function (options) {
    var _this = this;
    // 判断环境
    if(this.data.dev.indexOf('dev') != -1){
      this.globalData.saveTokenKey = 'dev_Token_';
    }else if(this.data.dev.indexOf('test') !=-1){
      this.globalData.saveTokenKey = 'test_Token_';
    }else{
      this.globalData.saveTokenKey = 'formal_Token_';
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

    // 登录
    wx.login({
      success: res => {
        this.getOpenId(res.code)
        this.globalData.code = res.code
      }
    })
    // setInterval(() => {
    //   this.upadteToken()
    // }, 7100000)
    // }, 170000)
  },
  getOpenId(vcode) {
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
        wx.getStorage({
          key: this.globalData.saveTokenKey+ res.data.openid,
          success: res=> {
            this.globalData.getDataSaveToken = res.data;
            // 如果有token 则走
            this.globalData.token = res.data.token.value
          },
          fail: res => {
            // 如果没有缓存则走游客token
            this.touristToken()
          }
        })
      }
    })
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
  upadteToken() {
    
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
        console.log(res,'=====')
        this.globalData.token = 'Bearer ' + res.data.access_token;
        this.globalData.userId = res.data.uuid;
        this.globalData.updateTokenData = res.data.refresh_token;
        wx.setStorage({
          key: this.globalData.saveTokenKey + this.globalData.openId,
          data: {
            "token": {
              time: utils.getTowHoursMin(),
              value: 'Bearer ' + res.data.access_token
            },
            "refresh_token": {
              time: utils.getTowMonthTime(),
              value: res.data.refresh_token
            }
          }
        })
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
  req(data, fn, mts) {
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
        if (res.data.error && this.globalData.getDataSaveToken){
          this.globalData.updateTokenData = this.globalData.getDataSaveToken.refresh_token.value;
          this.upadteToken();
        }else{
          return typeof fn == "function" && fn(res)
        }
      },
      fail: res => {
        return typeof fn == "function" && fn(res)
      }
    })
  },

  // 获取token
  getToken() {
    wx.request({
      url: this.data.url + '/oauth/token',
      method: "POST",
      data: {
        grant_type: 'wxm_code',
        appid: this.data.appid,
        code: this.globalData.code,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
        "Duuid": this.globalData.systemInfo
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token;
        this.data.updateTokenData = res.data.refresh_token,
        this.globalData.userId = res.data.uuid
        wx.setStorage({
          key: this.globalData.saveTokenKey + this.globalData.openId,
          data: {
            "token": {
              time: utils.getTowHoursMin(),
              value: 'Bearer ' + res.data.access_token
            },
            "refresh_token": {
              time: utils.getTowMonthTime(),
              value: res.data.refresh_token
            }
          }
        })
      }
    })
  }
})