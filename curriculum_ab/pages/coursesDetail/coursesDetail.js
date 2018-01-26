// pages/coursesDetail/coursesDetail.js
var app=getApp();
Page({
  data: {
    id:'',
    content:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      id:options.cursore_id
    })
    this.getDetail();
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
  getDetail(){
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: 'query{train_schedule_info(train_schedule_id:"' + this.data.id +'"){trainSchedule {attendclass_date,attendclass_starttime},course{headline,section_name},school{school_name,school_address},classroom {block_number},plan{train_way},courseTeam{team_name}}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        var data = res.data.data.train_schedule_info;
        var d = data.trainSchedule.attendclass_date.split('T')[0];
        var t = data.trainSchedule.attendclass_starttime.split('T')[1];
        t = t.substring(0, t.length - 1);
          data.trainSchedule.myDate =d+' '+t
        this.setData({
          content:data
        })
      }
    })
  }
})