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
    listTimer:null,
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
    meUrl:'',
    count:10
  },
  onLoad: function (options) {
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
      this.setData({
        page:1,
        orderList:[]
      })
    }
  },
  onHide(){
    this.setData({
      isLogin:true
    })
  },
  onReachBottom: function () {
    this.setData({
      isEmpty: false
    })
    this.data.page++;
    this.getList()
  },
  getList(){
    this.setData({
      loading:true,
      noData:false
    })
    clearInterval(this.data.listTimer)
    this.data.listTimer=setTimeout(()=>{
      app.req({ "query": 'query{student_order_list(status:"' + this.data.status + '",page_index:' + this.data.page + ',count:'+this.data.count+') {pay_order_id,name,price_pay,orderStatus,serviceStatus,product_id,proSku_id, image_first,c_begin_datetime,isEvaluate}}'}, res => {
        this.setData({
          loading: false
        })
        console.log(res.data.errors && res.data.errors.length > 0 && this.data.orderList.length,'======')
        if (res.data.errors && res.data.errors.length > 0 && this.data.orderList.length == 0) {
          this.setData({
            noData: true
          })
        }
        if (res.data.data.student_order_list.length == 0 && this.data.orderList.length == 0) {
          this.setData({
            noData: true
          })
        }
        this.data.isLoadingTrue = true;
        if (res.data.data.student_order_list==null){ return false;}
        this.setData({
          orderList: this.data.orderList.concat(res.data.data.student_order_list)
        })
      })
    }, 700)
  },
  onHide(){
    this.setData({
      isLogin:true,
      isLoadingTrue:false
    })
  },
  tab(options){
    console.log('tab')
    var key=options.currentTarget.dataset.key;
    clearInterval(this.data.listTimer)
    console.log(this.data.status,'=====',this.data.isLoadingTrue)
    if (this.data.status == key || !this.data.isLoadingTrue){return false}
    this.setData({
      orderList:[],
      page:1
    })
    this.data.isLoadingTrue=false;
    key=key =='all'?'':key
    this.setData({
      status:key
    })
    this.getList();
  },

  getInfo() { //判断是否登录
    app.req({ "query": 'query{my_student_bindinfo{phone,name}}' }, res => {
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
        this.getList();
        this.setData({
          isLogin: true
        })
      }
    })
  },
  
  cancelOrder(id){  //取消订单    暂不用
    app.req({ "query": 'mutation{customer_order_cancel(pay_order_id:"' + id +'",remark_cancel:""){status}}' }, res => {
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
    wx.setStorage({
      key: 'orderId',
      data: id,
    })
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?orderStatus=' + options.currentTarget.dataset.orderstatus,
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
    app.req({ "query": 'mutation{customer_service_complete(pay_order_id:"' + this.data.orderId + '"){status}}' }, res => {
      if (res.data.errors && res.data.errors.length > 0) {
        wx.showToast({
          title: '确认失败',
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