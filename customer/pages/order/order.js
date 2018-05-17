var app=getApp();
Page({
  data: {
    status:'',
    orderList:[],
    page:1,
    noData:false,
    loading:false,
    isLogin:false,
    isLoadingTrue:false,
    listTimer:null,
    isEmpty:true,
    lengthData:false,
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
    count:10,
    meUrl:''
  },
  onLoad: function (options) {
    this.getInfo()
    this.getList();
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    this.setData({
      meUrl: currentPage.route
    })
  },
  onShow(){
    if(this.data.isLogin){
      this.getInfo();
      this.getList();
    }
  },
  onHide(){
    this.setData({
      isLogin:true,
      isLoadingTrue: false
    })
  },
  tab(options) {
    var key = options.currentTarget.dataset.key; 
    clearInterval(this.data.listTimer)
    if (this.data.status == key || !this.data.isLoadingTrue) { return false }
    this.setData({
      orderList: [],
      page:1,
      isEmpty:true
    })
    this.data.isLoadingTrue = false;
    key = key == 'all' ? '' : key
    this.setData({
      status: key
    })
    this.getList();
  },
  onReachBottom: function () {
      this.setData({
        isEmpty:false
      })
      this.data.page++;
      if (!this.data.lengthData){
        this.getList()
      }
  },
  getList(){
    this.setData({
      loading:true,
      noData:false
    })
    clearInterval(this.data.listTimer)
    this.data.listTimer=setTimeout(()=>{
      app.req({ "query": 'query{customer_order_list(status:"' + this.data.status + '",page_index:' + this.data.page + ',count:' + this.data.count+') {pay_order_id,name,price_pay,orderStatus,serviceStatus,product_id,proSku_id, image_first,c_begin_datetime,isEvaluate}}'},res=>{
        clearInterval(this.data.listTimer)
        this.setData({
          loading: false,
        })
        if (res.data.errors && res.data.errors.length > 0) {
          this.setData({
            noData: true
          })
          return false
        }
        if (res.data.eror) {
          console.log('请求返回出错')
          return false;
        }
        if (res.data.data.customer_order_list.length == 0 ) {
          this.setData({
            lengthData:true,
          })
          if(this.data.isEmpty){
            this.setData({
              noData: true
            })
          }
        }
        if (!this.data.isEmpty) {
          var arr=this.data.orderList;
          arr = arr.concat(res.data.data.customer_order_list);
          this.setData({
            orderList: arr
          })
        }else{
          this.setData({
            orderList: res.data.data.customer_order_list
          })
        }
        this.data.isLoadingTrue = true;
      })
    },700)
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
    app.req({ "query": 'mutation{customer_order_cancel(pay_order_id:"' + id + '",remark_cancel:""){status}}'},res=>{
      if (res.data.data.errors && res.data.data.errors.length > 0 || res.data.error) {
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
        orderList: copyList
      })
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
    var id = options.currentTarget.dataset.orderid,
    url=options.currentTarget.dataset.url;
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
  okOrder(options) {
    var id = options.currentTarget.dataset.orderid;
    app.req({ "query": 'mutation{customer_service_complete(pay_order_id:"' + id + '"){status}}'},res=>{
      if (res.data.erros && res.data.erros.length > 0) {
        wx.showToast({
          title: '确认失败，请重试',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '确认成功',
          icon: 'success',
          success: res => {
            this.getList();
          }
        })
      }
    })
  }
})