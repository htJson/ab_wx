var app=getApp();
Page({
  data: {
    status:'',
    orderList:[],
    page:1,
    noData:false,
    loading:false,
    isLogin:false,
    isLoadingTrue:true,
    statusList:{
      'waitService':'待服务',
      'cancel':'已取消',
      'waitPay':'待付款',
      'payed':'已支付',
      'done':'已完成',
      'refused':'已拒单',
      'waitRefund':'待退款',
      'partRefund':'已部分退款',
      'refunded':'已退款'
    },
    meUrl:''
  },
  onLoad: function (options) {
    this.getList();
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    this.setData({
      meUrl: currentPage.route
    })
    this.getInfo()
  },
  onShow(){
    if(this.data.isLogin){
      this.getInfo();
      this.getList();
    }
  },
  onHide(){
    this.setData({
      isLogin:true
    })
  },
  getList(){
    this.setData({
      orderList:[],
      loading:true,
      noData:false
    })
    wx.request({
      url: app.data.dev,
      method:'POST',
      data:{
        "query": 'query{customer_order_list(status:"' + this.data.status + '",page_index:' + this.data.page +',count:10000) {pay_order_id,name,price_pay,orderStatus,serviceStatus,product_id,proSku_id, image_first,c_begin_datetime,isEvaluate}}'
      },
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      success:res=>{
          this.setData({
            loading:false
          })
          if(res.data.errors && res.data.errors.length>0){
            this.setData({
              noData: true
            })
            return false
          }
          if(res.data.eror){
            console.log('请求返回出错')
            return false;
          }
          if (res.data.data.customer_order_list.length == 0){
            this.setData({
              noData: true
            })
          }
            this.data.isLoadingTrue=true;
            this.setData({
              orderList: res.data.data.customer_order_list
            })
          
      }
    })
  },
  tab(options){
    var key=options.currentTarget.dataset.key;
    if (this.data.status == key || !this.data.isLoadingTrue){return false}
    this.data.isLoadingTrue=false;
    key=key =='all'?'':key
    this.setData({
      status:key
    })
    this.getList();
  },
  getInfo() {
    wx.request({
      url: app.data.dev,
      method: "POST",
      header: {
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data: {
        "query": 'query{customer_info{customer_id}}'
      },
      success: res => {
        if (res.data.errors && res.data.errors.length > 0) {
          wx.showModal({
            title: '用户提示',
            content: '请先登录',
            showCancel: false,
            confirmColor: '#00a0e9',
            success: res => {
              if (res.confirm) {
                wx.redirectTo({
                  url: '/pages/login/login?url=' + this.data.meUrl,
                })
              }
            }
          })
        } else {
          this.setData({
            isLogin: true
          })
        }
      }
    })
  },
  
  cancelOrder(id){
    wx.request({
      url: app.data.dev,
      method:'POST',
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        "query":'mutation{customer_order_cancel(pay_order_id:"'+id+'",remark_cancel:""){status}}'
      },
      success:res=>{
        if(res.data.data.errors && res.data.data.errors.length>0 || res.data.error){
          console.log('删除失败')
          return false; 
        }
        var copyList = this.data.orderList
        for (let i = 0; i < copyList.length; i++) {
          var item = copyList[i].pay_order_id;
          if (item == id) {
            copyList.splice(i, 1)
            break;
          }
        }
        this.setData({
          orderList:copyList
        })
      }
    })
  },
  goToDetail(options){
    var id=options.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?id='+id,
    })
  },
  payNow(options){
    var id=options.currentTarget.dataset.orderid
    wx.setStorage({
      key: 'payData',
      data: {
        orderId: id
      },
    })
    // 跳转界面
    wx.navigateTo({
      url: '/pages/payOrder/payOrder',
    })
  },
  goToUrl(options){
    var id = options.currentTarget.dataset.orderid,url=options.currentTarget.dataset.url;
    wx.setStorage({
      key: 'payData',
      data: {
        orderId: id,
        backUrl:'/pages/order/order',
        isOrder:true
      },
    })
    // 跳转界面
    wx.redirectTo({
      url: url+'?isOrder=true',
    })
  },
  okOrder() {
    wx.request({
      url: app.data.dev,
      method: "POST",
      data: {
        "query": 'mutation{customer_service_complete(pay_order_id:"' + this.data.orderId + '"){status}}'
      },
      header: {
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      success: res => {
        console.log(res, '=====')
      }
    })
  }
})