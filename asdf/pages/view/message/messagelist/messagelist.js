// pages/view/message/messagelist/messagelist.js
const util = require('../../../../utils/util.js');
const app=getApp();
Page({
  data: {
    messageList:[],
    noData:false,
    hidden: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getmessageList();
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
    this.getmessageList();
    wx.stopPullDownRefresh();
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
  getmessageList(){
    this.setData({
      hidden: false
    });
    app.http('POST', app.data.dev, {
        'query':'query{partner_message_info(page_index:1,count:10){id,msg_title,msg_content,status,create_datetime,notify_datetime}}'
      }, res => {
        this.setData({
          hidden: true
        })
        let errmsg = res.data.errors;
        if (errmsg) {
          wx.showToast({
            title: errmsg[0].message,
            icon: 'none'
          })
          return false
        }
        if (res.statusCode == 401 || res.errors != undefined) {
          wx.showToast({
            title: '未授权',
            icon: 'success',
            duration: 2000
          });
        }
        if (res.data.data.partner_message_info == null || res.data.data.partner_message_info.length == 0){
          this.setData({
            noData:true
          })
          return false;
        }
        var data = res.data.data.partner_message_info,n=data.length;
        for(let i=0; i<n; i++){
          data[i].mydate = new Date(data[i].create_datetime).format("yyyy-MM-dd hh:mm");
        }
        this.setData({
          messageList:data
        })
    })
  },
  toDetail(options) {
    wx.navigateTo({
      url: '../message/message?id=' + options.currentTarget.dataset.id
    })
  }
})