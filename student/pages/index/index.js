var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    student:{},
    phoneNum:'',
    taskList:[],
    noData:false,
    loading:false
  },
  onLoad: function (options) {
    var timer=setInterval(()=>{
      if (app.globalData.token) {
        clearInterval(timer)
        this.getStudentNews();
        this.getTaskList();
      }
    },100)
  },
  onPullDownRefresh(){
    wx.showNavigationBarLoading()
    this.getTaskList();
  },
  goToDetail(options) {
    var orderId = options.currentTarget.dataset.orderid;
    var orderStatus=options.currentTarget.dataset.orderstatus;
    wx.setStorage({
      key: 'orderId',
      data: orderId,
    })
    wx.navigateTo({
      url: '/pages/orderDetail/orderDetail?orderStatus='+orderStatus
    })
  },
  getStudentNews(){
    this.setData({
      loading:true
    })
    wx.request({
      url: app.data.dev,
      method:'POST',
      data:{
        "query":'query{my_student_bindinfo{name,phone}}'
      },
      header:{
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        if (res.data.data.errors || res.data.error || res.data.data.my_student_bindinfo&&res.data.data.my_student_bindinfo.length ==0){
          this.setData({
            noData:true
          })
        }else{
          this.setData({
            student: res.data.data.my_student_bindinfo
          })
        }
      }
    })
  },
  getPhone(options){
    var phone=options.currentTarget.dataset.phone;
    this.setData({
      phoneNum:phone
    })
    this.calling();
  },
  calling: function() {
    wx.makePhoneCall({
      phoneNumber: this.data.phoneNum, //此号码并非真实电话号码，仅用于测试  
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  getTaskList(){
    this.setData({
      loading: true,
      noData:false,
      taskList: []
    })
    wx.request({
      url: app.data.dev,
      method:'POST',
      header:{
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      data:{
        "query":'query{student_undone_orderinfo(page_index:1,count:10000){pay_order_id,cus_username,cus_phone,customer_address,product_id,proSku_id,c_begin_datetime,c_end_datetime,name,serviceStatus,orderStatus}}'
      },
      success:res=>{
        wx.hideNavigationBarLoading()
        wx.stopPullDownRefresh()
        this.setData({
          loading: false
        })
        
        if (res.data.data.errors || res.data.error || res.data.data.student_undone_orderinfo==null ||res.data.data.student_undone_orderinfo.length == 0) {
          this.setData({
            noData: true,
            taskList:[]
          })
        } else {
          this.setData({
            taskList: res.data.data.student_undone_orderinfo
          })
        }
     
      }
    })
  }
})