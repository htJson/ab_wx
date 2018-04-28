var app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    serverNum:'400-0311-333',
    isLogin:false,
    url:{
      phone:'/pages/changePhone/changePhone',
      password:'/pages/setPass/setPass',
      coupon:'/pages/myCoupon/myCoupon',
      address:'/pages/myAddress/myAddress',
      about:'/pages/about/about'
    },
    meUrl:''
  },

  onLoad: function (options) {
    this.getUserNews();
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    this.setData({
      meUrl: currentPage.route
    })
    this.getInfo();
  },
  onShow(){
    if (this.data.isLogin){
      this.getInfo();
      this.getUserNews();
    }
  },
  onHide(){
    this.setData({
      isLogin:true
    })
  },
  phoneCall(){
    wx.makePhoneCall({
      phoneNumber: '4000311333' //仅为示例，并非真实的电话号码
    })
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
                  // url: '/pages/demo/demo',
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
  goToUrl(options){
    var key=options.currentTarget.dataset.key;
    var path=this.data.url[key];
    wx.navigateTo({
      url:path,
    })
  },
  getUserNews(){
    wx.request({
      method:'POST',
      url: app.data.dev,
      data:{
        "query":'query{customer_info{phone}}'
      },
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      success:res=>{
        if(res.data.errors && res.data.errors.length>0){
          return ;
        }
        if(res.data.error){
          return ;
        }
        this.setData({
          phone: res.data.data.customer_info.phone
        })
        wx.setStorage({
          key: 'phoneNum',
          data: res.data.data.customer_info.phone,
        })
      }
    })
  }
})