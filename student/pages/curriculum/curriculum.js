var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    trainList:[],
    coursesList: [],
    trainNoData:false,
    trainLoading:false,
    courseNoData:false,
    curseLoading:false,
  },
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
  onLoad: function (options) {
    var _this = this;
    this.timer = setInterval(() => {
      if (app.globalData.token) {
        clearInterval(this.timer)
        this.getCourseList();
        this.getcourseInfo();
      }
    }, 300)
  },
  // 自定义事件
  getCourseList(){   //培训中的课程
    this.setData({
      trainLoading: true
    })
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: "query{my_student_course_team_active_list{course{course_id,img,name,chapter_count,hour,credit,cdate,},plan{train_end,train_begin,train_way},studed}}"
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success: res=> {
        this.setData({
          trainLoading: false
        })
        if (res.statusCode == 401 ||res.errors != undefined || res.data.statusCode == 401 || res.data.data.my_student_course_team_active_list == null || res.data.data.my_student_course_team_active_list.length ==0){
          this.setData({
            trainNoData:true
          })
          return false;
        }
        console.log(res.data.data.my_student_course_team_active_list,'=====')
        var data = res.data.data.my_student_course_team_active_list,n=data.length;
        var idArr=[];
        for(let i=0; i<n; i++){
          idArr.push(data[i].course.img);
          data[i].per=Math.round((data[i].studed/data[i].course.hour)*100);
          data[i].plan.mydate = data[i].plan.train_begin.split('T')[0] + ' ~ ' + data[i].plan.train_end.split('T')[0];
          data[i].course.path='';
        }
        this.getImagePath(idArr)
        this.setData({
          trainList:data
        })
      }
    })
  },
  getImagePath(idArr){
    return wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: '{images(ids:"'+idArr+'"){img_id,path}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        var list = this.data.trainList,m=list.length
        var data=res.data.data.images,n=data.length;
        for (let i = 0; i < m; i++){
          for(let y=0; y<n; y++){
            if(list[i].course.img == data[y].img_id){
              list[i].course.path=data[y].path;
            }
          }
        }
        this.setData({
          trainList:list        
        })
      }
    })
  },
  getcourseInfo(){  //课程表
    this.setData({
      curseLoading:true
    })
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: "query{my_student_courseinfo_active_list{trainSchedule{train_schedule_id,attendclass_date,attendclass_endtime,attendclass_starttime,},chapter {course_id,headline,section_name,section_content,},school{school_id,name},classroom{block_number},plan{train_way},course{name}}}"
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success: res=> {
        this.setData({
          curseLoading: false
        })
        if (res.statusCode == 401 || res.errors != undefined || res.data.statusCode == 401 || res.data.data.my_student_courseinfo_active_list == null || res.data.data.my_student_courseinfo_active_list.length==0){
          this.setData({
            courseNoData:true
          })
          return false;
        }
        var data=res.data.data.my_student_courseinfo_active_list,
          n=data.length;
        for(let a=0; a<n; a++){
            var d = data[a].trainSchedule.attendclass_date.split('T')[0];
            var t = data[a].trainSchedule.attendclass_starttime.split('T')[1];
            var e = data[a].trainSchedule.attendclass_endtime.split('T')[1];
            data[a].trainSchedule.mydate = d + ' ' + t.substring(0, t.length - 3) + '~' + e.substring(0, t.length - 3);
        }
        this.setData({
          coursesList: data
        })
      }
    })
  },
  toDetail: function (options) {
    wx.navigateTo({
      url:'../coursesDetail/coursesDetail?cursore_id=' + options.currentTarget.dataset.id,
      success(){
      }
    })
  },
})