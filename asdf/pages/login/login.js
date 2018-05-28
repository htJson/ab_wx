// Pages/login/login.js
const HTTP = require('../../utils/http.js');
const app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    radioItems: [
      { name: 'man', value: '男', checked:true},
      { name: 'woman', value: '女', checked:false},
    ],
    can:false,
    phone:'',
    linkman:'',
    errorTip:'',
    errorNews:{},
    isDisabled:false,
  },
  onLoad() {
    wx.login({
      success: res => {
        this.data.code = res.code
      }
    })
    this.getUserInfo();
  },
  getUserInfo(){
    app.http('POST', app.data.dev, {
        'query':'query{partner_bindinfo{linkman,phone}}'
      }, res => {
        if (res.statusCode == 401 || res.errors != undefined) {
          wx.showToast({
            title: '未授权',
            icon: 'success',
            duration: 2000
          });
        }
        if (res.data.data.partner_bindinfo == null){
          return false;
        }
      
        let data = res.data.data.partner_bindinfo;
        let linkman = data.linkman;
        let midden = data.phone.substring(3, data.phone.length - 1).replace(/\d/g, function (v) { return '*' });
        let phone = data.phone.substr(0, 3) + midden + data.phone.substr(-1, 1);
        this.setData({
          isBind:true,
          phone: phone,
          linkman: linkman,
          isDisabled:true
        })
    })
  },
  linkmanInput(e) {
    this.setData({
      linkman: e.detail.value
    })
  },
  phoneInupt(e){
    this.setData({
      phone:e.detail.value
    })
  },
  checkoutData(){
    let phoneReg =/^[1][3,4,5,7,8][0-9]{9}$/;
    if (!phoneReg.test(this.data.phone)){
      this.setData({
        errorTip:'手机号填写不正确'
      })
      wx.showToast({
        title: this.data.errorTip,
        icon: 'none'
      })
    }
    return phoneReg.test(this.data.phone)
  },
  bindUser() {
    //if (!this.checkoutData()) { return false; }
    this.setData({
      errorTip: ''
    })
    app.http('POST', app.data.dev, {
        'query': 'mutation{partner_binduser(phone: "' + this.data.phone + '",linkman: "' + this.data.linkman + '"){status}}'
      }, res => {
        let errmsg = res.data.errors;
        if (errmsg) {
          this.setData({
            errorTip: errmsg[0].message
          })
          wx.showToast({
            title: this.data.errorTip,
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: '绑定成功',
            icon: 'success'
          })
          setTimeout(() => {
            wx.switchTab({
              url: '../index/index',
              success: function (e) {
                // let nq=getCurrentPages().pop();
                // if(nq == null || nq == undefined) return false;
                // nq.onLoad();
              }
            })
          },1000)
        }
    })
  },
  getStting() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userInfo']) {
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
                    }
                  }
                })
              }
            }
          })
        } 
      }
    })
  },
  getUserINfoFn() {
    wx.getUserInfo({
      success: res => {
        this.data.dataUserInfo = JSON.stringify(res);
        app.globalData.userInfo = res.userInfo
            console.log(this.data.dataUserInfo)
            console.log(app.globalData.userInfo);
        this.getToken()
        this.bindUser();
      },
      fail: res => {
        this.bindUser();
      }
    })
  },
  getToken() {
    wx.request({
      url: app.data.url + '/oauth/token',
      method: "POST",
      data: {
        grant_type: 'wxm_code',
        appid: app.data.appid,
        code: this.data.code,
        userinfo: this.data.dataUserInfo,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw==',
        "Duuid": HTTP.header.Duuid
      },
      success: res => {
        this.data.can = true;
        app.globalData.token = 'Bearer ' + res.data.access_token;
        app.globalData.updateTokenData = res.data.refresh_token;
        app.globalData.userId = res.data.uuid;
      }
    })
  },
  onGotUserInfo: function (e) {
    if (e.detail.errMsg == 'getUserInfo:ok'){ //如果授权成功
      this.data.dataUserInfo = JSON.stringify(e.detail);
      !this.data.can && this.getToken();
      this.bindUser();
    }else{
      this.getStting();
    }
  }
})