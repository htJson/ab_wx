var app=getApp();
Page({
  data: {
    startData: '2018-01-12',
    endData: '2018-01-28',
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

  onReady: function () {
    
  },

  onShow: function () {
    
  },

  onHide: function () {
    
  },

  onUnload: function () {
    
  },

  onPullDownRefresh: function () {
    
  },

  onReachBottom: function () {
    
  },

  onShareAppMessage: function () {
    
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
        query: 'query{my_teacher_courseinfo_list(dateStart: "' + this.data.startData + '", dateEnd: "' + this.data.endData + '", count: 20) {course {headline,section_name},school {school_name},classroom {block_number},plan {train_begin,train_end,train_way},courseTeam {team_name,team_hour}}}'
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
          var arr = data[i].plan.train_begin.split('T')
          var d = arr[0];
          var sT = arr[1].substring(0, arr[1].length - 1);
          var ed = data[i].plan.train_end.split('T');
          var eT = ed[1].substring(0, ed[1].length - 1);
          result+=parseInt(data[i].courseTeam.team_hour);
          data[i].plan.mydate=d+' '+sT+'~'+eT;
        }
        // data.hour=result
        // data.allHour=result;
        
        this.setData({
          result:result,
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