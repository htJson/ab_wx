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
    over:false,
    noteList:[
      {key:"one",text:'联系不上用户'},
      {key:"tow",text:'客户无法按时赶回'},
      {key:"other",text:'其它'}
    ],
    statusType:'arrive',
    statusText:'到达',
    orderId:'',
    remark:'',
    textareaRemark:'',
    remarkStatus:''
  },
  onLoad: function (options) {
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
    this.setData({
      remarkStatus:n
    })
  },
  getDetail(orderId){
    wx.request({
      url: app.data.dev,
      method:'POST',
      data:{
        "query": 'query{student_show_taskdetail(pay_order_id:"' + orderId +'") {pay_order_id,name,price_total,cus_username,cus_phone,customer_address,image_first,remark,c_begin_datetime,c_end_datetime,serviceStatus,remarkList{d,remark,operator_name,user_id}}}'
      },
      header:{
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          detail: res.data.data.student_show_taskdetail
        })
      }
    })
  },
  otherNote(options){
    var note=options.detail.value;
    this.setData({
      textareaRemark:note
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
    if (statusName =='leave'&& note == '' ){ //如果没有选择或是填写备注则
      wx.showToast({
        title: '请选择或输入备注信息',
      })
      return false;
    }
    wx.request({
      url: app.data.dev,
      method:'POST',
      data:{
        // "query": 'mutation{student_update_work_status(pay_order_id:"' + this.data.orderId + '",serviceStatus:"' + statusName + '",remark:"' + note + '",lbs_lat:"' + this.data.lat + '",lbs_lng:"' + this.data.lng + '"){serviceStatus,outPostion}}'
        "query": 'mutation{student_update_work_status(pay_order_id:"' + this.data.orderId + '",serviceStatus:"' + statusName + '",remark:"' + note + '",lbs_lat:"39.78218",lbs_lng:"116.56695"){serviceStatus,outPostion}}'
      },
      header:{
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        if (res.data.data.student_update_work_status.outPostion == "true"){
          wx.showModal({
            content: '当前位置不在服务范围，请到离服务范围一公里内再打卡',
            title: '提示',
          })
        }
        this.setData({
          statusType: res.data.data.student_update_work_status.serviceStatus,
          statusText: this.data.status[res.data.data.student_update_work_status.serviceStatus]
        })
        if (res.data.data.student_update_work_status.serviceStatus == 'over'){
          wx.switchTab({
            url: '/pages/index/index',
            success:res=>{

              var page = getCurrentPages().pop();
              if (page == undefined || page == null) return;
                page.onLoad();
              }

          })
        }
      }
    })
  }
})