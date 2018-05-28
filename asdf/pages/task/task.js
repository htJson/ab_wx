// pages/task/task.js
const util = require('../../utils/util.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    noData: false,
    hidden: true,
    reqFlag:true,
    page_index: 1,
    count: 100,
    scrollTop: 0,
    scrollHeight: 0,
    dateTime:'请选择查询时间',
    dateTimetxt:'',
    date:'',
    startm:3,
    count1:0,
    isCalendarPickerShow: false,
    tasklist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    let curd = new Date();
    this.setData({
      count1:curd.getMonth() - this.data.startm + 1,
      dateTime: new Date(curd).format("yyyy-MM-dd"),
      dateTimetxt: new Date(curd).format("yyyy年MM月dd日"),
      date: new Date(curd).format("yyyy-MM-dd")
    })
    wx.getSystemInfo({
      success: res => {
        this.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
    this.getData();
  },
  toDetail(options) {
    let id = options.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../employee/employee?student_id=' + options.currentTarget.dataset.id
    })
  },
  getData() {
    this.setData({
      hidden: false
    });
    app.http('POST', app.data.dev, {
        'query': 'query{partner_mission_is_scheduled_info(page_index:' + this.data.page_index + ',count:' + this.data.count + ',dateValue:"' + this.data.dateTime + '"){student{name, phone },orderList{pay_order_id, name, orderStatus, c_begin_datetime, customer_address }}}'
      }, res => {
        this.setData({
          hidden: true
        });
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
        
        let data = res.data.data.partner_mission_is_scheduled_info;
        if (data == null || data.length == 0) {
          this.setData({
            noData: true
          })
          return false;
        }
        let list = this.data.tasklist;
        let flag = true;
        for (let i = 0; i < data.length; i++) {
          list.push(data[i]);
        }
        for (let i = 0; i < list.length; i++) {
          if (list[i].orderList.length !== 0) {
            flag = false
          }
          for (let j = 0; j < list[i].orderList.length; j++) {
            list[i].orderList[j].mydate = new Date(list[i].orderList[j].c_begin_datetime).format("yyyy-MM-dd hh:mm");
          }
        }
        this.setData({
          tasklist: data,
          noData: flag,
          hidden: true
        });
    })
  },
  bindViewTap(event) {
    let id = event.currentTarget.dataset.id
    let status = event.currentTarget.dataset.status
    switch (status) {
      case 'waitService':
        wx.navigateTo({
          url: '/pages/view/order/service/service?pay_order_id=' + id,
        })
        break;
      case 'done':
        wx.navigateTo({
          url: '/pages/view/order/complete/complete?pay_order_id=' + id,
        })
        break;
      default:

    };
  },
  showCalendarPicker() {
    this.setData({
      isCalendarPickerShow: true
    })
  },
  onChangeDate(event) {
    this.setData({
      tasklist:[],
      dateTime: event.detail.currentDate,
      dateTimetxt: new Date(event.detail.currentDate).format("yyyy年MM月dd日"),
      isCalendarPickerShow:false
    });
    this.getData();
  },
  makePhoneCall(event) {
    var phone = event.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  }
})