// pages/study/study.js
var app=getApp();
Page({
  data: {
    trainList: [],
    trainLoading:false,
    trainNoData:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
  onShareAppMessage: function () {},

  getImagePath(idArr) {
    return wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: '{images(ids:[' + idArr + ']){img_id,path}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success: res => {
        var list = this.data.trainList, m = list.length
        var data = res.data.data.images, n = data.length;
        for (let i = 0; i < m; i++) {
          for (let y = 0; y < n; y++) {
            if (list[i].courseTeam.team_img == data[y].img_id) {
              list[i].courseTeam.path = data[y].path;
            }
          }
        }
        this.setData({
          trainList: list
        })
      }
    })
  },
  getList(){
    this.setData({
      trainLoading:true
    })
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: "query{my_student_trainedinfo_list{courseTeam{team_id,team_name,team_hour,team_credit,team_img},plan{train_way},planStudent{passed},examApplys{score}}}"
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          trainLoading:false
        })
        if (res.statusCode == 401 || res.errors != undefined || res.data.data.my_student_trainedinfo_list == null || res.data.data.my_student_trainedinfo_list.length ==0){
          this.setData({
            trainNoData:true
          })
          return false;
        }
        var data = res.data.data.my_student_trainedinfo_list,n=data.length;
        var idArr=[]
        for(let i=0; i<n; i++){
          idArr.push('"'+data[i].courseTeam.team_img+'"')
        }
        // var data = [{
        //     courseTeam:{
        //       team_id:'1',
        //       team_name:'保洁',
        //       team_hour:'30',
        //       team_credit:'100',
        //       team_img:'12',
        //       path:'../../images/001.png'
        //     },
        //     plan:{
        //       train_way:1
        //     },
        //     planStudent:{
        //       passed:'1'
        //     },
        //     examApplys:{
        //       score:90
        //     }
        // }]

          this.setData({
            trainList:data
          })

          this.getImagePath(idArr)
      }
    })
  }
})