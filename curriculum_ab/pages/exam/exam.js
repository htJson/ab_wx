// pages/exam/exam.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coursesList: {},
    examCounts:{},
    loading:false,
    noData:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCount();
    this.getList();
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
        this.setData({
          examCounts: res.data.data.my_student_exam_score_counts
        })
      }
    })
  },
  getList(){
    this.setData({
      loading:true
    })
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data:{
        query:"query{my_student_exam_apply_result{examPlan{id,exam_date},examApply{score},courseTeam{team_name,team_id}}}"
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          loading: false,
        })

        if (res.statusCode == 401 ||res.errors != undefined || res.data.data.my_student_exam_apply_result == null || res.data.data.my_student_exam_apply_result.length == 0){
          this.setData({
            noData:true
          })
          return false;
        }

        var data = res.data.data.my_student_exam_apply_result,n=data.length;
        var json={};
        for(let  i=0; i<n ;i++){
          var d=data[i].examPlan.exam_date.split('T')[0];
          data[i].examPlan.date=d;
          if(json[d] == undefined){
            json[d]=[];
          }

          json[d].push({
            teamName: data[i].courseTeam.team_name,
            score: data[i].examApply.score
          })
        }
        this.setData({
          coursesList:json
        })
      }
    })
  }
})