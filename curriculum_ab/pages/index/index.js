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
        query: "query{my_student_course_team_active_list{courseTeam{team_id,team_img,team_name,team_iclu_course,team_hour,team_credit,team_cdate,},plan{train_end,train_begin,train_way},studed}}"
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
        var data = res.data.data.my_student_course_team_active_list,n=data.length;
        var idArr=[];
        for(let i=0; i<n; i++){
          idArr.push(data[i].courseTeam.team_img);
          console.log(Math.round((data[i].studed / data[i].courseTeam.team_hour) * 100))
          data[i].per=Math.round((data[i].studed/data[i].courseTeam.team_hour)*100);
          data[i].plan.mydate = data[i].plan.train_begin.split('T')[0] + ' ~ ' + data[i].plan.train_end.split('T')[0];
          data[i].courseTeam.path='';
        }
        this.getImagePath(idArr)
        console.log(data,'=======')
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
            if(list[i].courseTeam.team_img == data[y].img_id){
              list[i].courseTeam.path=data[y].path;
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
        query: "query{my_student_courseinfo_active_list{trainSchedule{id,attendclass_date,attendclass_endtime,attendclass_starttime},course{course_id,headline,section_name,section_content},school{school_id,school_name,},classroom{block_number},plan{train_way},courseTeam{team_name}}}"
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
            data[a].trainSchedule.mydate = d + ' ' + t.substring(0, t.length - 1);
        }
        console.log(data,'vdata====')
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
        console.log('res====')
      }
    })
  },
})