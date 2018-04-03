var app=getApp()
Page({
  data: {
    date:'',
    complate:[],
    noData:false,
    loading:false
  },
  onLoad(){
    this.getNowDate();
    this.getFinish()
  },
  getNowDate(){
    var now = new Date();
    var y=now.getFullYear();
    var m=now.getMonth()+1;
    var d=now.getDate();
    this.setData({
      date:y+'-'+m+'-'+d
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
    this.getFinish();
  },
  goToDetail(options){
    var id=options.currentTarget.dataset.orderid
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail',
    })
  },

  getFinish(){
    this.setData({
      loading:true
    })
    wx.request({
      url: app.data.dev,
      method:'POST',
      data:{
        "query": 'query{student_complete_orderinfo(dateValue:"' + this.data.date +'",page_index:1,count:1000) {pay_order_id,name,price_total,remarkList{remark}}}'
      },
      header:{
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success: res => {
        this.setData({
          loading: false,
          noData:false
        })

        if (res.data.errors || res.data.error || res.data.data.student_complete_orderinfo==null){
          console.log('-=---------')
          this.setData({
            noData:true
          })
        }else{
          this.setData({
            complate: res.data.data.student_complete_orderinfo
          })
        }
      }
    })
  }
})