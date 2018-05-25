var app=getApp();
// pages/minet/minet.js
Page({
  data: {
    userInfo:{},
  },
  onLoad: function (options) {
    
    this.setData({
      userInfo:app.globalData.userInfo
    })
  },
  changeUrl(event){
    var src = event.currentTarget.dataset.url
    wx.navigateTo({
      url: src,
    })
  }
})