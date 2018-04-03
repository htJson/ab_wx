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
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: 'mutation{my_student_insert_course_evaluate(train_schedule_id:"'+id+'",score:'+score+',comment:""){status}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success: res => {
        if (res.data.errors == undefined ){
          wx.showToast({
            title:'评分成功',
            mask:true
          })
        }else{
          wx.showToast({
            title: '评分失败',
            image:'../../images/error.png',
            mask:true
          })
        }
      }
    })
  },
  getRecord(){
    this.setData({
      courseLoading:true
    })
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: "query{my_student_trained_courseinfo_list{trainScheduleInfo{chapter{headline,section_name},course{name},plan{train_begin,train_end,train_way},trainSchedule{train_schedule_id,attendclass_date,attendclass_starttime,attendclass_endtime}},courseEvaluate{train_schedule_id,comment,score}}}"
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          courseLoading: false
        })
        if (res.statusCode == 401 || res.errors != undefined || res.data.data.my_student_trained_courseinfo_list == null || res.data.data.my_student_trained_courseinfo_list.length == 0){
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
          sd=sd.substring(0,sd.length-4)
          var ed = data[i].trainScheduleInfo.plan.train_end.split('T')[1];
          ed=ed.substring(0,ed.length-4)
          data[i].trainScheduleInfo.plan.mydate=d+' '+sd+'~'+ed;
          if (data[i].courseEvaluate==null){
            data[i].courseEvaluate={
              score:0
            }
          }else{
            data[i].courseEvaluate.isScore=true
          }
          vdata.push(data[i])
        }
        console.log(vdata,'=====')
        this.setData({
          coursesList:vdata
        })
      }
    })
  }
})