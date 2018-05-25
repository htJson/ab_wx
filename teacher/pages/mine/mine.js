var app=getApp();
// pages/minet/minet.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    urlList:{
      login: '/pages/login/login',
      curriculum:'/pages/curriculum/curriculum',
      task:'/pages/task/task', 
      news:'/pages/news/news',
      judge:'/pages/judge/judge'
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      userInfo:app.globalData.userInfo
    })
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
  // 自定义事件
  changeUrl(event){
    var key = event.currentTarget.dataset.key;
    var url=this.data.urlList[key];
    console.log(url)
    wx.navigateTo({
      url: url,
    })
  }
})