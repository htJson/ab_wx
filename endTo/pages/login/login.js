// pages/login/login.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phoneNum:'',
    code:'',
    errorTip:'',
    btnText:'获取验证码',
    isGetCode:true,
  },
  onLoad(){
    console.log(app)
    console.log(app.globalData.token)
    
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
    wx.request({
      url: app.data.dev,
      method:'POST',
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        query: 'mutation{send_verification_code(phone:"15201491992"){status}}'
      },
      success:res=>{
        console.log(res,'====')
        if(res.data.errors == undefined || res.data.errors ==null){
          this.setData({
            isGetCode:false,
            btnText:'60秒后重新获取'
          })
          this.countDown();
        }
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
      console.log(33)
      wx.request({
        url: app.data.dev,
        method:'POST',
        data:{
          query:'mutation{my_customer_binduser(code:"'+this.data.code+'",phone:"'+this.data.phoneNum+'"){status}}'
        },
        header:{
          "content-type": "application/json",
          "Authorization": app.globalData.token
        },
        success:res=>{
          wx.hideLoading()
          if(res.data.errors == undefined || res.data.errors == null ){
            
          } else if (res.data.errors[0].errcode == '41126'){
            this.setData({
              errorTip:'验证码已过期'
            })
          }else if(res.data.errors[0].errcode == ''){

          }
        }
      })
    }
  }
})