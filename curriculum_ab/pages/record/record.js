// pages/record/record.js
var app=getApp();
Page({
  data: {
    coursesList: [],
    courseNoData:false,
    courseLoading:false
  },
  onLoad: function (options) {
    this.getRecord();
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  },
  onHide: function () {
  
  },
  onUnload: function () {
  
  },
  onPullDownRefresh: function () {
  
  },
  onReachBottom: function () {
  
  },
  onShareAppMessage: function () {
  
  },
  getRecord(){
    this.setData({
      courseLoading:true
    })
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: "query{my_student_trained_courseinfo_list{trainScheduleInfo{course{headline,section_name},courseTeam{team_name},plan{train_begin,train_end,train_way},trainSchedule{attendclass_date,attendclass_starttime,attendclass_endtime}}}}"
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          courseLoading: false
        })
        if (res.errors != undefined || res.data.data.my_student_trained_courseinfo_list == null || res.data.data.my_student_trained_courseinfo_list.length == 0){
          this.setData({
            courseNoData:true
          })
          return false;
        }
        var vdata=[]
        var data = res.data.data.my_student_trained_courseinfo_list,n=data.length;
        for(let i=0; i<n; i++){
          var d = data[i].trainScheduleInfo.trainSchedule.attendclass_date.split('T')[0]
          var sd = data[i].trainScheduleInfo.plan.train_begin.split('T')[1];
          sd=sd.substring(0,sd.length-1)
          var ed = data[i].trainScheduleInfo.plan.train_end.split('T')[1];
          ed=ed.substring(0,ed.length-1)
          data[i].trainScheduleInfo.plan.mydate=d+' '+sd+'~'+ed
          vdata.push(data[i].trainScheduleInfo)
        }
        console.log(vdata)
        this.setData({
          coursesList:vdata
        })
      }
    })
  }
})