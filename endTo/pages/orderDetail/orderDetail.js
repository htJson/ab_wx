var app=getApp();
Page({
  data: {
    orderId:"",
    detail:null,
    statusList: {
      'waitService': '待服务',
      'cancel': '已取消',
      'waitPay': '待付款',
      'payed': '已支付',
      'done': '已完成',
      'refused': '已拒单',
      'waitRefund': '待退款',
      'partRefund': '已部分退款',
      'refunded': '已退款'
    },
    cancelContent:''
  },
  onLoad: function (options) {
    this.setData({
      orderId:options.id
    })
    wx.getStorage({
      key: 'cancel',
      success: res=> {
        this.setData({
          cancelContent:res.data
        })
      },
    })
    this.getDetail();
  },
  backFn(){
    wx.switchTab({
      url: '/pages/order/order',
    })
  },
  getDetail(){
    wx.request({
      url: app.data.dev,
      method:"POST",
      data:{
        "query": 'query{customer_order_detail(pay_order_id:"' + this.data.orderId +'") {pay_order_id,name,price_total,price_discount,price_pay,orderStatus,cus_username,cus_phone,customer_address,customer_address_id,image_first,product_id,c_begin_datetime,c_end_datetime,isEvaluate,remark}}'
      },
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          detail: res.data.data.customer_order_detail
        })
      }
    })
  },
  goToDetail(options){
    var pid=options.currentTarget.dataset.id;
    wx.redirectTo({
      url: '/pages/skuDetail/skuDetail?product_id='+pid,
    })
  },
  // 去评价
  goToStore(){
    wx.setStorage({
      key: 'payData',
      data: {
        orderId: this.data.orderId,
        backUrl:'/pages/orderDetail/orderDetail',
        isOrder:false
      },
    })
    wx.redirectTo({
      url: '/pages/comment/comment',
    })
  },
  // 立即支付
  payNow(){
    wx.setStorage({
      key: 'payData',
      data: {
        orderId: this.data.orderId
      },
    })
    // 跳转界面
    wx.navigateTo({
      url: '/pages/payOrder/payOrder',
    })
  },
  cancelOrder(){
    wx.redirectTo({
      url: '/pages/cancel/cancel?id=' + this.data.orderId+'&isOrder=false',
    })
  }
})