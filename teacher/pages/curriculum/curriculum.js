var app=getApp();
Page({
  data: {
    startData: app.getFirstDay(),
    endData: app.getToday(),
    result: 0,
    list:[],
    errorTip:'',
    loading:false,
    noData:false,
    sTime:false
  },

  onLoad: function (options) {
    this.getList();
  },

  changeStart: function (e) {
    this.setData({
      startData: e.detail.value
    })
    this.execute();
  },
  changeEnd: function (e) {
    this.setData({
      endData: e.detail.value
    })
    this.execute();
  },
  execute(){
    var sT = new Date(this.data.startData).getTime();
    var eT = new Date(this.data.endData).getTime();
    if(sT>eT){
      this.setData({
        sTime:true,
        errorTip:'开始时间不能大于结束时间'
      })
    }else{
      this.setData({
        sTime:false,
        errorTip:''
      })
      this.getList();
    }
  },
  getList(){
    this.setData({
      loading:true
    })
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: 'query{my_teacher_courseinfo_list(dateStart: "' + this.data.startData + '", dateEnd: "' + this.data.endData+'", count: 20) {chapter {headline,section_name},school{name},classroom {block_number},plan {train_way},course{name,hour},trainSchedule{train_schedule_id,attendclass_date,attendclass_endtime,attendclass_starttime}}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          loading: false
        })
      
        if (res.errors != undefined || res.data.statusCode == 401 || res.data.data.my_teacher_courseinfo_list == null || res.data.data.my_teacher_courseinfo_list.length == 0) {
          this.setData({
            noData: true
          })
          return false;
        }

        var data = res.data.data.my_teacher_courseinfo_list,n=data.length;
        var result=0;
        for(let i=0; i<n; i++){
          var d = data[i].trainSchedule.attendclass_date.split('T')[0];
          var et = data[i].trainSchedule.attendclass_endtime.split('T')[1];
          var st = data[i].trainSchedule.attendclass_starttime.split('T')[1]
          result+=parseInt(data[i].course.hour);
          data[i].trainSchedule.mydate=d+' '+st.substring(0,st.length-1)+'~'+et.substring(0,st.length-1);
        }
        
        this.setData({
          noData: false,  
          result:result/60,
          list:data
        })
      },
      fail(){
        this.setData({
          loading:false,
          noData:true
        })
      }
    })
  }
})