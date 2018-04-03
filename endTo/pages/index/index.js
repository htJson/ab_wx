var app=getApp()
Page({
  data: {
    imgUrls: [
      {url:'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg'},
      {url:'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg'},
      {url:'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'}
    ],
    assort:[],
    skuList:[],
    isLoading:false,
    isReload:false,
    noData:false,
  },
  
  onLoad: function () {
    var timer=setInterval(()=>{
      if (app.globalData.token) {
        clearInterval(timer)
        // 获取首界分类列表
        this.getTypeList();
        // 获取首页，列表数据
        this.getSkuList();
        this.getBanner();
      }
    },300)
  },
  getBanner(){
    wx.request({
      url: app.data.dev,
      method:'POST',
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        "query":'query{customer_banner_list(position:""){oss_img_id,name,url,effect,format,create_time,bucket,access_permissions}}'
      },
      success:res=>{
        if (res.data.data.customer_banner_list && res.data.data.customer_banner_list.length > 0) {
          this.setData({
            imgUrls: res.data.data.customer_banner_list
          })
        }
      }
    })
  },
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading() //在标题栏中显示加载
    this.setData({
      isReload:true
    })
    this.getBanner();
    this.getTypeList();
    this.getSkuList();
  },
  getTypeList() {
    wx.request({
      url: app.data.dev,
      data: {
        "query": 'query{customer_home_category_list{category_id,name,logo,pid,category_level_code}}',
      },
      method: 'POST',
      header: {
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      success: res => {
        if (this.data.isReload){
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh()
        }
        this.setData({
          assort: res.data.data.customer_home_category_list
        })
      }
    })
  },
  goToList(options){
    var id = options.currentTarget.dataset.id, name = options.currentTarget.dataset.name
    wx.navigateTo({
      url: '/pages/typeList/typeList?cid='+id+'&name='+name,
    })
  },
  getSkuList(){
    this.setData({
      isLoading:true
    })
    wx.request({
      url: app.data.dev,
      method:'POST',
      header: {
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        "query":'query{customer_home_product_list(page_index:1,count:300){product_id,image_first,seo,name,price_first,pricev_first,base_buyed}}'
      },
      success:res=>{
        if (this.data.isReload) {
          wx.hideNavigationBarLoading();
          wx.stopPullDownRefresh()
        }
        this.setData({
          isLoading:false
        })
        if ((res.data.errors && res.data.errors.length>0) || res.data.data==null){
          this.setData({
            noData:true
          })
        }else{
          this.setData({
            skuList: res.data.data.customer_home_product_list
          })
        }
      }
    })
  },
  getIndex(options){
    var id=options.currentTarget.dataset.id;
    wx.redirectTo({
      url: '/pages/skuDetail/skuDetail?product_id='+id,
    })
  }
})
