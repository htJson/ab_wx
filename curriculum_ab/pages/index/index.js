var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    trainList:[
      {
        imgUrl:'../../images/001.jpg',
        team_id:1,
        team_name:'保洁',
        team_hour:'40',
        type:'面授',
        typeNum:false,
        team_credit:'100',
        team_begin: '2013/12/03',
        team_end: '2020/12/08',
        centum:''
      },
      { 
        imgUrl: '../../images/002.jpg',
        team_id: 1,
        team_name: '母婴',
        team_hour:'50',
        type:'在线',
        typeNum:true,
        team_credit:'90',
        team_begin:'2019/12/03',
        team_end:'2020/12/08',
        centum: '50'
      }
    ],
    coursesList: [
      {
        startTime: '2019/12/02 10:30:20',
        id:'2',
        curTitle: '月嫂',
        typeName: '面授',
        isRead: true,
        title: '月嫂的注意事项',
        schoolDddress: '智学苑301',
        schoolName: '智学苑北京东城职业大学'
      },
      {
        startTime: '2019/12/02 10:30:20',
        id:'4',
        curTitle: '月嫂',
        isRead: false,
        typeName: '面授',
        title: '月嫂的注意事项',
        schoolDddress: '智学苑301',
        schoolName: '智学苑北京东城职业大学'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCourseList();
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
  // 自定义事件
  getCourseList(){
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: "query{my_student_course_team_active_list{team_id,team_name,team_iclu_course,team_hour,team_credit,team_cdate,train_begin,train_end}}"
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success: function (res) {
        console.log(res.data)
      }
    })
  },
  // get
  toDetail: function () {
    wx.navigateTo({
      url: '../coursesDetail/coursesDetail'
    })
  },
})