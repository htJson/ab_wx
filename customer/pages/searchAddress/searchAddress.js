// pages/searchAddress/searchAddress.js\
var app=getApp();
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({
  data: {
    cityName:'北京',
    open: true,
    mark: 0,
    newmark: 0,
    istoright: false,
    cityList:[],
    nearbyList:[],
    addressName:'',
    timer:null,
    addEditerContent:{},
    noData:false,
    noDataText:'附近没有搜索到地点'
  },
  onLoad: function (options) {
    qqmapsdk = new QQMapWX({ key: '77GBZ-TAMRF-C6RJU-NJX7S-CAB73-IUBN5' });
    // this.getCityList();  提取城市列表
    // this.getAddress()
    wx.getStorage({
      key: 'tdata',
      success: res=> {
        this.setData({
          addEditerContent:res.data
        })
      },
    })
    this.openTips()
  },
  backFn() {
    wx.redirectTo({
      url: '/pages/addEditer/addEditer',
    })
  },
  openTips(){  //获取用户权限设置
    wx.getSetting({
      success:res=>{
        if (res.authSetting['scope.userLocation'] == undefined){ //未授权过
          this.getAddress()
        } else if (!res.authSetting['scope.userLocation']){  //已授权但是false
          wx.showModal({
            title: '提示',
            content: '请开启定位功能，否则只能自己输入搜索',
            success:res=>{
              if(res.confirm){
                this.setting();
              }else{
                this.setData({
                  noData: true,
                  noDataText: '因为没有开启定位，无法搜索到附近的地址'
                })
              }
            }
          })
        }else{ //授权了，且是true
          this.getAddress()
        }
      }
    })
  },
  setting(){ //调取权限设置
    wx.openSetting({
      success:res=>{
        this.getAddress();
      }
    })
  },
  getAddress(){ //获取当前地理位置
    this.setData({
      noData:false,
      noDataText:''
    })
    wx.getLocation({
      type: 'wgs84',
      success: res=> {
        this.convertAddress(res.latitude, res.longitude)
      },
      fail:res=>{
        this.setData({
          noData:true,
          noDataText:'未搜索到附近的地址'
        })
      }
    })
  },
  convertAddress(lat,lng){ //坐标转换地址名称
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: lng
      },
      success: res=> {
        this.setData({
          addressName: res.result.address
        })
        this.getNearby(res.result.address)
      },
      fail: function (res) {
        console.log('坐标转换失败');
      }
    })
  },
  custom(options){
    clearInterval(this.data.timer)
    if (options.detail.value ==''){return false;}
    this.data.timer=setInterval(()=>{
      this.searchByAddress(options.detail.value)
    },500)
  },
  searchByAddress(name){
    this.setData({
      noData:false,
      noDataText:''
    })
    qqmapsdk.getSuggestion({
      keyword:name,
      region:'北京市',
      region_fix:1,
      policy:1,
      success:res=>{
        clearInterval(this.data.timer)
        console.log(1111)
        if(res.data.length == 0 ){
          this.setData({
            noData:true,
            noDataText:'没有搜到相关地址',
            nearbyList:[]
          })
          return false;
        }
        this.setData({
          nearbyList: res.data
        })
        
      },
      fail:res=>{
        clearInterval(this.data.timer)
      }
    })
  },
  getNearby(name){
    qqmapsdk.search({
      keyword: name,
      success:res=> {
        clearInterval(this.data.timer)
        if(res.data.length == 0){
          this.setData({
            noData:true,
            noDataText:'搜索附近无数据'
          })
          return false;
        }
        this.setData({
          nearbyList:res.data
        })
      },
      fail: res=> {
        clearInterval(this.data.timer)
      }
    });
  },
  goToOrder(options){
    var index=options.target.dataset.index;
    var item = this.data.nearbyList[index];
    if(item.ad_info == undefined){
      item.ad_info={
        province:item.province,
        city:item.city,
        district:item.district
      }
    }
    var address = item.ad_info.province + item.ad_info.city + item.ad_info.district + item.title;
    
    // 省市区组合信息
    this.data.addEditerContent.address = address
    // 省市区信息
    this.data.addEditerContent.ad_info = item.ad_info
    // 坐标数据
    this.data.addEditerContent.location = item.location
    wx.setStorage({
      key: 'tdata',
      data: this.data.addEditerContent,
    })
    wx.redirectTo({
      url: '/pages/addEditer/addEditer',
    })
  },
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  bindSelected(options) {
    var cid = options.currentTarget.dataset.id;
    var price = 'detailData.price_first';
    var pricev = 'detailData.pricev_first';
    for (var i = 0; i < this.data.actionSheetItems.length; i++) {
      var pid = this.data.actionSheetItems[i]['psku_id'];
      if (pid == cid) {
        var name = this.data.actionSheetItems[i].name;
        this.setData({
          selected: cid,
          actionSheetHidden: !this.data.actionSheetHidden,
          selectedItem: name,
          isStart: false,
          [price]: this.data.actionSheetItems[i].price,
          [pricev]: this.data.actionSheetItems[i].pricev
        })
        break;
      }
    }
  },

  tap_ch: function (e) {
    if (this.data.open) {
      this.setData({
        open: false
      });
    } else {
      this.setData({
        open: true
      });
    }
  },
  tap_start: function (e) {
    // touchstart事件
    this.data.mark = this.data.newmark = e.touches[0].pageX;
  },
  tap_drag: function (e) {

    this.data.newmark = e.touches[0].pageX;
    if (this.data.mark < this.data.newmark) {
      this.istoright = true;
    }

    if (this.data.mark > this.data.newmark) {
      this.istoright = false;
    }
    this.data.mark = this.data.newmark;

  },
  tap_end: function (e) {
    // touchend事件
    this.data.mark = 0;
    this.data.newmark = 0;
    if (this.istoright) {
      this.setData({
        open: true
      });
    } else {
      this.setData({
        open: false
      });
    }
  }
})