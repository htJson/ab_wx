//pages/view/center/shop/shop.js
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    shopInfo: {},
    stations: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getInfo();
    this.getStation();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  getInfo() {
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: "query{partner_bindinfo{name, address, phone}}"
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success: res => {
        this.setData({
          shopInfo: res.data.data.partner_bindinfo
        })
      }
    })
  },
  getStation() {
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: "query{partner_store_information{address, sub_address}}"
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success: res => {
        this.setData({
          stations: res.data.data.partner_store_information
        })
      }
    })
  }
})