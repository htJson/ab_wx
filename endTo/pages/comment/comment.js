var app=getApp();
Page({
  data: {
    start:5,
    score:0,
    remark:'',
    backUrl:'',
    orderId:'',
    isOrder:null,
    detail:null
  },
  onLoad: function (options) {
    wx.getStorage({
      key: 'payData',
      success:res=>{
        this.setData({
          orderId:res.data.orderId,
          backUrl:res.data.backUrl,
          isOrder:res.data.isOrder
        })
        this.getProduct(res.data.orderId)
      },
    })
  },
  backFn() {
    wx.removeStorageSync('payData')
    if(this.data.isOrder){
      wx.switchTab({
        url: this.data.backUrl,
      })
    }else{
      wx.redirectTo({
        url: this.data.backUrl+'?id='+this.data.orderId,
      })
    }
  },
  scoreFn(options){
    var index=options.currentTarget.dataset.index;
    this.setData({
      score:index
    })
  },
  getRemark(options){
    var val=options.detail.value;
    this.setData({
      remark:val
    })
  },
  getProduct(orderId){
    wx.request({
      url: app.data.dev,
      method: "POST",
      data: {
        "query": 'query{customer_order_detail(pay_order_id:"' + orderId + '") {pay_order_id,name,price_total,price_discount,price_pay,orderStatus,cus_username,cus_phone,customer_address,customer_address_id,image_first,product_id,c_begin_datetime,isEvaluate}}'
      },
      header: {
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      success: res => {
        this.setData({
          detail: res.data.data.customer_order_detail
        })
      }
    })
  },
  subScore(){
    if (this.data.score==0){
      wx.showModal({
        title: '提示',
        content: '评分不能为0，请评分',
      })
      return false;
    }
    if(this.data.remark == ''){
      wx.showModal({
        title: '提示',
        content: '评价内容不能为空',
      })
      return false;
    } else if (this.data.remark.length>200){
      wx.showModal({
        title: '提示',
        content: '评价内容不能超过200字',
      })
      return false;
    }
    wx.request({
      url: app.data.dev,
      method:'POST',
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        "query":'mutation{customer_service_evaluate(pay_order_id:"'+this.data.orderId+'",score:'+this.data.score+',comment:"'+this.data.remark+'"){status}}'
      },
      success:res=>{
        if(res.data.errors && res.data.errors.length>0 || res.data.error){
          wx.showModal({
            title: '提示',
            content: '评价失败',
          })
        }else{
          wx.showToast({
            title: '评价成功',
            duration:3000,
            success:res=>{
              this.backFn();
            }
          })
        }
      }
    })
  }
})