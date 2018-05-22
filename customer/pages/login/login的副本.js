// pages/login/login.js
var app=getApp();
Page({
  data: {
    phoneNum:'',
    code:'',
    errorTip:'',
    btnText:'获取验证码',
    isGetCode:true,
    id:'',
    url:'',
    skuId:''
  },
  onLoad(options){
    this.setData({
      id:options.id||'',
      url:options.url,
      skuId: options.skuId||''
    })
  },
  getPhone(options){
    this.setData({
      phoneNum:options.detail.value
    })
  },
  getCode(options) {
    this.setData({
      code: options.detail.value
    })
  },
  checkPhone(){
    var phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    if(this.data.phoneNum == ''){
      this.setData({
        errorTip:'手机号不能为空'
      })
      return false;
    }
    if (!phoneReg.test(this.data.phoneNum)){
      this.setData({
        errorTip:'手机号输入错误'
      })
      return false;
    }
    return true;
  },
  backFn(){
    if (this.data.id) {
      wx.redirectTo({
        url: '/' + this.data.url + '?product_id=' + this.data.id +'&skuId='+this.data.skuId,
      })
    } else {
      wx.switchTab({
        url: '/pages/index/index',
      })
    }
  },
  checkCode(){
    var reg=/^[0-9]{4}$/;
    if(this.data.code == ''){
      this.setData({
        errorTip:'验证码不能为空'
      })
      return false;
    }else if(!reg.test(this.data.code)){
      this.setData({
        errorTip:'验证码错误'
      })
      return false;
    }
    return true;
  },
  getAjaxCode() {
    if(!this.checkPhone() || !this.data.isGetCode){return false;}
    app.req({ "query": 'mutation{customer_n_send_verification_code(phone:"' + this.data.phoneNum + '"){status}}'},res=>{
      if (res.data.errors == undefined || res.data.errors == null) {
        this.setData({
          isGetCode: false,
          btnText: '60秒后重新获取'
        })
        this.countDown();
      }
    })
  },
  countDown(){
    var s=60;
    this.setData({
      errorTip:''
    })
    var timer=setInterval(()=>{
      s--;
      if(s==0){
        clearInterval(timer);
        this.setData({
          isGetCode:true,
          btnText:'重新获取'
        })
      }else{
        
        this.setData({
          btnText:s+'秒后重新获取'
        })
      }
    },1000)
  },
  login(){
    if(this.checkPhone() && this.checkCode()){
      this.setData({
        errorTip:''
      })
      wx.showLoading({
        title: '登录中请稍后',
        mask: true
      })
      app.req({ "query": 'mutation{customer_bind_user(code:"' + this.data.code + '",phone:"' + this.data.phoneNum + '"){status}}'},res=>{
        wx.hideLoading()
        if (res.data.errors && res.data.errors.length > 0) {
          if (res.data.errors[0].errcode == '41017') {
            this.setData({
              errorTip: '手机号已绑定过'
            })
          } else if (res.data.errors[0].errcode == '41126') {
            this.setData({
              errorTip: '验证码已过期'
            })
          } else if (res.data.errors[0].errcode == '41011') {
            this.setData({
              errorTip: '验证码不存在'
            })
          }
        } else {
          if (this.data.id) {
            wx.redirectTo({
              url: '/' + this.data.url + '?product_id=' + this.data.id + '&skuId=' + this.data.skuId,
            })
          } else {
            wx.switchTab({
              url: '/pages/index/index',
            })
          }
        }
      })
    }
  }
})