const util = require('../../../../utils/util.js');
const app = getApp();
const sliderWidth = 64;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tabs: [{ name: "待确认", status: 'payed' }, { name: "待服务", status: 'waitService' }, { name: "已取消", status: 'cancel' }, { name: "已拒单", status: 'refused' }, { name: "已完成", status: 'done' }],
    payed: false,
    waitService: false,
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    noData: false,
    scrollTop: 0,
    scrollHeight: 0,
    page_index: 1,
    count: 10,
    status:'payed',
    orderList: [],
    hidden: true,
    reqFlag: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.getSystemInfo({
      success: res => {
        this.setData({
          sliderLeft: (res.windowWidth / this.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / this.data.tabs.length * this.data.activeIndex,
          scrollHeight: res.windowHeight
        });
      }
    });
    this.getList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},


  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},


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
  onPullDownRefresh() {},


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
      payed: true,
      hidden: false
    });
    app.http('POST', app.data.dev, {
        'query': 'query{partner_order_list(status:"' + this.data.status + '", page_index:' + this.data.page_index + ',count:' + this.data.count + '){pay_order_id,image_first,orderStatus,name,price_total,c_begin_datetime,cus_username,cus_phone,customer_address}}'
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
        if (res.data.data.partner_order_list == null || res.data.data.partner_order_list.length == 0) {
          this.setData({
            noData: true,
            hidden: true
          });
          return false;
        }
        let data = res.data.data.partner_order_list,n = data.length;
        let list = this.data.orderList;
        for (let i = 0; i < n; i++) {
          data[i].mydate = new Date(data[i].c_begin_datetime).format("yyyy-MM-dd hh:mm");
          list.push(data[i]);
        }
        this.setData({
          orderList: list,
          hidden: true,
        })
        if (data.length < this.data.count) {
          this.data.reqFlag = false;
        } else {
          this.data.page_index++;
        }
    })
  },
  tabClick(e) {
    this.setData({
      page_index: 1,
      orderList: [],
      hidden: true,
      reqFlag: true
    })
    this.setData({
      status: e.currentTarget.dataset.status
    })
    if (this.data.status == 'payed') {
      this.setData({
        payed: true,
        waitService: false
      })
    }
    else if (this.data.status == 'waitService') {
      this.setData({
        payed: false,
        waitService: true
      })
    }else {
      this.setData({
        payed: false,
        waitService: false
      })
    }
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
    this.loadmore();
  },
  loadmore() {
    if (!this.data.reqFlag) {
      return
    }
    this.setData({
      hidden: false
    });
    app.http('POST', app.data.dev, {
      'query': 'query{partner_order_list(status:"' + this.data.status + '", page_index:' + this.data.page_index + ',count:' + this.data.count + ') {pay_order_id,image_first,orderStatus,name,price_total,c_begin_datetime,cus_username,cus_phone,customer_address}}'
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
          })
        }
        if (res.data.data.partner_order_list == null || this.data.page_index ===1 && res.data.data.partner_order_list.length == 0) {
          this.setData({
            noData: true,
            hidden: true
          })
          return false;
        }
        let data = res.data.data.partner_order_list, n = data.length;
        let list = this.data.orderList;
        for (let i = 0; i < n; i++) {
          data[i].mydate = new Date(data[i].c_begin_datetime).format("yyyy-MM-dd hh:mm");
          list.push(data[i]);
        }
        this.setData({
          orderList: list,
          noData: false,
          hidden: true,
        })
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
    let id = event.currentTarget.dataset.id
    let status = event.currentTarget.dataset.status
    switch (status){
      case 'payed':
        wx.navigateTo({
          url: '/pages/view/order/confirm/confirm?pay_order_id=' + id
        });
        break;
      case 'waitService':
        wx.navigateTo({
          url: '/pages/view/order/service/service?pay_order_id=' + id
        });
        break;
      case 'cancel':
        wx.navigateTo({
          url: '/pages/view/order/cancel/cancel?pay_order_id=' + id
        });
        break;
      case 'refused':
        wx.navigateTo({
          url: '/pages/view/order/reject/reject?pay_order_id=' + id
        });
        break;
      case 'done':
        wx.navigateTo({
          url: '/pages/view/order/complete/complete?pay_order_id=' + id
        });
        break;
      default:

    };
  }
});