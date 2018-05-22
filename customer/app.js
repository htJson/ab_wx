var md5 = require('utils/md5.js')
var sha1 = require('utils/sha1.js')
var utils = require('utils/util.js')
// "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
App({
  data: {
    url: 'https://test-auth.aobei.com',
    dev: 'https://test-api.aobei.com/graphql',
    // dev: 'https://test-api.aobei.com/graphql',
    timeUrl:'https://test-api.aobei.com/server/time',
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
    saveTokenKey: '',
    systemInfo: '',
    token: '',
    saveTokenKey:'',
    userId: '',
    openId: '',
  },
  onLaunch: function (options) {
    var _this = this;
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

    // 登录
    wx.login({
      success: res => {
        this.getOpenId(res.code)
        this.globalData.code = res.code
      }
    })
    // setInterval(() => {
    //   this.upadteToken()
    // }, 10000)
    // }, 7100000)
  },
  getTime(res){   //根据时间判断storage是否有效
    wx.request({
      url: this.data.timeUrl,
      method:'POST',
      header:{
        "content-type": 'application/x-www-form-urlencoded', // 默认值
      },
      success:timeData=>{
        var timeNum = timeData.data.second
        // 如果有token 缓存
        if (res.data.token.time - timeNum < 10) {
          // 如果token马上过期则走更新token
          if (res.data.refresh_token.time - timeNum < 10) {
            // 如果更新token的refresh_token过期则走游客token
            this.touristToken()
          } else {
            // 如果没过期则走更新token
            setInterval(() => {
              this.upadteToken('c')
            }, 10000)
            this.globalData.updateTokenData = res.data.refresh_token.value
            this.upadteToken()
          }
        } else {
          setInterval(() => {
            this.upadteToken('b')
          }, 10000)
          // 如果token还没有过期则赋值token
          this.globalData.updateTokenData = res.data.refresh_token.value
          this.globalData.token = res.data.token.value
        }
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
        wx.getStorage({  //拿取token storage
          key: this.globalData.saveTokenKey + res.data.openid,
          success: res=> {   //如果有storage 
            this.getTime(res);
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

  setTokenStorage(res){  //更新缓存token
    wx.request({
      url:this.data.timeUrl,
      method:'POST',
      header:{
        "content-type": 'application/x-www-form-urlencoded', // 默认值
      },
      success:timeData=>{
        var time=timeData.data.second;
        this.globalData.token = 'Bearer ' + res.data.access_token;
        this.globalData.userId = res.data.uuid;
        this.globalData.updateTokenData = res.data.refresh_token;
        wx.setStorage({
          key: this.globalData.saveTokenKey + this.globalData.openId,
          data: {
            "token": {
              time: time+(2*60),
              value: 'Bearer ' + res.data.access_token
            },
            "refresh_token": {
              time: time+(4*60),
              value: res.data.refresh_token
            }
          }
        })
      }
    })
    
  },
  upadteToken(key) {
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
        if(res.data.error == 'invalid_token'){
          this.touristToken()
          return false;
        }
        this.setTokenStorage(res)
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
  req(data,fn,htmlName,mts) {
    // 判断token   刷新token 是否过期
    var tokenStorage = wx.getStorageSync(this.globalData.saveTokenKey + this.globalData.openId)
    if(tokenStorage){
      var tokenTime = tokenStorage.token.time, refresh_tokenTime = tokenStorage.refresh_token.time;
      wx.request({
        url: this.data.timeUrl,
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded', // 默认值
        },
        success: res => {
          if(tokenTime - res.data.second <50){
            // token过期 
            if(refresh_tokenTime - res.data.second < 50){
              // 判断refresh_token是否过期
              console.log('====??????更新token 过期了')
              if (htmlName == 'index' || htmlName =='skuDetail'){
                console.log('指定界面了走的游客token')
                // 如果在首页则走游客token
                this.touristToken()
                this.nAjax(data, fn, mts)
              }else{
                console.log('没有指定界面 跳转登录界面')
                wx.redirectTo({
                  url: '/pages/login/login?url=/pages/index/index',
                })
              }
            }else{
              // 如果更新token没有过期则走更新token
              console.log('token')
              this.globalData.updateTokenData = tokenStorage.refresh_token.value;
              this.upadteToken('req')
              this.nAjax(data, fn, mts)
            }
          }else{
            // token没有过期
            console.log('====')
            this.nAjax(data, fn, mts)
          }
        }
      })
    }else{
      // 还没登录的情况下（走临时token）
      this.nAjax(data, fn, mts)
    }
  },
  nAjax(data, fn, mts){
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