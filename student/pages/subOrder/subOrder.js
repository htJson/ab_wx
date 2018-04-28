var app=getApp();
Page({
  data: {
    addressId:'',
    time:'2013-09-23 8:00-9:00',
    isAddress:null,
    count:1,
    productId:'',
    productName: '',
    skuId:'',
    skuName: '',
    price: '0',
    allPrice:0,
    selectedTime:0,
    couponNews:{},
    couponName:'请选择优惠券',
    time:{},
    couponPrice:0,
    remark:'',
    oldOrderId:'',
    serverPrice:'',
    term:null,
    sumPriceTimer:null,
    unit:'',
    addressJson:null
  },

  onLoad: function (options) {
    wx.getStorage({
      key: 'detail',
      success: res=> {
        this.setData({
          productName: res.data.pName,
          price: res.data.price,
          allPrice: res.data.price,
          skuName: res.data.skuName,
          productId: res.data.productId,
          skuId:res.data.pskuId,
          remark:res.data.remark||'',
          term:res.data.term,
          unit:res.data.unit,
          selectedTime: res.data.selectedTime||0,
          addressJson:JSON.parse(res.data.addressNews),
          addressId: JSON.parse(res.data.addressNews).addressId,
          oldOrderId: JSON.parse(res.data.addressNews).pay_order_id
        })

        if(res.data.count){
          this.setData({
            count: res.data.count,
            allPrice: res.data.count * res.data.price,
            serverPrice: res.data.count * res.data.price,
          })
        } else if (res.data.term.buy_multiple == 0){
            this.setData({
              count: 1,
              allPrice: res.data.price,
              serverPrice: res.data.price,
            })
        }else{
          this.setData({
            allPrice: res.data.term.buy_multiple_min * res.data.price,
            count: res.data.term.buy_multiple_min,
            serverPrice: res.data.term.buy_multiple_min * res.data.price,
          })
        }
        console.log(this.data.count)
      }
    })
    wx.getStorage({
      key: 'time',
      success: res=> {
        res.data.startDate = res.data.date + ' ' + res.data.startTime;
        res.data.endDate = res.data.date + ' ' + res.data.endTime;
        res.data.showTime = res.data.endTime == null ? res.data.date + ' ' + res.data.startTime : res.data.date + ' ' + res.data.startTime +'~' +res.data.endTime;

        this.setData({
          time:res.data
        })
      },
    })
    // wx.getStorage({
    //   key: 'coupon',
    //   success: res=> {
    //     if(res.data.id!=''){
    //       this.setData({
    //         couponNews: res.data,
    //         couponName:res.data.name
    //       })
    //       this.sumPrice();
    //     }
    //   },
    // })
    // if(wx.getStorageSync('selectedAddress')){
    //   wx.getStorage({
    //     key: 'selectedAddress',
    //     success: res => {
    //       if (res.errMsg == 'getStorage:ok') {
    //         this.setData({
    //           isAddress: true,
    //           userName: res.data.username,
    //           phone: res.data.phone,
    //           address: res.data.address + res.data.sub_address,
    //           addressId: res.data.customer_address_id
    //         })
    //       }
    //     }
    //   })
    // }else{
    //   this.getDefaultAddress();
    // }
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
  // getDefaultAddress(){
  //   wx.request({
  //     url: app.data.dev,
  //     method:'POST',
  //     header:{
  //       "content-type": "application/json",
  //       "Authorization": app.globalData.token
  //     },
  //     data:{
  //       "query":'query{customer_get_default_address {customer_address_id,customer_id,username,phone,address,default_address,sub_address}}'
  //     },
  //     success:res=>{
  //       if (res.data.errors && res.data.errors.length > 0 || res.data.data.customer_get_default_address == null){
  //         this.setData({
  //           isAddress:false
  //         })
  //       } else{
  //         var ad=res.data.data.customer_get_default_address;
  //         this.setData({
  //           isAddress: true,
  //           userName: ad.username,
  //           phone: ad.phone,
  //           address: ad.address + ad.sub_address,
  //           addressId: ad.customer_address_id
  //         })
  //       }
  //     }
  //   })
  // },  
  goToAddress(){ //跳转到地址列表
    this.setStorageDetail();
    wx.redirectTo({
      url: '/pages/addressList/addressList',
    })
  },
  goToTime(options){   //跳转到时间列表
    var index = options.currentTarget.dataset.index;
    this.setData({
      selectedTime:index
    })
    if(index == '0'){return false;}
    this.setStorageDetail();
    wx.navigateTo({
      url: '/pages/timeList/timeList',
    })
  },
  setStorageDetail(){
    wx.setStorage({
      key: 'detail',
      data: {
        pName: this.data.productName,
        price: this.data.price,
        // allPrice: this.data.allPrice,
        skuName: this.data.skuName,
        productId: this.data.productId,
        pskuId: this.data.skuId,
        remark: this.data.remark,
        addressId: this.data.addressId,
        term:this.data.term,
        unit:this.data.unit,
        selectedTime:this.data.selectedTime,
        count:this.data.count,
        addressNews:JSON.stringify(this.data.addressJson)
      }
    })
  },
  goToCoupon(){
    wx.redirectTo({
      url: '/pages/coupon/coupon?skuId='+this.data.skuId,
    })
  },
  countAdd(){   //数量加法
    var w=this.data.count;
    if(this.data.term.buy_multiple_max == 0){  //最大值为0时表示没有最大值可以任意加
      w++
    }else{
      if (w == this.data.term.buy_multiple_max){ //如果不为0时则要判断是否到最大值了
        w = this.data.term.buy_multiple_max;
        wx.showToast({
          title: '最大为' + this.data.term.buy_multiple_max + this.data.unit,
        })
        return false;
      }else{
        w++
      }
    }
    if (this.data.term.buy_multiple_o2o == 1) { //
      wx.removeStorage({
        key: 'time',
        success: function (res) { },
      })
      this.setData({
        time: {}
      })
    }
    this.setData({
      count:w
    })
    this.sumPrice()
  },
  countRedut(){  //数量减法
    var n=this.data.count;
    if (n <= this.data.term.buy_multiple_min){
      n = this.data.term.buy_multiple_min
      wx.showToast({
        title: '最小为'+this.data.term.buy_multiple_min+this.data.unit,
      })
      return false;
    }else{
      n--
    }
    this.setData({
      count:n
    })
    if (this.data.term.buy_multiple_o2o == 1) {
      this.setData({
        time: {}
      })
      wx.removeStorage({
        key: 'time',
        success: function (res) { },
      })
    }
    this.sumPrice()
  },
  countChange(options){
    if(isNaN(Number(options.detail.value))){return false;}
    if (options.detail.value == '' || options.detail.value ==0){return false;}
    clearInterval(this.data.sumPriceTimer)
    if (this.data.term.buy_multiple_max != 0) {
      if (options.detail.value >= this.data.term.buy_multiple_max) {
        options.detail.value = this.data.term.buy_multiple_max
        wx.showToast({
          title: '最大为' + this.data.term.buy_multiple_max + this.data.unit,
        })
      } else if (options.detail.value <= this.data.term.buy_multiple_min) {
        options.detail.value = this.data.term.buy_multiple_min
        wx.showToast({
          title: '最小为' + this.data.term.buy_multiple_min + this.data.unit,
        })
      }
    }
    if (this.data.term.buy_multiple_o2o == 1){
      this.setData({
        time:{}
      })
      wx.removeStorage({
        key: 'time',
        success: function(res) {},
      })
    }

    this.data.sumPriceTimer=setInterval(()=>{
      this.setData({
        count: parseInt(options.detail.value)
      })
      this.sumPrice()
    },500)
  },
  sumPrice(){
    // 计算总价格
    this.setData({
      serverPrice: this.data.count * this.data.price
    })
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
        clearInterval(this.data.sumPriceTimer)
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
    if (this.data.time.startDate == undefined && this.data.selectedTime !=0){
      wx.showModal({
        title: '提示',
        showCancel:false,
        content: '请选择上门时间',
      })
      return false;
    }
    if(this.data.selectedTime ==0){
        this.data.time.endDate="";
        this.data.time.startDate=""
    }
    wx.request({
      url: app.data.dev,
      method:'POST',
      data:{
        "query": 'mutation{student_create_order(student_order_input:{pay_order_id:"' + this.data.oldOrderId + '"product_id:"' + this.data.productId + '",psku_id:"' + this.data.skuId + '",begin_datetime:"' + this.data.time.startDate + '",end_datatime:"' + this.data.time.endDate + '",customer_address_id:"' + this.data.addressId + '",num:' + this.data.count + ',remark:"' + this.data.remark + '",type:' + this.data.selectedTime+'}){pay_order_id,name,uid,price_total,create_datetime,price_discount}}'
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
          var vData = res.data.data.student_create_order;
          // 清除所有cookie
          // 设置支付cookie
          wx.setStorage({
            key: 'payData',
            data: {
              orderId:vData.pay_order_id
            },
          })
          // 跳转界面
          wx.switchTab({
            url: '/pages/studentOrder/studentOrder',
          })
        }
      }
    })
  }
})