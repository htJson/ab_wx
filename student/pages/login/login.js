// Pages/login/login.js
var app=getApp();
var tools=require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    radioItems: [
      { name: 'man', value: '男', checked:true},
      { name: 'woman', value: '女', checked:false},
    ],
    phone:'',
    idNum:'',
    isEditer:true,
    errorTip:'',
    code:'',
    dataUserInfo:'',
    errorNews:{},
    isDisabled:false,
  },
  onLoad: function (options) {
    wx.login({
      success: res => {
        this.data.code = res.code
      }
    })
    this.getUserNews();
  },
  
  getUserNews(){
    app.req({ "query": 'query{my_student_bindinfo{phone,identity_card}}' }, res => {
      if (res.data.data.my_student_bindinfo == null || res.errors != undefined) { return false }
      this.setData({
        isEditer: false
      })
      var data = res.data.data.my_student_bindinfo;
      var midden = data.phone.substring(3, data.phone.length - 1).replace(/\d/g, function (v) { return '*' });
      var phone = data.phone.substr(0, 3) + midden + data.phone.substr(-1, 1);
      var cmidden = data.identity_card.substr(3, data.identity_card.length - 3).replace(/\d/g, function (v) { return '*' });
      var card = data.identity_card.substring(0, 3) + cmidden + data.identity_card.substr(-1, 1)
      this.setData({
        isBind: true,
        phone: phone,
        idNum: card,
        isDisabled: true
      })
    })
  },
  phoneInupt(e){
    this.setData({
      phone:e.detail.value
    })
  },
  idNumInput(e) {
    this.setData({
      idNum: e.detail.value
    })
  },
  checkoutData(){
    var phoneReg =/^[1][3,4,5,7,8][0-9]{9}$/;
    var idNumReg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!idNumReg.test(this.data.idNum)){
      this.setData({
        errorTip:'身份证号填写不正确'
      })
    }
    if (!phoneReg.test(this.data.phone)){
      this.setData({
        errorTip:'手机号填写不正确'
      })
    }
    return phoneReg.test(this.data.phone) && idNumReg.test(this.data.idNum)
  },
  bindUser(){
    if(!this.checkoutData()){return false;}
    this.setData({
      errorTip:''
    })
    this.getToken();
    app.req({ "query": ['mutation{my_student_binduser(phone:"', this.data.phone, '",id_num:"', this.data.idNum, '"){status}}'].join('') }, res => {
      if (res.data.errors != undefined) {
        if (res.data.errors[0].errcode == '40103') {
          this.setData({
            errorTip: '该学生已被绑定'
          })
          return false;
        } else if (res.data.errors[0].errcode == '40101') {
          this.setData({
            errorTip: '没有该学生信息'
          })
          return false;
        } else {
          this.setData({
            errorTip: res.data.errors.message
          })
        }
      } else {
        wx.switchTab({
          url: '../index/index',
          success: function (e) {
            // var nq=getCurrentPages().pop();
            // if(nq == null || nq == undefined) return false;
            // nq.onLoad();
          }
        })
        console.log('跳转前==============')
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
            content: '绑定用户信息必须授权，以后保证用户信息正确',
            showCancel:false,
            success: res => {
              wx.openSetting({
                success: (res) => {
                  if (res.authSetting['scope.userInfo']) {
                    this.getUserINfoFn()
                  }else{
                    this.getStting();
                  }
                }
              })
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
        app.globalData.userInfo = res.userInf
        this.bindUser();
      },
      fail: res => {
        this.bindUser();
      }
    })
  },
  getToken() {
    wx.request({
      url: app.data.url + '/oauth/token', //仅为示例，并非真实的接口地址
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
        "Duuid": app.globalData.systemInfo
      },
      success: res => {
        app.globalData.token = 'Bearer ' + res.data.access_token;
        app.globalData.updateTokenData = res.data.refresh_token;
        wx.setStorage({
          key: app.globalData.openId,
          data: {
            token:{
              value: res.data.access_token,
              time: tools.getTowHoursMin()
            },
            refresh_token:{
              value: res.data.refresh_token,
              time: tools.getTowMonthTime()
            }
          }
        })
        app.globalData.userId = res.data.uuid;
      }
    })
  },
  onGotUserInfo: function (e) {
    if (e.detail.errMsg == 'getUserInfo:ok'){ //如果授权成功
      this.data.dataUserInfo = JSON.stringify(e.detail);
      this.bindUser();
    }else{
      this.getStting();
    }
  }
})