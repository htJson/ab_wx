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
    this.getCourseList();
    this.getcourseInfo();
    this.getInfo()
  },
  // 自定义事件
  getCourseList(){   //培训中的课程
    this.setData({
      trainLoading: true
    })
    app.req({ "query": 'query{my_student_course_team_active_list{course{course_id,img,name,chapter_count,hour,credit,cdate,},plan{train_end,train_begin,train_way},studed}}' }, res => {
      this.setData({
        trainLoading: false
      })
      if (res.statusCode == 401 || res.errors != undefined || res.data.statusCode == 401 || res.data.data.my_student_course_team_active_list == null || res.data.data.my_student_course_team_active_list.length == 0) {
        this.setData({
          trainNoData: true
        })
        return false;
      }
      var data = res.data.data.my_student_course_team_active_list, n = data.length;
      var idArr = [];
      for (let i = 0; i < n; i++) {
        idArr.push(data[i].course.img);
        data[i].per = Math.round((data[i].studed / data[i].course.hour) * 100);
        data[i].plan.mydate = data[i].plan.train_begin.split('T')[0] + ' ~ ' + data[i].plan.train_end.split('T')[0];
        data[i].course.path = '';
      }
      this.getImagePath(idArr)
      this.setData({
        trainList: data
      })
    })
  },
  getImagePath(idArr){
    app.req({ "query": '{images(ids:"' + idArr + '"){img_id,path}}'},res=>{
      var list = this.data.trainList, m = list.length
      var data = res.data.data.images, n = data.length;
      for (let i = 0; i < m; i++) {
        for (let y = 0; y < n; y++) {
          if (list[i].course.img == data[y].img_id) {
            list[i].course.path = data[y].path;
          }
        }
      }
      this.setData({
        trainList: list
      })
    })
  },
  getcourseInfo(){  //课程表
    this.setData({
      curseLoading:true
    })
    app.req({ "query": 'query{my_student_courseinfo_active_list{trainSchedule{train_schedule_id,attendclass_date,attendclass_endtime,attendclass_starttime,},chapter {course_id,headline,section_name,section_content,},school{school_id,name},classroom{block_number},plan{train_way},course{name}}}' }, res => {
      this.setData({
        curseLoading: false
      })
      if (res.statusCode == 401 || res.errors != undefined || res.data.statusCode == 401 || res.data.data.my_student_courseinfo_active_list == null || res.data.data.my_student_courseinfo_active_list.length == 0) {
        this.setData({
          courseNoData: true
        })
        return false;
      }
      var data = res.data.data.my_student_courseinfo_active_list,
        n = data.length;
      for (let a = 0; a < n; a++) {
        var d = data[a].trainSchedule.attendclass_date.split('T')[0];
        var t = data[a].trainSchedule.attendclass_starttime.split('T')[1];
        var e = data[a].trainSchedule.attendclass_endtime.split('T')[1];
        data[a].trainSchedule.mydate = d + ' ' + t.substring(0, t.length - 3) + '~' + e.substring(0, t.length - 3);
      }
      this.setData({
        coursesList: data
      })
    })
  },
  toDetail: function (options) {
    wx.navigateTo({
      url:'../coursesDetail/coursesDetail?cursore_id=' + options.currentTarget.dataset.id,
      success(){
      }
    })
  },
  getInfo() { //判断是否登录
    app.req({ "query": 'query{my_student_courseinfo_active_list{trainSchedule{train_schedule_id,attendclass_date,attendclass_endtime,attendclass_starttime,},chapter {course_id,headline,section_name,section_content,},school{school_id,name},classroom{block_number},plan{train_way},course{name}}}' }, res => {
      if (res.data.errors && res.data.errors.length > 0) {
        wx.showModal({
          title: '用户提示',
          content: '请先登录',
          showCancel: false,
          confirmColor: '#00a0e9',
          success: res => {
            if (res.confirm) {
              wx.redirectTo({
                url: '/pages/login/login?url=' + this.data.meUrl,
              })
            }
          }
        })
      } else {
        this.setData({
          isLogin: true
        })
      }
    })
  }
})