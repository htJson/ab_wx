const util = require('../../../../utils/util.js');
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    noData: false,
    page_index: 1,
    count: 100,
    orderList: [],
    scrollTop: 0,
    scrollHeight: 0,
    hidden: true,
    reqFlag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          scrollHeight: res.windowHeight
        });
      }
    });
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},


  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.getList();
  },


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.getList();
    wx.stopPullDownRefresh()
  },


  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
  getList() {
    this.setData({
      page_index: 1,
      orderList: [],
      hidden: true,
      reqFlag: true
    })
    app.http('POST', app.data.dev, {
        'query': 'query{partner_robbing_list(page_index:' + this.data.page_index + ',count:' + this.data.count + '){pay_order_id,image_first,orderStatus,name,price_total,num,c_begin_datetime,cus_username,cus_phone,customer_address}}'
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
        if (res.data.data.partner_robbing_list == null || res.data.data.partner_robbing_list.length == 0) {
          this.setData({
            orderList: [],
            noData: true,
            hidden: true
          });
          return false;
        }
        let data = res.data.data.partner_robbing_list,n = data.length;
        let list = this.data.orderList;
        for (let i = 0; i < n; i++) {
          data[i].mydate = new Date(data[i].c_begin_datetime).format("yyyy-MM-dd hh:mm");
          list.push(data[i]);
        }
        this.setData({
          orderList: list,
          noData: false,
          hidden: true
        });
        if (data.length < this.data.count) {
          this.data.reqFlag = false;
        } else {
          this.data.page_index++;
        }
    })
  },
  loadmore() {
    if (!this.data.reqFlag) {
      return
    }
    this.setData({
      hidden: false
    });
    app.http('POST', app.data.dev, {
        'query': 'query{partner_robbing_list(page_index:' + this.data.page_index + ',count:' + this.data.count + '){pay_order_id,image_first,orderStatus,name,price_total,num,c_begin_datetime,cus_username,cus_phone,customer_address}}'
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
        if (res.data.data.partner_robbing_list == null || this.data.page_index ===1 && res.data.data.partner_robbing_list.length == 0) {
          this.setData({
            noData: true,
            hidden: true
          });
          return false;
        }
        let data = res.data.data.partner_robbing_list,n = data.length;
        let list = this.data.orderList;
        for (let i = 0; i < n; i++) {
          data[i].mydate = new Date(data[i].c_begin_datetime).format("yyyy-MM-dd hh:mm");
          list.push(data[i]);
        }
        this.setData({
          noData: false,
          orderList: list,
          hidden: true
        });
        if (data.length < this.data.count) {
          this.data.reqFlag = false;
        } else {
          this.data.page_index++;
        }
    })
  },
  bindDownLoad() {
    this.loadmore();
  },
  scroll(event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  },
  bindViewTap(event) {
    let id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/view/rob/roborder/roborder?pay_order_id=' + id
    });
  }
});