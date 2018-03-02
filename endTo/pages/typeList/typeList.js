var app=getApp();
Page({
  data: {
    isLoading:false,
    noData:false,
    data:[]
  },
  onLoad: function (options) {
    this.getList(options.cid);
  },
  getIndex(options) {
    var id = options.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/skuDetail/skuDetail?product_id=' + id,
    })
  },
  getList(id){
    this.setData({
      isLoading:true
    })
    wx.request({
      url: app.data.dev,
      method:'POST',
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        "query":'query{product_list_by_category_id(category_id:"'+id+'",page_index:1,count:3000){product_id,name,image_first,price_first,pricev_first}}'
      },
      success:res=>{
        this.setData({
          isLoading:false
        })
        if(res.data.errors !=undefined && res.data.errors !=null){
          this.setData({
            noData: true
          })
        }else{
          this.setData({
            data: res.data.data.product_list_by_category_id
          })
        }
      }
    })
  }
})