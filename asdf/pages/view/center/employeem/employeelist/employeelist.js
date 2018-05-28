// pages/view/center/employeem/employeelist/employeelist.js
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
    count: 10,
    scrollTop: 0,
    scrollHeight: 0,
    employeelist: []
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
    this.loadMore();
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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

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

  toDetail(options) {
    const id = options.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../employee/employee?student_id=' + options.currentTarget.dataset.id
    })
  },
  loadMore() {
    if (!this.data.reqFlag){
      return
    }
    this.setData({
      hidden: false
    });
    app.http('POST', app.data.dev, {
        'query': 'query{partner_employee_management(page_index:' + this.data.page_index + ',count:' + this.data.count + '){student {name,student_id},station {address},serviceitem {name},ossImg{url}}}'
      }, res => {
        this.setData({
          hidden: true
        })
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
        if (res.data.data.partner_employee_management == null || this.data.page_index == 1 && res.data.data.partner_employee_management.length == 0) {
          this.setData({
            noData: true
          })
          return false;
        }
        let data = res.data.data.partner_employee_management;
        var list = this.data.employeelist;
        for (var i = 0; i < data.length; i++) {
          list.push(data[i]);
        }
        this.setData({
          employeelist: list,
        });
        if (data.length < this.data.count) {
          this.data.reqFlag = false;
        }else {
          this.data.page_index++;
        }
    })
  },
  bindDownLoad() {
    this.loadMore(this);
  },
  scroll(event) {
    this.setData({
      scrollTop: event.detail.scrollTop
    });
  }
})