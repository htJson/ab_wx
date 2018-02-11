var app=getApp();
Page({
  data: {
    content:{},
    cId:'',
    noData:false
  },
  onLoad: function (options) {
    this.setData({
      cId: options.cursore_id
    })
    this.getDetail();
  },

  getDetail(){
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: 'query{train_schedule_info(train_schedule_id:"'+this.data.cId+'"){trainSchedule{attendclass_date,attendclass_starttime,attendclass_endtime},course{headline,section_name},school{school_name,school_address},plan{train_way},classroom{block_number},courseTeam{team_name}}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res => {
        if (res.errors != undefined ||res.data.data.train_schedule_info == null){
          this.setData({
            noData:true
          })
          return false;
        }

        var data = res.data.data.train_schedule_info;
        var date = data.trainSchedule.attendclass_date.split('T')[0];
        var sd = data.trainSchedule.attendclass_starttime.split('T')[1];
        var ed = data.trainSchedule.attendclass_endtime.split('T')[1];
        var sT=sd.substring(0,sd.length-4);
        var eT=ed.substring(0,ed.length-4);
        data.trainSchedule.mydate=date+' '+sT+'~'+eT;
        this.setData({
          content:data
        })
      }
    })
  }
})