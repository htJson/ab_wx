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
  },

  /*
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(app,'=====')
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
  
  bindUser(){
    wx.request({
      // url: app.data.url + '/graphql', //仅为示例，并非真实的接口地址
      url: 'http://10.10.30.65:8090/graphql', //仅为示例，并非真实的接口地址
      method: "POST",
      data: { "query": "{my_student_bindinfo{student_id,student_age,student_name}}", "variables": null, "operationName": null },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": 'Bearer '+app.globalData.token
      },
      success: res => {
        console.log(res, '====')
      },
      fail: error => {
        console.log(error)
      }
    })
  }
})