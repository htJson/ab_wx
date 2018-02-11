// pages/coursesDetail/coursesDetail.js
var app=getApp();
Page({
  data: {
    id:'',
    content:{},
    loading:false,
    noData:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
    this.setData({
      loading:true
    })
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: 'query{train_schedule_info(train_schedule_id:"'+this.data.id+'"){trainSchedule {attendclass_date,attendclass_endtime,attendclass_starttime},chapter{headline,section_name},school{name,address},classroom {block_number},plan{train_way},course{name}}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          loading: false
        })
        if (res.statusCode == 401 ||res.errors != undefined || res.data.data.train_schedule_info ==null){
          console.log('asfsfs')
          this.setData({
            noData:true
          })
        }
        var data = res.data.data.train_schedule_info;
        var d = data.trainSchedule.attendclass_date.split('T')[0];
        var t = data.trainSchedule.attendclass_starttime.split('T')[1];
        var e = data.trainSchedule.attendclass_endtime.split('T')[1];
        t = t.substring(0, t.length - 4);
          data.trainSchedule.myDate =d+' '+t+'~'+e.substring(0,e.length-4);

        this.setData({
          content:data
        })
      }
    })
  }
})