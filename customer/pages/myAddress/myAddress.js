var app = getApp();
Page({
  data: {
    list: [],
    saveDefault: '',
    isSelected: '',
    isMine:true,
    noData:false,
    isLoading:false
  },
  onLoad: function (options) {
    this.getDataList();
    wx.getStorage({
      key: 'addressId',
      success: res => {
        this.setData({
          isSelected: res.data
        })
      },
    })
  },
  backFn() {
    wx.switchTab({
      url: '/pages/mine/mine',
    })
  },
  // 获取地址列表
  getDataList() {
    this.setData({
      isLoading:true
    })
    app.req({ "query": 'query{customer_address_list{customer_address_id,default_address,province,city,area,customer_id,username,phone,address,lbs_lat,lbs_lng,sub_address}}'},res=>{
      this.setData({
        isLoading: false
      })
      if (res.data.error != undefined || res.data.data == null || res.data.errors && res.data.errors.length > 0) {
        console.log('接口出错')
        this.setData({
          noData: true,
        })
      } else if (res.data.data.customer_address_list.length == 0) {
        this.setData({
          noData: true,
        })
      } else {
        for (let i = 0; i < res.data.data.customer_address_list.length; i++) {
          var item = res.data.data.customer_address_list[i];
          if (item.default_address == 1) {
            this.setData({
              saveDefault: item.customer_address_id,
            })
            if (this.data.isSelected == '') {
              this.setData({
                isSelected: item.customer_address_id
              })
            }
            break;
          }
        }
        this.setData({
          list: res.data.data.customer_address_list
        })
      }
    })
  },
  // 进入新增和编辑地址界面
  goToAttr(options) {
    var num = options.currentTarget.dataset.type
    var id = options.currentTarget.dataset.nid
    wx.setStorage({
      key: 'type',
      data: { type: num, isMine:this.data.isMine },
    })
    for (let i = 0; i < this.data.list.length; i++) {
      if (id == this.data.list[i].customer_address_id) {
        wx.setStorage({
          key: 'editer',
          data: this.data.list[i],
        })
        break;
      }
    }

    wx.redirectTo({
      url: '/pages/addEditer/addEditer'
    })
  },
  selectAddress(options) {
    this.setData({
      isSelected: options.target.dataset.id
    })
    wx.setStorage({
      key: 'addressId',
      data: options.target.dataset.id,
    })
    for (let i = 0; i < this.data.list.length; i++) {
      if (this.data.list[i].customer_address_id == options.target.dataset.id) {
        wx.setStorage({
          key: 'selectedAddress',
          data: this.data.list[i]
        })

        wx.redirectTo({
          url: '/pages/subOrder/subOrder',
        })
        break;
      }
    }
  },
  setDefault(options) {
    var id = options.currentTarget.dataset.id;
    app.req({ "query": 'mutation{customer_set_default_address(customer_address_id:"' + id + '"){status}}'},res=>{
      if (res.data.data == null || res.data.errors && res.data.errors.length > 0) {
        console.log('不成功')
      } else {
        this.setData({
          saveDefault: id
        })
      }
    })
  }
})