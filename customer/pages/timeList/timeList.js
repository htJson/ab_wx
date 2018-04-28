// pages/timeList/timeList.js
var app=getApp();
Page({
  data: {
    times:[],
    list:[],
    cookie:{},
    selectDay:0,
    selectTime:null,
    startTime:'',
    endTime:'',
    widthBox:0,
    date:'',
    isTime:false,
    noData:false
  },
  onLoad: function (options) {
    wx.getStorage({
      key: 'detail',
      success: res=> {
        this.setData({
          cookie:res.data
        })
        console.log(res,'=====')
        this.getTimeList(res.data);
      }
    })
  },
  backFn() {
    wx.redirectTo({
      url: '/pages/subOrder/subOrder',
    })
    // wx.navigateBack({
    //   data:1
    // })
  },
  selected(options){
    var index = options.currentTarget.dataset.index
    this.setData({
      selectDay:index,
      list: this.data.times[index].models
    })
  },
  bespeak(options){
    var index=options.currentTarget.dataset.index;
    this.setData({
      selectTime:index,
      startTime:options.currentTarget.dataset.start,
      endTime:options.currentTarget.dataset.end,
      date:options.currentTarget.dataset.alltime
    })
  },
  goToOrder(){
    if(!this.data.isTime){
      if (this.data.startTime == '' || this.data.endTime == '') {
        wx.showToast({
          title: '请选择上门时间',
          icon: 'none'
        })
        return false;
      }
    }
    wx.setStorage({
      key:'time',
      data:{
        startTime:this.data.startTime,
        endTime:this.data.endTime,
        date:this.data.date,
        dIndex: this.data.selectDay,
        tIndex: this.data.selectTime
      }
    })
    wx.reLaunch({
      url: '/pages/subOrder/subOrder',
    })
  },
  getTimeList(data){
    wx.request({
      url: app.data.dev,
      method:'POST',
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        "query": 'query{customer_product_available_times(product_id:"' + data.productId + '",psku_id:"' + data.pskuId + '",customer_address_id:"' + data.addressId +'",num:' + data.count+'){dateTime,models{start,end,active,dateStart,dateEnd,dateTime}}}'
      },
      success:res=>{
        if(res.data.errors && res.data.errors.length>0){
          this.setData({
            noData: true
          })
          return false;
        } else if (res.data.data.customer_product_available_times.length == 0){
          this.setData({
            noData:true
          })
          return false;
        }else{
          var vData = res.data.data.customer_product_available_times;
          console.log(vData.length*160)
          this.setData({
            widthBox:(vData.length * 220)+'rpx'
          })
          for(let i= 0; i <vData.length; i++){
            vData[i].nIndex=''+i;
            for(let a=0; a<vData[i].models.length; a++){
              vData[i].models[a].nIndex=''+i+'-'+a;
              if(vData[i].models[a].end == null){
                vData[i].models[a].showTime=vData[i].models[a].start
              }else{
                vData[i].models[a].showTime = vData[i].models[a].start+'~'+vData[i].models[a].end;
              }
            }
          }

          this.setData({
            times: vData,
            list: vData[this.data.selectDay].models
          })
        }
      }
    })
  }
})