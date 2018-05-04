// pages/study/study.js
var app=getApp();
Page({
  data: {
    trainList: [],
    trainLoading:false,
    trainNoData:false
  },
  onLoad: function (options) {
    this.getList();
  },
  getImagePath(idArr) {
    app.req({ "query": '{images(ids:[' + idArr + ']){img_id,path}}' }, res => {
      var list = this.data.trainList, m = list.length
      var data = res.data.data.images, n = data.length;
      for (let i = 0; i < m; i++) {
        for (let y = 0; y < n; y++) {
          if (list[i].course.img == data[y].img_id) {
            list[i].course.path = data[y].path;
          }
        }
      }
      this.setData({
        trainList: list
      })
    })
    
  },
  getList(){
    this.setData({
      trainLoading:true
    })
    app.req({ "query": "query{my_student_trainedinfo_list{course{course_id,name,hour,credit,img},plan{train_way},planStudent{passed},examApplys{score}}}"}, res => {
      this.setData({
        trainLoading: false
      })
      if (res.statusCode == 401 || res.errors != undefined || res.data.data.my_student_trainedinfo_list == null || res.data.data.my_student_trainedinfo_list.length == 0) {
        this.setData({
          trainNoData: true
        })
        return false;
      }
      var data = res.data.data.my_student_trainedinfo_list, n = data.length;
      var idArr = []
      for (let i = 0; i < n; i++) {
        idArr.push('"' + data[i].course.img + '"')
      }
      this.setData({
        trainList: data
      })
      this.getImagePath(idArr)
    })
  }
})