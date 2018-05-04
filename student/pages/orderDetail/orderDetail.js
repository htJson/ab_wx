var app=getApp();
Page({
  data: {
    detail:{},
    payOrderId:'',
    lat:'',
    lng:'',
    status:{
      arrive:'到达',
      start:'开始',
      done:'结束',    
      leave:'离开'
    },
    addressJson:null,
    over:false,
    noteList:[
      {key:"one",text:'联系不上用户'},
      {key:"tow",text:'客户无法按时赶回'},
      {key:"other",text:'其它'}
    ],
    statusType:'arrive',
    statusText:'到达',
    orderId:'',
    orderStatus:'',
    remark:'',
    textareaRemark:'',
    remarkStatus:''
  },
  onLoad: function (options) {
    this.setData({
      orderStatus: options.orderStatus
    })
    wx.getStorage({
      key: 'orderId',
      success: res=> {
        this.setData({
          orderId:res.data
        })
        var timer = setInterval(() => {
          if (app.globalData.token) {
            clearInterval(timer)
            this.getDetail(res.data)
          }
        }, 100)
      },
    })
  },
  getPhone(options) {
    var phone = options.currentTarget.dataset.phone;
    this.setData({
      phoneNum: phone
    })
    this.calling();
  },
  calling: function () {
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
  selectNote(options){
    var n=options.currentTarget.dataset.notetype;
    if(this.data.remarkStatus ==n){
      this.setData({
        remarkStatus:null
      })
    }else{
      this.setData({
        remarkStatus:n
      })
    }
  },
  getDetail(orderId){
    console.log('请求了')
    this.setData({
      detail:null
    })

    app.req({ "query": 'query{student_show_taskdetail(pay_order_id:"' + orderId + '") {pay_order_id,name,price_total,product_id,cus_username,cus_phone,customer_address,customer_address_id,image_first,remark,c_begin_datetime,num,unit,c_end_datetime,serviceStatus,orderStatus,remarkList{d,remark,operator_name,user_id}}}'}, res => {
      if (res.data.errors && res.data.errors.length > 1) {
        wx.showToast({
          title: '获取详情失败',
        })
      }
      var vData = res.data.data.student_show_taskdetail
      this.setData({
        detail: vData,
        orderStatus: vData.orderStatus,
        statusType: vData.serviceStatus,
        statusText: this.data.status[vData.serviceStatus] || '',
        addressJson: {
          'name': vData.cus_username,
          'phone': vData.cus_phone,
          'address': vData.customer_address,
          'addressId': vData.customer_address_id,
          'pay_order_id': vData.pay_order_id
        }
      })
    })
  },
  otherNote(options){
    var note=options.detail.value;
    this.setData({
      textareaRemark:note
    })
  },
  noSeries(){
    wx.showToast({
      title: '服务开始之后才可续单',
      icon:'none'
    })
  },
  series(options){
    var id=options.target.dataset.productid;
    wx.navigateTo({
      url: '/pages/skuDetail/skuDetail?product_id='+id+'&addressNews='+JSON.stringify(this.data.addressJson),
    })
  },
  getLocation(options){
    var sName = options.currentTarget.dataset.status;
    wx.getSetting({  //获取授权信息
      success: res => {
        if (typeof res.authSetting['scope.userLocation'] == 'undefined'){  //没有授权操作过
          this.getAddress(sName);
        } else if (!res.authSetting['scope.userLocation']){
          // 已经做过拒绝授权
          wx.showModal({
            title: '授权提示',
            content: '"鳌背学院"要获取你的地理位置，是否允许？',
            success:res=>{
              if (res.confirm) {
                this.openSetting(sName);
              }
            }
          })
        }else{
          this.getAddress(sName);
        }
      }
    })
  },
  cancel(options){
    var payOrderId=options.currentTarget.dataset.payid;

    app.req({ "query":'mutation{student_order_cancel(pay_order_id:"' + payOrderId + '"){status}}'}, res => {
      if (res.data.errors && res.data.errors.length > 0) {
        wx.showToast({
          title: '取消失败,请重试',
          icon: 'none'
        })
      } else {
        wx.showToast({
          title: '取消成功',
          icon: 'none',
          success: res => {
            this.getDetail(this.data.orderId)
          }
        })
      }
    })
  },
  openSetting(name){
    wx.openSetting({
      success: res => {
        this.getAddress(name)
      }
    })
  },
  getAddress(name){
    wx.getLocation({ //获取位置
      success:res=> {
        // 获取成功则走这
        this.setData({
          lng:res.longitude,
          lat:res.latitude
        })
        this.submitStatus(name)
      },
      fail(res){
        wx.showToast({
          title: '定位失败，请重新定位',
          icon:'none'
        })
      }
    })
  },

  submitStatus(statusName){
    if (this.data.statusType == 'over'){return false}
    var note = ''
    if(this.data.lng == ''){ //判断是否有定位数据
      this.getLocation()
      return false;
    }
    if (statusName == 'leave') {
      if (this.data.remarkStatus !== 'other') { //获取备注信息
        for (var i = 0; i < this.data.noteList.length; i++) {
          if (this.data.noteList[i].key == this.data.remarkStatus) {
            note = this.data.noteList[i].text;
            break;
          }
        }
      } else {
        note = this.data.textareaRemark
      }
    }
    wx.showLoading({
      title: '请稍后，正在更改状态',
    })

    app.req({"query": 'mutation{student_update_work_status(pay_order_id:"' +this.data.orderId + '",serviceStatus:"' + statusName + '",remark:"' + note + '",lbs_lat:"' + this.data.lat + '",lbs_lng:"' + this.data.lng + '"){serviceStatus,outPostion}}'}, res => {
      wx.hideLoading()
      if (res.data.errors && res.data.errors.length > 0) {
        wx.showToast({
          title: '未获到定位,请稍后再试',
          icon: 'none',
          mask: true
        })
        return false;
      }
      if (res.data.data.student_update_work_status.outPostion == "true") {
        wx.showModal({
          content: '当前位置不在服务范围，请到离服务范围一公里内再打卡',
          title: '提示',
        })
      }
      this.setData({
        statusType: res.data.data.student_update_work_status.serviceStatus,
        statusText: this.data.status[res.data.data.student_update_work_status.serviceStatus]
      })
      if (res.data.data.student_update_work_status.serviceStatus == 'over') {
        wx.switchTab({
          url: '/pages/index/index',
          success: res => {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          }
        })
      }
    })
  }
})