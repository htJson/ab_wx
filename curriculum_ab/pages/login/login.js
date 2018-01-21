// Pages/login/login.js
var app=getApp();
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
    errorTip:'',
    errorNews:{}
  },

  /*
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(app,'=====')
    // this.getOpenId(app.data,);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
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
    wx.request({
      url: app.data.dev, //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        "query": ['mutation{my_student_binduser(phone:"',this.data.phone,'",id_num:"',this.data.idNum,'"){status}}'].join('')
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": 'Bearer '+app.globalData.token
      },
      success: res => {
        if (res.data.errors =='undefined'){
          this.setData({
            errorTip: res.data.errors[0].message
          })
        }else{
          console.log(1111)
          wx.switchTab({
            url: '../index/index'
          })
        }
      },
      fail: error => {
        console.log(error)
      }
    })
  }
})