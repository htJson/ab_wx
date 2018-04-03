var app=getApp();
Page({
  data: {
    isLoading:false,
    noData:false,
    data:[],
    title:''
  },
  onLoad: function (options) {
    this.getList(options.cid);
    this.setData({
      title:options.name+'列表'
    })
  },
  getIndex(options) {
    var id = options.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/skuDetail/skuDetail?product_id=' + id,
    })
  },
  backFn() {
    wx.navigateBack({
      data:1
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
        "query": 'query{customer_product_list_by_category_level_code(category_level_code:"' + id +'",page_index:1,count:3000){product_id,name,image_first,price_first,pricev_first,base_buyed}}'
      },
      success:res=>{

        this.setData({
          isLoading:false
        })
        if(res.data.errors !=undefined && res.data.errors !=null){
          this.setData({
            noData: true
          })
        } else if (res.data.data.customer_product_list_by_category_level_code && res.data.data.customer_product_list_by_category_level_code.length==0){
          this.setData({
            noData: true
          })
        }else{
          console.log(res.data.data,'=======')
          this.setData({
            data: res.data.data.customer_product_list_by_category_level_code
          })
        }
      }
    })
  }
})