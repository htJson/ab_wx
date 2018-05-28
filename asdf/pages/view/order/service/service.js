const util = require('../../../../utils/util.js');
let app=getApp();
Page({
  data: {
    detail:{},
    servicepeople:[],
    statusText:'修改',
    orderId:'',
    selected:[],
    selectedCount:0,
    student_id:''
  },
  onLoad(options) {
    this.setData({
      orderId: options.pay_order_id
    })
    this.getDetail()
    this.getPeople()
  },
  selectChange(event){
    this.setData({
      selected: event.detail.value
    })
  },
  getPeople() {
    app.http('POST', app.data.dev, {
        "query": 'query{partner_find_available_student(pay_order_id:"' + this.data.orderId + '") {type,student{name, student_id}}}'
      }, res => {  
        if (res.statusCode == 401 || res.errors != undefined) {
          wx.showToast({
            title: '未授权',
            icon: 'success',
            duration: 2000
          });
        }
        if (res.data.data.partner_find_available_student.length == 0 || res.data.data.partner_find_available_student == null) {
          return false;
        }
        this.setData({
          servicepeople: res.data.data.partner_find_available_student
        })
    })
  },
  getDetail(){
    app.http('POST', app.data.dev, {
        "query": 'query{partner_order_detail(pay_order_id:"' + this.data.orderId +'") {pay_order_id,student_id,name,price_total,num,buy_multiple_o2o,cus_username,cus_phone,customer_address,image_first,remark,c_begin_datetime,c_end_datetime,orderStatus,student_name}}'
      }, res => {
        let time = res.data.data.partner_order_detail.c_end_datetime;
        let st = new Date(res.data.data.partner_order_detail.c_begin_datetime).format("yyyy-MM-dd hh:mm")
        let et = time?new Date(time).format("hh:mm"):''
        this.setData({
          student_id:res.data.data.partner_order_detail.student_id,
          selectedCount:res.data.data.partner_order_detail.student_id,
          stime:st,
          etime:et,
          detail: res.data.data.partner_order_detail
        })
    })
  },
  submitStatus(options) {
    if (this.data.servicepeople == null) {
      wx.showToast({
        title: '暂无其他服务人员',
        icon: 'none'
      })
      return false;
    }
    let num = this.data.detail.num;
    if (this.data.detail.buy_multiple_o2o == 0){
        num = 1
    }
    if (this.data.selected.length !== 0 && this.data.selected.length !== num ){
      wx.showToast({
        title: '请选择'+num+'个服务人员',
        icon: 'none'
      })
      return false;
    }else if(this.data.selected.length === 0){
      wx.showToast({
        title: '请选择服务人员',
        icon: 'none'
      })
      return false;
    }else{}
    app.http('POST', app.data.dev, {
        "query": 'mutation{partner_alter_order(pay_order_id:"' + this.data.orderId + '",student_id:' + JSON.stringify(this.data.selected) + '){status}}'
      }, res => {
        let errmsg = res.data.errors;
        if (errmsg) {
          wx.showToast({
            title: errmsg[0].message,
            icon: 'none'
          })
          this.setData({
            servicepeople: this.data.servicepeople
          })
          return false
        }
        if (res.data.data.partner_alter_order.status == 0){
          wx.showToast({
            title: '修改成功',
          })
        }
    })
  },
  makePhoneCall(event) {
    let phone = event.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})