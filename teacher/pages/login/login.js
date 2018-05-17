var app = getApp();
var tools=require('../../utils/util.js')
Page({
  data: {
    radioItems: [
      { name: 'man', value: '男' },
      { name: 'woman', value: '女', },
    ],
    phone:'',
    idCord:'',
    errorTip:'',
    code:'',
    dataUserInfo:'',
    isDisabled:false
  },
  onLoad: function (options) {
    this.getUserNews();
    wx.login({
      success: res => {
        this.data.code = res.code
      }
    })
  },

  getphone(options){
    // 获取手机号
    this.setData({
      phone: options.detail.value
    })
  },
  getIdCord(options){
    // 获取身份证号
    this.setData({
      idCord: options.detail.value
    })
  },
  checkOut(){
    var phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    var idNumReg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!idNumReg.test(this.data.idCord)) {
      this.setData({
        errorTip: '身份证号填写不正确'
      })
    }
    if (!phoneReg.test(this.data.phone)) {
      this.setData({
        errorTip: '手机号填写不正确'
      })
    }
    return phoneReg.test(this.data.phone) && idNumReg.test(this.data.idCord)
  },
  submitForm(){
    if(!this.checkOut()){return false}
    this.setData({
      errorTip:''
    })
    this.getToken();
    app.req({ "query": 'mutation{my_teacher_binduser(phone: "' + this.data.phone + '", id_num: "' + this.data.idCord + '"){status}}'},res=>{
      var data = res.data.my_teacher_binduser;
      if (res.data.errors != undefined) {
        if (res.data.errors[0].errcode =='40106'){
          this.setData({
            errorTip: '该老师已绑定'
          })
        }else{
          this.setData({
            errorTip: res.data.errors[0].message
          })
        }
        return false;
      } else {
        wx.switchTab({
          url: '../index/index',
        })
      }
    })
  },

  getSetting() {
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userInfo']) {
          //  授权过，但是被拒绝了
          wx.showModal({
            title: '提示',
            content: '小程序想获得您的用户信息，以后保证用户信息正确',
            showCancel:false,
            success: res => {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    if (res.authSetting['scope.userInfo']) {
                      this.getUserINfoFn()
                    } else {
                      this.getSetting();
                    }
                    return false;
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
        // 可以将 res 发送给后台解码出 unionId
        this.data.dataUserInfo = JSON.stringify(res);
        app.globalData.userInfo = res.userInfo
        this.submitForm();
      },
      fail(){
        this.submitForm();
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
        "Authorization": 'Basic d3hfbV90ZWFjaGVyOjQ4OTFlNzQ3LTJhOWEtNGI2OC1iMzU5LTU2YzJhNzU5NjQ3OA==',
        "channel": this.data.scene,
        'platform': 'wxm',
        'Duuid': this.data.systemInfo,
        'version': this.data.versionNum,
        'device': this.data.device,
      },
      success: res => {
        app.globalData.token = 'Bearer ' + res.data.access_token
        app.globalData.userId = res.data.uuid;
        app.globalData.updateTokenData = res.data.refresh_token;
        wx.setStorage({
          key: app.globalData.openId,
          data:{
            token:{
              time: tools.getTowHoursMin(),
              value:res.data.access_token
            },
            refresh_token:{
              time: tools.getTowMonthTime(),
              value: res.data.refresh_token
            }
          }
        })
      }
    })
  },


  getUserNews(){
    app.req({ "query": 'query{my_teacher_bindinfo{phone,identity_card}}'},res=>{
      if (res.data.data.my_teacher_bindinfo == null || res.errors != undefined) { 
      
        return false 
      }

      var data = res.data.data.my_teacher_bindinfo;

      var midden = data.phone.substring(3, data.phone.length - 3).replace(/\d/g, function (v) { return '*' });
      var phone = data.phone.substr(0, 3) + midden + data.phone.substr(-3, 3);
      console.log(data.identity_card.substring(3, data.identity_card.length - 3).length)
      var cmidden = data.identity_card.substring(3, data.identity_card.length - 3).replace(/\d/g, function (v) { return '*' });
      var card = data.identity_card.substring(0, 3) + cmidden + data.identity_card.substr(-3, 3)
      this.setData({
        phone: phone,
        idCord: card,
        isDisabled: true
      })
    })
  },
  onGotUserInfo(e){
    console.log(e.detail,'====')
    if (e.detail.errMsg == 'getUserInfo:ok'){
      this.data.dataUserInfo = JSON.stringify(e.detail);
      this.submitForm();
    }else{
      this.getSetting();
    }
  }
})