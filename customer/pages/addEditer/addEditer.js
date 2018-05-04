var app=getApp();
Page({
  data: {
    type:'',
    userName:'',
    phone:'',
    address:'',
    addressId:'',
    ad_info:{},
    location:{},
    isMine:null,
    isDefault:true,
    errorTip:'',
    detailed:'',
    requestOK:false
  },
  onLoad: function (options) {
    // 保存当前用户所填信息
    wx.getStorage({   //选择地址返回时提取缓存填充信息
      key: 'tdata',
      success: res => {
        this.setData({
          userName: res.data.userName,
          phone: res.data.phone,
          address: res.data.address,
          isDefault: res.data.isDefault,
          detailed: res.data.detailed||'',
          ad_info: res.data.ad_info||'',
          location: res.data.location,
        })
      },
    })
    this.getAddressType()
  },
  backFn() {
    wx.removeStorageSync('editer')
    if (this.data.isMine) {
      wx.redirectTo({
        url: '/pages/myAddress/myAddress',
      })
    } else {
      wx.redirectTo({
        url: '/pages/subOrder/subOrder',
      })
    }
  },
  getAddressType(){
    var nType=wx.getStorageSync('type');
    this.setData({
      type: nType.type ? nType.type : 0,
      isMine: nType.isMine
    })
    if (nType.type ==1){
      var editerAddress = wx.getStorageSync('editer');
      this.setData({
        addressId: editerAddress.customer_address_id,
        userName: editerAddress.username,
        phone: editerAddress.phone,
        address: editerAddress.address,
        isDefault: editerAddress.default_address,
        detailed: editerAddress.sub_address,
        location:{
          lat: editerAddress.lbs_lat,
          lng: editerAddress.lbs_lng
        }
      })
    }
  },
  getUserName(options){
    this.setData({
      userName:options.detail.value
    })
  },
  getPhone(options){
    this.setData({
      phone:options.detail.value
    })
  },
  getAddressContent(options){
    this.setData({
      detailed:options.detail.value
    })
  },
  check(){
    var reg = /^1(3|4|5|7|8)\d{9}$/;
    // 联系人
    if(this.data.userName ==''){
      this.setData({
        errorTip:'联系人不能为空'
      })
      return false;
    }
    // 手机号
    if(this.data.phone == ''){
      this.setData({
        errorTip: '手机号不能为空'
      })
      return false;
    } else if (!reg.test(this.data.phone)){
      this.setData({
        errorTip:'手机号格式不正确'
      })
      return false;
    }
    if (this.data.address ==''){
      this.setData({
        errorTip: '服务地址不能为空'
      })
      return false;
    }
    if (this.data.detailed == ''){
      this.setData({
        errorTip: '详细地址不能为空'
      })
      return false;
    }
    return true;
  },
  goToAdd(){
    wx.setStorage({
      key: 'tdata',
      data: this.data,
    })
    wx.redirectTo({
      url: '/pages/searchAddress/searchAddress',
    })
  },
  add(){
    if (!this.check() && !this.data.requestOK){return false;}
    this.setData({
      requestOK:true
    })
    app.getmstCode(res=>{
      this.addFn(res.data.data.apicode.code)
    })
  },
  addFn(mtsCode){
    app.req({ "query": 'mutation{customer_address_add (customer_address_input:{username:"' + this.data.userName + '",phone:"' + this.data.phone + '",province:"' + this.data.ad_info.province + '",city:"' + this.data.ad_info.city + '",district:"' + this.data.ad_info.district + '",address:"' + this.data.address + '",lbs_lat:"' + this.data.location.lat + '",lbs_lng:"' + this.data.location.lng + '",default_address:' + Number(this.data.isDefault) + ',sub_address:"' + this.data.detailed + '"}){customer_address_id,customer_id}}' }, res => {
      if (res.data.errors && res.data.errors.length > 1) {
        console.log('新增失败')
        this.setData({
          requestOK: false
        })
      } else {
        wx.removeStorage({
          key: 'address',
          success: function (res) { },
        })
        wx.removeStorage({
          key: 'tdata',
          success: function (res) { },
        })
        wx.removeStorage({
          key: 'time',
          success: function (res) { },
        })
        wx.removeStorageSync('type')
        this.setData({
          addressId: res.data.data.customer_address_add.customer_address_id
        })
        this.updateSelectedAddress();
        wx.setStorage({
          key: 'addressId',
          data: res.data.data.customer_address_add.customer_address_id,
        })
        if (this.data.isMine) {
          wx.redirectTo({
            url: '/pages/myAddress/myAddress',
          })
        } else {
          wx.redirectTo({
            url: '/pages/subOrder/subOrder',
          })
        }
      }
    },{"mts":mtsCode})
  },
  switch1Change(options){
    this.setData({
      isDefault:options.detail.value
    })
  },

  editerSave() {
    if (!this.check() && !this.data.requestOk) { return false; }
    this.setData({
      requestOK: true
    })
    app.getmstCode(res => {
      this.editerSaveFn(res.data.data.apicode.code)
    })
  },
  editerSaveFn(mstCode){
    app.req({ "query": 'mutation{customer_address_update (customer_address_input:{customer_address_id:"' + this.data.addressId + '",username:"' + this.data.userName + '",phone:"' + this.data.phone + '",province:"' + this.data.ad_info.province + '",city:"' + this.data.ad_info.city + '",district:"' + this.data.ad_info.district + '",address:"' + this.data.address + '",lbs_lat:"' + this.data.location.lat + '",lbs_lng:"' + this.data.location.lng + '",default_address:' + Number(this.data.isDefault) + ',sub_address:"' + this.data.detailed + '"}){customer_address_id,customer_id}}'}, res => {
      if (res.data.errors && res.data.errors.length > 0 || res.data.data == null) {
        console.log('更新错误')
        this.setData({
          requestOk: false
        })
      } else {
        wx.removeStorage({
          key: 'tdata',
          success: function (res) { },
        })
        wx.removeStorage({
          key: 'editer',
          success: function (res) { },
        })
        this.setData({
          addressId: res.data.data.customer_address_update.customer_address_id
        })
        wx.setStorage({
          key: 'addressId',
          data: res.data.data.customer_address_update.customer_address_id,
        })
        this.updateSelectedAddress();
        console.log(this.data.isMine)
        if (this.data.isMine) {
          wx.redirectTo({
            url: '/pages/myAddress/myAddress',
          })
        } else {
          wx.redirectTo({
            url: '/pages/subOrder/subOrder',
          })
        }
      }
    }, { "mst": mstCode})
  },
  updateSelectedAddress(){
    wx.setStorage({
      key: 'selectedAddress',
      data: { 
        "customer_address_id": this.data.addressId, 
        "username": this.data.userName, 
        "phone": this.data.phone, 
        "address": this.data.address, 
        "sub_address": this.data.detailed 
        },
    })
  },
  delAddress(){
    if(!this.data.requestOk){return false;}
    this.setData({
      requestOk:true
    })
    app.getmstCode(res => {
      this.delAddressFn(res.data.data.apicode.code)
    })
  },
  delAddressFn(mstCode){
    app.req({ "query": 'mutation{customer_address_delete(customer_address_id:"' + this.data.addressId + '"){status}}'}, res => {
      if (typeof res.data.data.customer_address_delete.status != undefined && res.data.data.customer_address_delete.status == 0) {
        
        wx.showToast({
          title: '删除成功',
          duration: 2000
        })
        wx.getStorage({
          key: 'selectedAddress',
          success: res => {
            if (res.data.customer_address_id == this.data.addressId) {
              wx.removeStorage({
                key: 'selectedAddress',
                success: function (res) { },
              })
            }
          },
        })
        setTimeout(() => {
          wx.redirectTo({
            url: this.data.isMine ? '/pages/myAddress/myAddress' : '/pages/addressList/addressList',
            success: res => {
              var page = getCurrentPages().pop();
              if (page == undefined || page == null) return;
              page.onLoad();
            }
          })
        }, 2000)
      } else {
        this.setData({
          requestOk: false
        })
        wx.showToast({
          title: '删除失败',
          duration: 2000
        })
      }
    }, { "mst": mstCode})
  }
})