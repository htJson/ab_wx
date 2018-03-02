var app=getApp();
Page({
  data: {
    actionSheetHidden: true,
    actionSheetItems: [],
    selected:null,
    detailData:[],
    skuType:[],
    selectedItem:''
  },

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
        "query": 'query{customer_product_detail(product_id:"' + id +'"){product{product_id,serviceitem_id,name,descript,images,image_first,price_first,pricev_first,base_buyed,content,psku_id_first},proSkus{psku_id,name,price,buy_limit,pricev}}}'
      },
      success:res=>{
        this.setData({
          detailData: res.data.data.customer_product_detail.product,
          actionSheetItems: res.data.data.customer_product_detail.proSkus
        })
        this.getSkuName(this.data.detailData.psku_id_first)
      }
    })
  },
  getSkuName(skuId){
    if (this.data.actionSheetItems.length != 1){
      return false;
    }
    for (let i = 0; i < this.data.actionSheetItems.length; i++){
      if (skuId == this.data.actionSheetItems[i].psku_id){
        this.setData({
          selectedItem: this.data.actionSheetItems[i].name,
          selected: this.data.actionSheetItems[i].psku_id
        })
        break;
      }
    }
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
    var cid = options.currentTarget.dataset.id;
    var price = 'detailData.price_first';
    var pricev ='detailData.pricev_first';
    for (var i = 0; i < this.data.actionSheetItems.length; i++){
      var pid = this.data.actionSheetItems[i]['psku_id'];
      if(pid==cid){
        var name = this.data.actionSheetItems[i].name;
        this.setData({
          selected: cid,
          actionSheetHidden: !this.data.actionSheetHidden,
          selectedItem: name,
          [price]: this.data.actionSheetItems[i].price,
          [pricev]: this.data.actionSheetItems[i].pricev
        })
        break;
      }
    }
  },
  submitOrder(options){
    if (this.data.selected == null || this.data.selected == ''){
      wx.showModal({
        title: '用户提示',
        content:'请选择服务类型',
        showCancel:false,
        confirmColor:'#00a0e9',
        success: function (res) {}
      })
      return false;
    }
    wx.navigateTo({
      url: '/pages/subOrder/subOrder?productId=' + options.currentTarget.dataset.id + '&pskuId=' + this.data.selected+'&pName=' + this.data.detailData.name+'&price=' + this.data.detailData.price_first,
    })
  }
})