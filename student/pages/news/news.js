// pages/news/news.js
var app=getApp();
Page({
  data: {
    newsList:[],
    newsNoData:false,
    newsLoading:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getNewsList();
  },

  getNewsList(){
    this.setData({
      newsLoading:true
    })
    wx.request({
      url:app.data.dev,
      method:'POST',
      data:{
        query:'query{student_show_massageInfo(page_index:1,count:1000){id,type,user_id,msg_title,msg_content,status,create_datetime}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          newsLoading: false
        })
        if (res.statusCode == 401 || res.errors != undefined || res.data.data.student_show_massageInfo == null || res.data.data.student_show_massageInfo.length==0){
          this.setData({
            newsNoData:true
          })
          return false;
        }
        var data = res.data.data.student_show_massageInfo,n=data.length;
        for(let i=0; i<n; i++){
          var d=data[i].create_datetime.split('T');
          d[1] = d[1].substring(0, d[1].length - 1);
          data[i].mydate=d.join(' ');
        }
        this.setData({
          newsList:data
        })
      }
    })
  }
})