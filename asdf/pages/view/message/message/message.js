// pages/view/message/message/message.js
const util = require('../../../../utils/util.js');
const app=getApp();
Page({
  data: {
    message:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      id: options.id
    }) 
    this.getmessage();
  },
  getmessage(){
    app.http('POST', app.data.dev, {
        'query':'query{partner_message_detail(id:'+this.data.id+'){msg_title,msg_content,create_datetime,notify_datetime}}'
      }, res => {
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
        if (res.data.data.partner_message_detail == null || res.data.data.partner_message_detail.length == 0){
          return false;
        }
        var data = res.data.data.partner_message_detail;
        data.mydate = new Date(data.create_datetime).format("yyyy-MM-dd hh:mm");
        this.setData({
          message:data
        })
    })
  }
})