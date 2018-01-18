var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    radioItems: [
      { name: 'man', value: '男' },
      { name: 'woman', value: '女', },
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOpenId(app.data, app.globalData.code);
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
  getOpenId(options, code) {
    wx.request({
      url: options.url + '/wxapi/jscode2session', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        appid: options.appid,
        js_code: code
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded' // 默认值
      },
      success: res => {
        // this.getToken(options, res.data.openid);
      },
      fail: error => {
        console.log(error)
      }
    })
  },
  getToken(options, openId) {
    wx.request({
      url: options.url + '/oauth/token', //仅为示例，并非真实的接口地址
      method: "POST",
      data: {
        grant_type: 'password',
        username: 'WX_' + openId,
        password: 'WX_' + openId,
      },
      header: {
        "content-type": 'application/x-www-form-urlencoded', // 默认值
        "Authorization": 'Basic d3hfbV9zdHVkZW50OjdjMDhlMjdlLWI2NGYtNDUxOC05YzY5LTU3OTUwODE5NjgxMw=='
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