// pages/coursesDetail/coursesDetail.js
var app=getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  data: {
    id:'',
    content:{},
    loading:false,
    noData:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id:options.cursore_id
    })
    this.getDetail();
    qqmapsdk = new QQMapWX({ key:'43DBZ-CJC6K-GVVJK-AEOQT-Y37JZ-TKFSR'})
  },
  toMap(){
    var address=this.data.content.school.address + this.data.content.school.name;
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: 39.984060,
        longitude: 116.307520
      },
      success: function (res) {
        console.log(res,'=======');
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });

    qqmapsdk.geocoder({
      address: address,
      success: function (res) {
        wx.navigateTo({
          url: '../map/map?lat=' + res.result.location.lat+'&lng='+res.result.location.lng,
        })
      },
      fail: function (res) {
        console.log(res);
      },
    });
  },
  getDetail(){
    this.setData({
      loading:true
    })
    app.req({ "query": 'query{train_schedule_info(train_schedule_id:"' + this.data.id +'"){trainSchedule {attendclass_date,attendclass_endtime,attendclass_starttime},chapter{headline,section_name},school{name,address},classroom {block_number},plan{train_way},course{name}}}' }, res => {
      this.setData({
        loading: false
      })
      if (res.statusCode == 401 || res.errors != undefined || res.data.data.train_schedule_info == null) {
        console.log('asfsfs')
        this.setData({
          noData: true
        })
      }
      var data = res.data.data.train_schedule_info;
      var d = data.trainSchedule.attendclass_date.split('T')[0];
      var t = data.trainSchedule.attendclass_starttime.split('T')[1];
      var e = data.trainSchedule.attendclass_endtime.split('T')[1];
      t = t.substring(0, t.length - 4);
      data.trainSchedule.myDate = d + ' ' + t + '~' + e.substring(0, e.length - 4);

      this.setData({
        content: data
      })
    })
  }
})