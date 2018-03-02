// pages/subOrder/subOrder.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userName:'张三',
    phone:"13211111111",
    address:'北京市朝阳区四惠家园2号楼1129',
    time:'2013-09-23 8:00-9:00'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  goToAddress(){
    wx.navigateTo({
      url: '/pages/addressList/addressList',
    })
  },
  goToTime(){
    wx.navigateTo({
      url: '/pages/timeList/timeList',
    })
  }

})