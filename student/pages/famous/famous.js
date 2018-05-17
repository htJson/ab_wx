var app=getApp();
Page({
  data: {
    detail:null,
    gradeList:['高级','中级','低级']
  },
  onLoad: function (options) {
      this.getData()
  },
  getData(){
    app.req({ "query": 'query{my_student_bindinfo {student_id,name,grade,card_just,health,logo_img,job_number,job_cert,imgs{id,url},serviceItems{serviceitem_id,name,descr,online_date,offline_date,state,category_id,deleted}}}'}, res => {
      if (res.data.data.errors && res.data.errors.length > 0) {
        wx.showToast({
          title: '请求出错',
          icon: 'none'
        })
      } else {
        this.setData({
          detail: res.data.data.my_student_bindinfo
        })
      }
    })
  },
  previewFn(options){
    wx.previewImage({
      current:'', // 当前显示图片的http链接
      urls: [options.currentTarget.dataset.url] // 需要预览的图片http链接列表
    })
  }
})