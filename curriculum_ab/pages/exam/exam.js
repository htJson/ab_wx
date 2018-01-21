// pages/exam/exam.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coursesList: [
      {
        startTime: '2019/12/02',
        id: '2',
        curTitle: '月嫂',
        typeName: '面授',
        isRead: true,
        title: '月嫂的注意事项',
        schoolDddress: '智学苑301',
        schoolName: '智学苑北京东城职业大学'
      },
      {
        startTime: '2019/12/02',
        id: '4',
        curTitle: '月嫂',
        isRead: false,
        typeName: '面授',
        title: '月嫂的注意事项',
        schoolDddress: '智学苑301',
        schoolName: '智学苑北京东城职业大学'
      }
    ],
    examCounts:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCount()
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
  getCount(){
    wx.request({
      url: app.data.dev,
      method:'POST',
      data:{
        query:"query{my_student_exam_score_counts{total,passed,failed}}"
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        console.log()
        this.setData({
          examCounts: res.data.data.my_student_exam_score_counts
        })
      }
    })
  }
})