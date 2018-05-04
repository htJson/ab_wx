var app=getApp();
var QQMapWX=require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  data: {
    content:{},
    cId:'',
    noData:false
  },
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({ key:'43DBZ-CJC6K-GVVJK-AEOQT-Y37JZ-TKFSR'})
    this.setData({
      cId: options.cursore_id
    })
    this.getDetail();
  },

  getDetail(){
    app.req({ "query": 'query{train_schedule_info(train_schedule_id:"' + this.data.cId + '"){trainSchedule{attendclass_date,attendclass_starttime,attendclass_endtime},chapter{headline,section_name},school{name,address},plan{train_way},classroom{block_number},course{name}}}'},res=>{
      if (res.errors != undefined || res.data.data.train_schedule_info == null) {
        this.setData({
          noData: true
        })
        return false;
      }

      var data = res.data.data.train_schedule_info;
      var date = data.trainSchedule.attendclass_date.split('T')[0];
      var sd = data.trainSchedule.attendclass_starttime.split('T')[1];
      var ed = data.trainSchedule.attendclass_endtime.split('T')[1];
      var sT = sd.substring(0, sd.length - 4);
      var eT = ed.substring(0, ed.length - 4);
      data.trainSchedule.mydate = date + ' ' + sT + '~' + eT;
      this.setData({
        content: data
      })
    })
  },
  toMap(options){
    var address=options.currentTarget.dataset.address;
    qqmapsdk.geocoder({
      address: address,
      success: res=> {
        wx.navigateTo({
          url: '../map/map?lat=' + res.result.location.lat + '&lng=' + res.result.location.lng,
        })
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    });
    console.log(address);
    return false;
    
  }
})