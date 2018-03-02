var app=getApp();
Page({
  data: {
    productName:'',
    price:'0',
    userName:'张三',
    phone:"13211111111",
    address:'北京市朝阳区四惠家园2号楼1129',
    time:'2013-09-23 8:00-9:00',
    isAddress:null,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      productName: options.pName,
      price: options.price,
      allPrice:options.price
    })
    this.getDefaultAddress();
  },
  getDefaultAddress(){
    wx.request({
      url: app.data.dev,
      method:'POST',
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        "query":'query{customer_get_default_address {customer_address_id,customer_id,username,phone,address}}'
      },
      success:res=>{
        if (res.data.errors||res.data.errors.length >0){
          this.setData({
            isAddress:false
          })
        }
        console.log(res.data.data.customer_get_default_address,'=====')
      }
    })
  },  
  goToAddress(){
    wx.navigateTo({
      url: '/pages/addressList/addressList',
    })
  },
  goToTime(){
    wx.navigateTo({
      url: '/pages/timeList/timeList',
    })
  }

})