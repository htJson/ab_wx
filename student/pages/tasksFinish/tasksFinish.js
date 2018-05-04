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
    var orderId = options.currentTarget.dataset.orderid;
    wx.setStorage({
      key: 'orderId',
      data: orderId,
    })
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail',
    })
  },

  getFinish(){
    this.setData({
      loading:true,
      complate:[]
    })
    app.req({ "query": 'query{student_complete_orderinfo(dateValue:"' + this.data.date + '",page_index:1,count:1000) {pay_order_id,name,price_total,remarkList{remark}}}'}, res => {
      this.setData({
        loading: false,
        noData: false
      })
      if (res.data.errors || res.data.error || res.data.data.student_complete_orderinfo == null) {
        this.setData({
          noData: true
        })
      } else {
        this.setData({
          complate: res.data.data.student_complete_orderinfo
        })
      }
    })
  }
})