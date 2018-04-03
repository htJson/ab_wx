var app=getApp();
Page({
  data: {
    addressId:'',
    userName:'',
    phone:"",
    address:'',
    time:'2013-09-23 8:00-9:00',
    isAddress:null,
    count:1,
    productId:'',
    productName: '',
    skuId:'',
    skuName: '',
    price: '0',
    allPrice:0,
    couponNews:{},
    couponName:'请选择优惠券',
    time:{},
    couponPrice:0,
    remark:'',
    sumPriceTimer:null
  },

  onLoad: function () {
    wx.getStorage({
      key: 'detail',
      success: res=> {
        this.setData({
          productName: res.data.pName,
          price: res.data.price,
          allPrice: res.data.price,
          skuName: res.data.skuName,
          productId: res.data.productId,
          skuId:res.data.pskuId
        })
      }
    })
    wx.getStorage({
      key: 'time',
      success: res=> {
        res.data.startDate = res.data.date + ' ' + res.data.startTime;
        res.data.endDate = res.data.date + ' ' + res.data.endTime;
        res.data.startTime+='~';
        this.setData({
          time:res.data
        })
      },
    })
    wx.getStorage({
      key: 'coupon',
      success: res=> {
        if(res.data.id!=''){
          this.setData({
            couponNews: res.data,
            couponName:res.data.name
          })
          this.sumPrice();
        }
      },
    })
    if(wx.getStorageSync('selectedAddress')){
      wx.getStorage({
        key: 'selectedAddress',
        success: res => {
          if (res.errMsg == 'getStorage:ok') {
            this.setData({
              isAddress: true,
              userName: res.data.username,
              phone: res.data.phone,
              address: res.data.address + res.data.sub_address,
              addressId: res.data.customer_address_id
            })
          }
        }
      })
    }else{
      this.getDefaultAddress();
    }
  },
  remarkTxt(options){
    var value=options.detail.value;
    this.setData({
      remark:value
    })
  },
  backFn() {
    wx.removeStorageSync('coupon');
    wx.removeStorageSync('time')
    wx.redirectTo({
      url: '/pages/skuDetail/skuDetail?product_id=' + this.data.productId + '&skuId=' + this.data.skuId,
    })
    // wx.navigateBack({
    //   data:1
    // })
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
        "query":'query{customer_get_default_address {customer_address_id,customer_id,username,phone,address,default_address,sub_address}}'
      },
      success:res=>{
        if (res.data.errors && res.data.errors.length > 0 || res.data.data.customer_get_default_address == null){
          this.setData({
            isAddress:false
          })
        } else{
          var ad=res.data.data.customer_get_default_address;
          this.setData({
            isAddress: true,
            userName: ad.username,
            phone: ad.phone,
            address: ad.address + ad.sub_address,
            addressId: ad.customer_address_id
          })
        }
      }
    })
  },  
  goToAddress(){ //跳转到地址列表
    wx.redirectTo({
      url: '/pages/addressList/addressList',
    })
  },
  goToTime(){   //跳转到时间列表
    if (this.data.addressId ==''){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '请先选择服务地址',
      })
      return false;
    }

    wx.setStorage({
      key: 'detail',
      data: {
        pName: this.data.productName,
        price: this.data.price,
        allPrice: this.data.allPrice,
        skuName: this.data.skuName,
        productId: this.data.productId,
        pskuId: this.data.skuId,
        addressId: this.data.addressId
      }
    })
    wx.redirectTo({
      url: '/pages/timeList/timeList',
    })
  },
  goToCoupon(){
    wx.redirectTo({
      url: '/pages/coupon/coupon?skuId='+this.data.skuId,
    })
  },
  countAdd(){
    var w=this.data.count;
    w++
    this.setData({
      count:w
    })
    this.sumPrice()
  },
  countRedut(){
    var n=this.data.count;
    n=n<=1?1:--n;
    this.setData({
      count:n
    })
    this.sumPrice()
  },
  countChange(options){
    if(isNaN(Number(options.detail.value))){return false;}
    if (options.detail.value == '' || options.detail.value ==0){return false;}
    clearInterval(this.data.sumPriceTimer)
    this.data.sumPriceTimer=setInterval(()=>{
      this.setData({
        count: options.detail.value
      })
      this.sumPrice()
    },500)
  },
  sumPrice(){
    // 计算总价格
    wx.request({
      url: app.data.dev,
      method:"POST",
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{"query": 'query{customer_recalculate_price(psku_id:"' + this.data.skuId + '",coupon_receive_id:"' + (this.data.couponNews.id || 0) + '",num:' + this.data.count+')}'
      },
      success:res=>{
        clearInterval(this.data.sumPriceƒTimer)
        this.setData({
          allPrice: res.data.data.customer_recalculate_price
        })
      }
    })
  },
  // goToCoupon(){
  //   wx.navigateTo({
  //     url: '/pages/coupon/coupon',
  //   })
  // },
  submitBtn(){
    if (this.data.addressId == undefined || this.data.addressId == '') {
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '请选择服务地址信息',
      })
      return false;
    }
    if (this.data.time.startDate == undefined && this.data.time.endDate==undefined){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '请选择上门时间',
      })
      return false;
    }
    
    wx.request({
      url: app.data.dev,
      method:'POST',
      data:{
        "query": 'mutation{customer_create_order(order_input:{product_id:"' + this.data.productId + '",psku_id:"' + this.data.skuId + '",begin_datetime:"' +this.data.time.startDate  + '",end_datatime:"' + this.data.time.endDate + '",customer_address_id:"' + this.data.addressId + '",coupon_receive_id:"' + (this.data.couponNews.id || 0) + '",num:' + this.data.count + ',remark:"' + this.data.remark +'"}){pay_order_id,name,uid,price_total,create_datetime,price_discount}}'
      },
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      success:res=>{
        if(res.data.errors && res.data.errors.length>0 || res.data.eror){
          console.log('接口错误')
        }else{
          wx.removeStorageSync('time');
          // wx.removeStorageSync('selectedAddress')
          wx.removeStorageSync('detail')
          wx.removeStorageSync('coupon')
          var vData = res.data.data.customer_create_order;
          // 清除所有cookie
          // 设置支付cookie
          wx.setStorage({
            key: 'payData',
            data: {
              orderId:vData.pay_order_id
            },
          })
          // 跳转界面
          wx.redirectTo({
            url: '/pages/payOrder/payOrder',
          })
        }
      }
    })
  }
})