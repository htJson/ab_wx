const util = require('../../../../utils/util.js');
let app=getApp();
Page({
  data: {
    detail:{},
    orderId:'',
  },
  onLoad(options) {
    this.setData({
      orderId: options.pay_order_id
    })
    this.getDetail()
  },
  getDetail(){
    app.http('POST', app.data.dev, {
        "query": 'query{partner_order_detail(pay_order_id:"' + this.data.orderId +'") {pay_order_id,name,price_total,num,cus_username,cus_phone,customer_address,image_first,remark,c_begin_datetime,c_end_datetime,orderStatus,student_name,p_reject_remark}}'
      }, res => {
        let errmsg = res.data.errors;
        if (errmsg) {
          wx.showToast({
            title: errmsg[0].message,
            icon: 'none'
          })
          return false
        }
        if (res.statusCode == 401 || res.errors != undefined) {
          wx.showToast({
            title: '未授权',
            icon: 'success',
            duration: 2000
          });
        }
        let time = res.data.data.partner_order_detail.c_end_datetime;
        let st = new Date(res.data.data.partner_order_detail.c_begin_datetime).format("yyyy-MM-dd hh:mm")
        let et = time?new Date(time).format("hh:mm"):''
        this.setData({
          stime:st,
          etime:et,
          detail: res.data.data.partner_order_detail
        })
    })
  },
  makePhoneCall(event) {
    let phone = event.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})