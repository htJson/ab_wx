var app=getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    actionSheetHidden: true,
    actionSheetItems: [],
    selected:null,
    detailData:[],
    skuType:[],
    selectedItem:'',
    isLogin:true,
    isStart:false,
    product_id:'',  //写错应该是pid
    selectedSkuId:'',
    meUrl:''
  },

  onLoad: function (options) {

      this.setData({
        product_id: options.product_id,
        selectedSkuId: options.skuId || ''
      })
      this.getDetailData(options.product_id);
    
    // this.getDetailData(options.product_id);
    // this.setData({
    //   product_id:options.product_id,
    //   selectedSkuId: options.skuId||''
    // })
    this.getInfo();
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    this.setData({
      meUrl:currentPage.route
    })
  },
  move(){
    console.log(';====')
    return false;
  },
  moveTop(){
    wx.switchTab({
      url: '/pages/index/index',
    })
  },
  backFn(){
    wx.switchTab({
      url: '/pages/index/index',
    })
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
        "query": 'query{customer_product_detail(product_id:"' + id +'"){product{product_id,serviceitem_id,name,descript,images,image_first,price_first,pricev_first,base_buyed,base_buyed,content,psku_id_first},proSkus{psku_id,name,price,buy_limit,pricev}}}'
        // "query": 'query{customer_product_detail(product_id:"1078522314401816576"){product{product_id,serviceitem_id,name,descript,images,image_first,price_first,pricev_first,base_buyed,base_buyed,content,psku_id_first},proSkus{psku_id,name,price,buy_limit,pricev}}}'
      },
      success:res=>{
        this.setData({
          detailData: res.data.data.customer_product_detail.product,
          actionSheetItems: res.data.data.customer_product_detail.proSkus,
          isStart: res.data.data.customer_product_detail.proSkus.length>1
        })
        var arrSku = res.data.data.customer_product_detail.proSkus;
        if (this.data.selectedSkuId){
          for (let i = 0; i < arrSku.length; i++){
            if (this.data.selectedSkuId == arrSku[i].psku_id){
              this.setData({
                selectedItem:arrSku[i].name,
                selected: arrSku[i].psku_id
              })
              break;
            }
          }
        }
        this.getSkuName(this.data.detailData.psku_id_first)
        WxParse.wxParse('article', 'html', res.data.data.customer_product_detail.product.content, this, 0);
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
    console.log(1111111)
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  actionSheetbindchange: function () {
    console.log(43333333)
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden
    })
  },
  bindSelected(options){
    var cid = options.currentTarget.dataset.id;
    this.setData({
      selectedSkuId:cid
    })
    var price = 'detailData.price_first';
    var pricev ='detailData.pricev_first';
    for (var i = 0; i < this.data.actionSheetItems.length; i++){
      var pid = this.data.actionSheetItems[i]['psku_id'];
      if(pid==cid){
        var name = this.data.actionSheetItems[i].name;
        this.setData({
          selected: cid,
          // actionSheetHidden: !this.data.actionSheetHidden,
          selectedItem: name,
          isStart:false,
          [price]: this.data.actionSheetItems[i].price,
          [pricev]: this.data.actionSheetItems[i].pricev
        })
        break;
      }
    }
  },
  getInfo(){
    wx.request({
      url: app.data.dev,
      method:"POST",
      header:{
        "content-type": "application/json",
        "Authorization": app.globalData.token
      },
      data:{
        "query":'query{customer_info{customer_id}}'
      },
      success:res=>{
        if (res.data.errors && res.data.errors.length>0){
          this.setData({
            isLogin:false
          }) 
        }else{
          this.setData({
            isLogin:true
          })
        }
      }
    })
  },

  skuBtn(options){
      // sku列表里面的确定按钮
    this.setData({
      actionSheetHidden: !this.data.actionSheetHidden,
    })
    this.submitOrder(options)
  },

  submitOrder(options){
    if (this.data.selected == null || this.data.selected == ''){
      this.actionSheetbindchange();
      return false;
    }
    if(!this.data.isLogin){
      wx.showModal({
        title: '用户提示',
        content: '请先登录',
        showCancel: false,
        confirmColor: '#00a0e9',
        success:res=> {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/login/login?id=' + this.data.product_id + '&url=' + this.data.meUrl + '&skuId=' + this.data.selectedSkuId,
            })
          }
        }
      })
      return false;
    }

    wx.setStorage({
      key: "detail",
      data: {
        productId: options.currentTarget.dataset.id,
        pskuId: this.data.selected,
        pName: this.data.detailData.name,
        price: this.data.detailData.price_first,
        skuName: this.data.selectedItem,
      }
    })
    wx.navigateTo({
      url: '/pages/subOrder/subOrder',
    })
  }
})