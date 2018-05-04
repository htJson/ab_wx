// pages/news/news.js
var app=getApp();
Page({
  data: {
    newsList:[],
    newsNoData:false,
    newsLoading:false
  },
  onLoad: function (options) {
    this.getNewsList();
  },
  getNewsList(){
    this.setData({
      newsLoading:true
    })
    app.req({ "query": 'query{student_show_massageInfo(page_index:1,count:1000){id,type,user_id,msg_title,msg_content,status,create_datetime}}'}, res => {
      this.setData({
        newsLoading: false
      })
      if (res.statusCode == 401 || res.errors != undefined || res.data.data.student_show_massageInfo == null || res.data.data.student_show_massageInfo.length == 0) {
        this.setData({
          newsNoData: true
        })
        return false;
      }
      var data = res.data.data.student_show_massageInfo, n = data.length;
      for (let i = 0; i < n; i++) {
        var d = data[i].create_datetime.split('T');

        data[i].mydate = d.join(' ');
      }
      this.setData({
        newsList: data
      })
    })
  }
})