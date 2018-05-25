const app = getApp()
Page({
  data: {
    imgUrls: [
      // { path: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg' },
      { path: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg' },
      // { path: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'}
    ],
    indicatorDots: true,
    autoplay: true,
    indicatorColor:'#0f8af4',
    interval: 5000,
    duration: 500,
    circular:true,
    noData:false,
    loading:false,
    list:[]
  },
  //事件处理函数

  onLoad: function () {
    this.timer=setInterval(()=>{
      if (app.globalData.token){
        clearInterval(this.timer)
        this.getInfo();
      }
    },30)
  },

  getInfo() {
    // 根据是否绑定判断进入哪个界面
    app.req({ "query": 'query{my_teacher_bindinfo{phone,identity_card,icon,name}}'}, res => {
      if (res.data.errors != undefined) {
        wx.redirectTo({
          url: '/pages/login/login',
        })
      }else{
        app.globalData.userInfo = res.data.data.my_teacher_bindinfo;
        this.getImgId();
        this.getList();
      }
    })
  },

  toDetail(options){
  
    wx.navigateTo({
      url: '../coursesDetail/coursesDetail?cursore_id=' + options.currentTarget.dataset.id
    })
  },
  getImgId(){
    app.req({ "query": 'query{teacher_cms_bannar_online_list{cms_banner_id,img_cover,title,intro,serial_number}}'},res=>{
      var idArr = [];
      if (res.data.errors && res.data.errors.length > 0) {
        return false;
      }
      var data = res.data.data.teacher_cms_bannar_online_list, n = data.length;
      for (let i = 0; i < n; i++) {
        idArr.push('"' + data[i].img_cover.toString() + '"');
      }
      this.getPath(idArr);
    })
  },
  getPath(arr){
    app.req({ "query": 'query{images(ids:[' + arr + ']){img_id,path}}'},res=>{
      this.setData({
        imgUrls: res.data.data.images
      })
    })
  },
  
  getList(){
    this.setData({
      loading:true
    })
    app.req({ "query": 'query{my_teacher_courseinfo_active_list{trainSchedule {train_schedule_id,attendclass_date,attendclass_endtime,attendclass_starttime},chapter {headline,section_name},school{name},classroom {block_number},plan {train_begin,train_end,train_way},course{name}}}'},res=>{
      this.setData({
        loading: false
      })
      if (res.errors != undefined || res.data.statusCode == 401 || res.data.data.my_teacher_courseinfo_active_list == null || res.data.data.my_teacher_courseinfo_active_list.length == 0) {
        this.setData({
          noData: true
        })
        return false;
      }

      var data = res.data.data.my_teacher_courseinfo_active_list, n = data.length;
      for (let i = 0; i < n; i++) {
        var d = data[i].trainSchedule.attendclass_date.split('T')[0];
        var st = data[i].trainSchedule.attendclass_starttime.split('T')[1];
        var et = data[i].trainSchedule.attendclass_endtime.split('T')[1];
        data[i].trainSchedule.mydate = d + ' ' + st.substring(0, st.length - 4) + '~' + et.substring(0, et.length - 4);
      }
      this.setData({
        list: data
      })
    })
  }
})
