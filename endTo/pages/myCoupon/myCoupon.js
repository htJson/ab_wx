// pages/myCoupon/myCoupon.js
var app=getApp();
Page({
  data: {
    isMine:true,
    couponList:[],
    noData:false,
    isLoading:false
  },
  onLoad: function (options) {
    this.getCouponList();
  },
  backFn() {
    wx.switchTab({
      url: '/pages/mine/mine',
    })
  },
  getCouponList(){
    this.setData({
      isLoading:true
    })
    wx.request({
      url: app.data.dev,
      method:'POST',
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        "query":'query{customer_coupon_list(page_index:1,count:1000){coupon_receive_id,name,value,unit,condition,useStartTime,useEndTime,expire}}'
      },
      success:res=>{
        this.setData({
          isLoading: false
        })
        if (res.data.data.customer_coupon_list.length >0) {
          this.setData({
            couponList: res.data.data.customer_coupon_list
          })
        } else {
          this.setData({
            noData:true
          })
        }
      }
    })
  }
})