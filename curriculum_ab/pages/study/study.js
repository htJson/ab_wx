// pages/study/study.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    trainList: [
      {
        imgUrl: '../../images/001.jpg',
        title: '保洁',
        hour: '40',
        type: '面授',
        typeNum: false,
        credit: '100',
        startTime: '2013/12/03',
        endTime: '2020/12/08',
        centum: '20'
      },
      {
        imgUrl: '../../images/002.jpg',
        title: '母婴',
        hour: '50',
        type: '在线',
        typeNum: true,
        credit: '90',
        startTime: '2019/12/03',
        endTime: '2020/12/08',
        centum: '50'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
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
  
  }
})