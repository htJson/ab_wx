var app=getApp()
Page({
  data: {
    imgUrls: [
      'http://img02.tooopen.com/images/20150928/tooopen_sy_143912755726.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg',
      'http://img06.tooopen.com/images/20160818/tooopen_sy_175833047715.jpg'
    ],
    assort:[{
      'image':'../../images/type.png',
      'title':'康洁士',
      'id':'0'
    },{
      'image': '../../images/type.png',
      'title': '金宝贝',
      'id': '0'
    },{
      'image': '../../images/type.png',
      'title': '尊夫人',
      'id': '0'
    },{
      'image': '../../images/type.png',
      'title': '萌宠物',
      'id': '0'
    }],
    skuList:[],
    isLoading:false,
    noData:false,
  },
  
  onLoad: function () {
    this.getSkuList();
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
        "query":'query{product_list(page_index:1,count:300){product_id,image_first,seo,name,price_first,pricev_first,}}'
      },
      success:res=>{
        this.setData({
          isLoading:false
        })
        if ((res.data.errors && res.data.errors.length>0) || res.data.data==null){
          this.setData({
            noData:true
          })
        }else{
          this.setData({
            skuList: res.data.data.product_list
          })
        }
      }
    })
  },
  getIndex(options){
    var id=options.currentTarget.dataset.id;
    wx.request({
      url: app.data.dev,
      data:{
        "query":''
      },
      method:'POST',
      header: {
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      success:res=>{}
    })
  }
})
