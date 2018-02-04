//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    imgUrls: [
      { path: 'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg' },
      { path: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg' },
      { path: 'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'}
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
    this.getImgId();
    this.getList();
  },
  toDetail(options){
    // var id = options.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../coursesDetail/coursesDetail?cursore_id=' + options.currentTarget.dataset.id
    })
  },
  getImgId(){
    wx.request({
      url: app.data.dev,
      method:'POST',
      data:{
        query:'query{teacher_cms_bannar_online_list{content_id,coverimg_id,title,intro,serial_number}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        var idArr=[];
        var data = res.data.data.teacher_cms_bannar_online_list,n=data.length;
        for(let i=0; i<n; i++){
          idArr.push('"'+data[i].coverimg_id.toString()+'"');
        }
        this.getPath(idArr);
      }
    })
  },
  getPath(arr){
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query:'query{images(ids:['+arr+']){img_id,path}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        this.setData({
          imgUrls: res.data.data.images
        })
      }
    })
  },
  getList(){
    this.setData({
      loading:true
    })
    wx.request({
      url: app.data.dev,
      method: 'POST',
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      data:{
        query: 'query{my_teacher_courseinfo_active_list{trainSchedule {id},course {headline,section_name},school {school_name},classroom {block_number},plan {train_begin,train_end,train_way},courseTeam {team_name}}}'
      },
      success:res=>{
        this.setData({
          loading: false
        })
        // console.log(res.data.data.my_teacher_courseinfo_active_list,'=================')
        if (res.errors != undefined || res.data.statusCode == 401 || res.data.data.my_teacher_courseinfo_active_list == null || res.data.data.my_teacher_courseinfo_active_list.length==0){
          this.setData({
            noData:true
          })
          return false;
        }

        var data = res.data.data.my_teacher_courseinfo_active_list,n=data.length;
        for(let i=0; i<n; i++){
          var arr=data[i].plan.train_begin.split('T');
          var d=arr[0],sT=arr[1].substring(0,arr[1].length-1);
          var ed=data[i].plan.train_end.split('T')[1],eT=ed.substring(0,ed.length-1);
          data[i].plan.mydate=d+' '+sT+'~'+eT;
        }
        this.setData({
          list:data
        })
      }
    })
  }
})
