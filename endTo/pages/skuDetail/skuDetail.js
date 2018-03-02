var app=getApp();
Page({
  data: {
    actionSheetHidden: true,
    actionSheetItems: [],
    selected:0,
    detailData:[],
    skuType:[],
    selectedItem:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDetailData(options.product_id);
  },
  
  getDetailData(id){
    wx.request({
      url: app.data.dev,
      method:'POST',
      header: {
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        "query": 'query{product_detail(product_id:"'+id+'"){product{product_id,serviceitem_id,name,descript,images,image_first,price_first,pricev_first,base_buyed,content},proSkus{psku_id,name,price,buy_limit}}}'
      },
      success:res=>{
        this.setData({
          detailData: res.data.data.product_detail.product,
          actionSheetItems: res.data.data.product_detail.proSkus
        })
      }
    })
  },
  actionSheetTap: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetbindchange: function () {
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  bindSelected(options){
    console.log(options)
    var index = options.currentTarget.dataset.index;
    var name = this.data.actionSheetItems[index].name + '-￥' + this.data.actionSheetItems[index].price/100
    this.setData({
      selected:index,
      actionSheetHidden: !this.data.actionSheetHidden,
      selectedItem:name
    })
  },
  submitOrder(){
    wx.navigateTo({
      url: '/pages/subOrder/subOrder',
    })
  }
})