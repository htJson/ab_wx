var md5 = require('utils/md5.js')
var sha1 = require('utils/sha1.js')
var utils =require('utils/util.js')
// "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
App({
  data: {
    url: 'https://test-auth.aobei.com',   
    dev:'https://test-api.aobei.com/graphql', 
    // dev: 'https://test-api.aobei.com/graphql',
    code: '',
    key:'ac928fb7-f11a-4d9f-894c-8283859bc914',
    appid: 'wx653dc689ca79ac81',
    token: '',
    dataUserInfo:"",
    userId: '',
    openId:'',
    systemInfo:'',
    updateTokenData:'',
    isAgree:false,
    isReload:false,
    scene:null,
    versionNum:1.4,
    nostr:'',
    device:''
  },
  onLaunch: function (options) {
    var _this=this;
    wx.getSystemInfo({
      success:res=>{
        this.data.device = res.model;
        this.data.systemInfo = md5.hexMD5(JSON.stringify(res))
      }
    })
    this.data.nostr = utils.randomWord(false,32)
    this.data.scene = decodeURIComponent(options.scene)
    this.data.isAgree= wx.getStorage({
      key: 'isAgree',
      success: res=> {
        this.data.isAgree=res
      }
    })    
    // 登录
    wx.login({
      success: res => {
        this.getOpenId(res.code)
        this.globalData.code = res.code
      }
    })
    setInterval(() => {
      this.upadteToken()
    }, 7100000)
    // }, 170000)
  },
  upadteToken() {
    wx.request({
      url: this.data.url + '/oauth/token?d='+new Date().getTime(), //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'refresh_token',
        refresh_token: this.data.updateTokenData
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
        "channel": this.data.scene,
        'platform': 'wxm',
        'Duuid': this.data.systemInfo,
        'version': this.data.versionNum,
        'device': this.data.device
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token;
        this.globalData.userId = res.data.uuid;
        this.data.updateTokenData = res.data.refresh_token;
      }
    })
  },
  
  getOpenId(vcode){
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
        console.log(res,'====')
        this.data.openId = res.data.openid.toString();
        wx.getStorage({
          key: this.data.openId + '====wxm',
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
  getmstCode(fn){
    wx.request({
      url: this.data.dev,
      method:'POST',
      data:{
        "query": 'query{apicode{code,expires_in}}'
      },
      header:{
        "content-type": 'application/json',
        "Authorization": this.globalData.token,
        "channel": this.data.scene,
        'platform': 'wxm',
        'Duuid': this.data.systemInfo,
        'version': this.data.versionNum,
        'device': this.data.device,
      },
      success:res=>{
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
      'Duuid': this.data.systemInfo,
      'version': this.data.versionNum,
      'device': this.data.device,
      "nostr":this.data.nostr,
      "sign":""
    }, headerData = null, str ='';

    if(typeof mts == 'object' && mts.mts != ''){
      headerData = Object.assign({},json,mts);
      str+='mts=' + mts.mts +'&';
    }else{
      headerData=json
    }
    str += 'nostr=' + this.data.nostr + "&query=" + data.query + '&key='+this.data.key;
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
  getUserINfoFn(){
    wx.getUserInfo({
      success: res => {
        // 可以将 res 发送给后台解码出 unionId
        this.data.dataUserInfo = JSON.stringify(res);
        this.globalData.userInfo = res.userInfo
        this.data.isAgree=true
        wx.setStorage({
          key: this.data.openId+'====wxm',
          data: true,
        })
        this.getToken()
        // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
        // 所以此处加入 callback 以防止这种情况
        if (this.userInfoReadyCallback) {
          this.userInfoReadyCallback(res)
        }
      },
      fail:res=>{
        this.getToken();
      }
    })
  },
  globalData: {
    userInfo: null
  },
  getToken() {
    wx.request({
      url: this.data.url + '/oauth/token',
      method: "POST",
      data: {
        grant_type: 'wxm_code',
        appid: this.data.appid,
        code: this.globalData.code,
        userinfo: this.data.dataUserInfo,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9jdXN0b206NHg5MWI3NGUtM2I3YS1iYjZ4LWJ0djktcXpjaW83ams2Zzdm',
        "Duuid": this.data.systemInfo
      },
      success: res => {
        this.globalData.token = 'Bearer ' + res.data.access_token;
        this.data.updateTokenData = res.data.refresh_token,
        this.globalData.userId = res.data.uuid
      }
    })
  }
})