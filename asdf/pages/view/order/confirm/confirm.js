const util = require('../../../../utils/util.js');
const app=getApp();
Page({
  data: {
    detail:{},
    servicepeople: null,
    noteList:[
      { value: "服务人员身体不适", text:'服务人员身体不适'},
      { value: "没有服务人员", text:'没有服务人员'},
      { value: "0", text:'其他'}
    ],
    statusType:true,
    statusText:'接单',
    statusText1:'拒单',
    orderId:'',
    remark:'',
    textareaRemark:'',
    selected:'',
    selected1: '',
    editarea:false,
    flag:false
  },
  onLoad(options) {
    this.setData({
      orderId: options.pay_order_id,
      v: options.v == 'reject'?true:false
    })
    this.getDetail()
    this.getPeople()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    let pages = getCurrentPages();
    
    let currPage = pages[pages.length - 1];
    let indexPage = pages[0];
    let data = indexPage.data.payedOrder;
    for (let i = 0,len = data.length;i < len; i++){
        if(this.data.orderId == data[i].pay_order_id && this.data.flag){
            data.splice(i,1)
        }
    }
    indexPage.setData({
        payedOrder:data
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  selectChange(event) {
    this.setData({
      selected: event.detail.value
    })
  },
  selectChange1(event) {
    this.setData({
      selected1: event.detail.value
    })
    if (this.data.selected1 == '0') {
      this.setData({
        editarea:true
      })
    }else{
      this.setData({
        editarea:false,
        textareaRemark:''
      })
    }
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
        if (res.data.data.partner_find_available_student == null || res.data.data.partner_find_available_student.length == 0) {
          return false;
        }
        this.setData({
          servicepeople: res.data.data.partner_find_available_student
        })
    })
  },
  getDetail(){
    app.http('POST', app.data.dev, {
        "query": 'query{partner_order_detail(pay_order_id:"' + this.data.orderId +'") {pay_order_id,name,price_total,num,buy_multiple_o2o,cus_username,cus_phone,customer_address,image_first,remark,c_begin_datetime,c_end_datetime,orderStatus,student_name}}'
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
  otherNote(options){
    let note=options.detail.value;
    this.setData({
      selected1:note
    })
  },
  receiveOrder(options){
    if (this.data.selected == '') {
      wx.showToast({
        title: '请选择服务人员',
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
        "query": 'mutation{partner_confirm_order(pay_order_id:"' + this.data.orderId + '",student_id:' + JSON.stringify(this.data.selected) + '){status}}'
      }, res => {
        let errmsg = res.data.errors;
        if (errmsg) {
          wx.showToast({
            title: errmsg[0].message,
            icon: 'none'
          })
          return false
        }
        this.setData({
          flag:true
        })
        if (res.data.data.partner_confirm_order.status == 0) {
          wx.showToast({
            title: '修改成功',
          })
        }
        setTimeout(()=>{
          wx.switchTab({
            url: "/pages/index/index"
          })
        },500);
    })
  },
  jdhandle(){
    this.setData({
      statusType:false
    })
  },
  hidejd(){
    this.setData({
      statusType:true
    })
  },
  refuseOrder() {
    if (this.data.selected1 == '' || this.data.selected1 == '0') {
      wx.showToast({
        title: '拒单原因必须填写！',
        icon: 'none'
      })
      return false;
    }
    
    let str = this.data.selected1;
    app.http('POST', app.data.dev, {
        "query": 'mutation{partner_refused_order(pay_order_id:"' + this.data.orderId + '",orderStr:"' + str + '"){status}}'
      }, res => {
        let errmsg = res.data.errors;
        if (errmsg) {
          wx.showToast({
            title: errmsg[0].message,
            icon: 'none'
          })
          return false
        }
        this.setData({
          flag:true
        })
        if (res.data.data.partner_refused_order.status == 0) {
          wx.showToast({
            title: '拒单成功',
          })
        }
        setTimeout(()=>{
          wx.switchTab({
            url: "/pages/index/index"
          })
        },500);
    })
  },
  makePhoneCall(event) {
    let phone = event.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})