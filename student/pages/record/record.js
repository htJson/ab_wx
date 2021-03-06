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
  startFn(e){
    var pIndex = e.target.dataset.par;
    var zIndex=e.target.dataset.zid;
    var changeStr = "coursesList[" + pIndex +"].courseEvaluate.score"
    this.setData({
      [changeStr]:zIndex
    })
  },
  submitScore(e){
    console.log(e)
    var score = e.target.dataset.score;
    var id = e.target.dataset.pid;

    app.req({ "query":'mutation{my_student_insert_course_evaluate(train_schedule_id:"' + id + '",score:' + score + ',comment:""){status}}'}, res => {
      if (res.data.errors == undefined) {
        wx.showToast({
          title: '评分成功',
          mask: true
        })
        this.getRecord();
      } else {
        wx.showToast({
          title: '评分失败',
          image: '../../images/error.png',
          mask: true
        })
      }
    })
  },
  getRecord(){
    this.setData({
      courseLoading:true
    })
    app.req({ "query": "query{my_student_trained_courseinfo_list{trainScheduleInfo{chapter{headline,section_name},course{name},plan{train_way},trainSchedule{train_schedule_id,attendclass_date,attendclass_starttime,attendclass_endtime}},courseEvaluate{train_schedule_id,comment,score}}}" }, res => {
      this.setData({
        courseLoading: false
      })
      if (res.statusCode == 401 || res.errors != undefined || res.data.data.my_student_trained_courseinfo_list == null || res.data.data.my_student_trained_courseinfo_list.length == 0) {
        this.setData({
          courseNoData: true
        })
        return false;
      }
      var vdata = []
      var data = res.data.data.my_student_trained_courseinfo_list, n = data.length;
      for (let i = 0; i < n; i++) {
        var d = data[i].trainScheduleInfo.trainSchedule.attendclass_date.split('T')[0]
        var sd = data[i].trainScheduleInfo.trainSchedule.attendclass_starttime.split('T')[1];
        sd = sd.substring(0, sd.length - 3)
        var ed = data[i].trainScheduleInfo.trainSchedule.attendclass_endtime.split('T')[1];
        ed = ed.substring(0, ed.length - 3)
        data[i].trainScheduleInfo.plan.mydate = d + ' ' + sd + '~' + ed;
        if (data[i].courseEvaluate == null) {
          data[i].courseEvaluate = {
            score: 0
          }
        } else {
          data[i].courseEvaluate.isScore = true
        }
        vdata.push(data[i])
      }
      this.setData({
        coursesList: vdata
      })
    })
  }
})