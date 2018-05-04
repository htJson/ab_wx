var app=getApp();
Page({
  data: {
    detail:null,
    gradeList:['高级','中级','低级']
  },
  onLoad: function (options) {
      this.getData()
  },
  getData(){
    app.req({ "query": 'query{my_student_bindinfo {student_id,name,grade,card_just,health,logo_img,job_number,job_cert,imgs{id,url},serviceItems{serviceitem_id,name,descr,online_date,offline_date,state,category_id,deleted}}}'}, res => {
      if (res.data.data.errors && res.data.errors.length > 0) {
        wx.showToast({
          title: '请求出错',
          icon: 'none'
        })
      } else {
        this.setData({
          detail: res.data.data.my_student_bindinfo
        })
      }
    })
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