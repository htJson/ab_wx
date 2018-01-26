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

  onLoad: function (options) {
    this.getCourseList();
    this.getcourseInfo();
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
    console.log(1111)
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
        if (res.errors != undefined || res.data.data.my_student_course_team_active_list == null || res.data.data.my_student_course_team_active_list.length ==0){
          this.setData({
            trainNoData:true
          })
          return false;
        }
        var data = res.data.data.my_student_course_team_active_list,n=data.length;
        var idArr=[];
        for(let i=0; i<n; i++){
          idArr.push(data[i].courseTeam.team_img);
          data[i].per=Math.round((data[i].studed/data[i].courseTeam.team_hour)*100);
          data[i].plan.mydate = data[i].plan.train_begin.split('T')[0] + ' ~ ' + data[i].plan.train_end.split('T')[0];
          data[i].courseTeam.path='';
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
        if (res.errors != undefined || res.data.data.my_student_courseinfo_active_list == null || res.data.data.my_student_courseinfo_active_list.length==0){
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
        this.setData({
          coursesList: data
        })
      }
    })
  },
  toDetail: function (options) {
    wx.navigateTo({
      url: '../coursesDetail/coursesDetail?cursore_id=' + options.currentTarget.dataset.id
    })
  },
})