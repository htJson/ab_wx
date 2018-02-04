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
        query:'query{user_message_info_list{id,type,user_id,msg_title,msg_content,status,create_datetime}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          newsLoading: false
        })
        if (res.statusCode == 401 || res.errors != undefined || res.data.data.user_message_info_list == null || res.data.data.user_message_info_list.length==0){
          this.setData({
            newsNoData:true
          })
          return false;
        }
        var data = res.data.data.user_message_info_list,n=data.length;
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