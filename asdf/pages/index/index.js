//index.js
const util = require('../../utils/util.js');
const app = getApp()

Page({
  data: {
    hidden: true,
    compName:'',
    noData: false,
    count: 0,
    percent: 0,
    payedOrder: []
  },
  onLoad(options) {
    this.setData({
      hidden: false
    });
    var timer = setInterval(() => {
      if (app.globalData.token) {
        clearInterval(timer)
        this.loadData()
      }
    }, 500)
  },
  onShow() {
    
  },
  onPullDownRefresh() {
    this.cumulate();
    this.getCompName();
    this.getOrderData();
    wx.stopPullDownRefresh()
  },
  loadData(){
    this.setData({
      hidden: true
    });
    this.cumulate();
    this.getCompName();
    this.getOrderData();
  },
  cumulate() {
    app.http('POST', app.data.dev, {
        'query': 'query{partner_accumulated_orders_month{count,date,daysNum}}'
      }, res => {
        if (res.statusCode == 401 || res.errors != undefined) {
          wx.showToast({
            title: '未授权',
            icon: 'success',
            duration: 2000
          });
        }
        if (res.data.data.partner_accumulated_orders_month == null || res.data.data.partner_accumulated_orders_month.length == 0) {
          return false;
        }
        let count = res.data.data.partner_accumulated_orders_month.count;
        this.setData({
          count: count
        })
    })
  },
  getCompName() {
    app.http('POST', app.data.dev, {
        'query': 'query{partner_bindinfo{name}}'
      }, res => {
        if (res.statusCode == 401 || res.errors != undefined) {
          wx.showToast({
            title: '未授权',
            icon: 'success',
            duration: 2000
          });
        }
        if (res.data.data.partner_bindinfo == null || res.data.data.partner_bindinfo.length == 0) {
          return false;
        }
        let data = res.data.data.partner_bindinfo.name;
        this.setData({
          compName: data
        })
        wx.setNavigationBarTitle({
          title: this.data.compName
        })
    })
  },
  getOrderData() {
    app.http('POST', app.data.dev, {
        'query': 'query{partner_order_list(status:"payed", page_index:1, count:100){pay_order_id,c_begin_datetime,customer_address,name}}'
      }, res => {
        if (res.statusCode == 401 || res.errors != undefined) {
          wx.showToast({
            title: '未授权',
            icon: 'success',
            duration: 2000
          });
        }
        if (res.data.data.partner_order_list == null || res.data.data.partner_order_list.length == 0) {
          this.setData({
            noData: true,
            payedOrder: []
          })
          return false;
        }
        let data = res.data.data.partner_order_list,n = data.length;
        for (let i = 0; i < n; i++) {
          data[i].mydate = new Date(data[i].c_begin_datetime).format("yyyy-MM-dd hh:mm");
        }
        this.setData({
          noData: false,
          payedOrder: data
        })
    })
  },
  //事件处理函数
  bindViewTap(event) {
    let id = event.currentTarget.dataset.id
    wx.navigateTo({
      url: '../view/order/confirm/confirm?pay_order_id='+id,
    })
  },
  changeUrl(event) {
    let url = event.currentTarget.dataset.url
    wx.navigateTo({
      url: url
    })
  }
})
