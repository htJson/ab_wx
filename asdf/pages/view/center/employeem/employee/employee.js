// pages/view/center/employeem/employee/employee.js
const app= getApp();
Page({
  data: {
    hidden: true,
    statu: false,
    employee: [],
    station: '',
    stations: [],
    dateTime: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      student_id: options.student_id
    })
    this.getEmployee();
    this.getLeaveDate();
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
    var pages = getCurrentPages();
    var prevPage = pages[pages.length - 2];
    var data = prevPage.data.employeelist;
    for (var i = 0,len = data.length;i < len; i++){
        if(this.data.student_id == data[i].student.student_id){
            data[i].station = {'address':this.data.station}
        }
    }
    prevPage.setData({
        employeelist:data
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
  getEmployee(){
    this.setData({
      hidden: false
    });
    app.http('POST', app.data.dev, {
        'query': 'query{partner_employee_detail(student_id:' + this.data.student_id + '){student{name,identity_card,native_place,phone},station{station_id,address},serviceitem{name},partner{name},ossImg{url}}}'
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
        if (res.data.data.partner_employee_detail == null || res.data.data.partner_employee_detail.length == 0) {
          return false;
        }
        let data = res.data.data.partner_employee_detail;

        this.setData({
          employee: data
        })
        if (data.station !== null){
            this.setData({
              station:data.station.address
            })
        }
        app.http('POST', app.data.dev, {
            'query': 'query{partner_store_information{station_id,address}}'
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
            if (res.data.data.partner_store_information == null || res.data.data.partner_store_information.length == 0) {
              return false;
            }
            let data = res.data.data.partner_store_information, n = data.length;
            for (let i = 0; i < n; i++) {
              if (this.data.employee.station == null) {
                data[i].checked = false
              }else {
                data[i].checked = data[i].station_id == this.data.employee.station.station_id ? true : false;
                this.setData({
                  station_id: this.data.employee.station.station_id,
                })
              }
            }
            this.setData({
              stations: data
            })
        })
    })
  },
  getLeaveDate(event) {
    app.http('POST', app.data.dev, {
        'query': 'query{partner_stop_date(student_id:' + this.data.student_id + '){leaveDate,statu}}'
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
        if (res.data.data.partner_stop_date == null || res.data.data.partner_stop_date.length == 0) {
          return false;
        }
        this.setData({
          dateTime: res.data.data.partner_stop_date
        })
    })
  },
  stationChange(event) {
    let str = event.detail.value;
    let arr = str.split('~~');
    let addr = arr[1];
    let id = arr[0];
    this.setData({
      station_id: id
    })
    app.http('POST', app.data.dev, {
        'query': 'mutation{partner_update_station(student_id:' + this.data.student_id + ',station_id:"' + this.data.station_id + '"){status}}'
      }, res => {
        let errmsg = res.data.errors;
        if (errmsg) {
          wx.showToast({
            title: errmsg[0].message,
            icon: 'none'
          })
          this.setData({
            stations: this.data.stations
          })
          return false
        }
        this.setData({
          station: addr
        })
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        })
    })
  },
  switchChange(event) {
    var date = event.currentTarget.dataset.value;
    var status = event.detail.value;
    
    this.setData({
      date: date,
      statu: status
    })
    app.http('POST', app.data.dev, {
        'query': 'mutation{partner_stop_order(student_id:' + this.data.student_id + ',date:"' + this.data.date + '", statu:' + this.data.statu + '){status}}'
      }, res => {
        let errmsg = res.data.errors;
        if (errmsg) {
          wx.showToast({
            title: errmsg[0].message,
            icon: 'none'
          })
          this.setData({
            dateTime: this.data.dateTime
          })
          return false
        }
        let dtime = this.data.dateTime;
        for (let i = 0,len = dtime.length;i < len; i++){
            if (this.data.date == dtime[i].leaveDate){
                this.data.statu == true?this.data.dateTime[i].statu = 1:this.data.dateTime[i].statu = 0;
            }
        }
        wx.showToast({
          title: '修改成功',
          icon: 'success'
        })
    })
  }
})