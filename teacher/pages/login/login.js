var app = getApp();
Page({
  data: {
    radioItems: [
      { name: 'man', value: '男' },
      { name: 'woman', value: '女', },
    ],
    phone:'',
    idCord:'',
    errorTip:'',
    isDisabled:false
  },
  onLoad: function (options) {
    this.getUserNews();
  },

  getphone(options){
    
    // 获取手机号
    this.setData({
      phone: options.detail.value
    })
  },
  getIdCord(options){
    // 获取身份证号
    this.setData({
      idCord: options.detail.value
    })
  },
  checkOut(){
    var phoneReg = /^[1][3,4,5,7,8][0-9]{9}$/;
    var idNumReg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!idNumReg.test(this.data.idCord)) {
      this.setData({
        errorTip: '身份证号填写不正确'
      })
    }
    if (!phoneReg.test(this.data.phone)) {
      this.setData({
        errorTip: '手机号填写不正确'
      })
    }
    return phoneReg.test(this.data.phone) && idNumReg.test(this.data.idCord)
  },
  submitForm(){
    if(!this.checkOut()){return false}
    this.setData({
      errorTip:''
    })
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: 'mutation{my_teacher_binduser(phone: "' + this.data.phone + '", id_num: "' + this.data.idCord + '"){status}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        var data = res.data.my_teacher_binduser;
        if (res.data.errors != undefined) {
          this.setData({
            errorTip: res.data.errors[0].message
          })
          return false;
        } else {
          wx.switchTab({
            url: '../index/index',
          })
        }
      }
    })
  },
  getUserNews(){
    wx.request({
      url: app.data.dev,
      method: 'POST',
      data: {
        query: 'query{my_teacher_bindinfo{phone,identity_card}}'
      },
      header: {
        "content-type": 'application/json', // 默认值
        "Authorization": app.globalData.token
      },
      success:res=>{
        
        if (res.data.data.my_teacher_bindinfo == null || res.errors != undefined) { return false }
        var data = res.data.data.my_teacher_bindinfo;

        var midden = data.phone.substring(3, data.phone.length - 3).replace(/\d/g, function (v) { return '*' });
        var phone = data.phone.substr(0, 3) + midden + data.phone.substr(-3, 3);
        console.log(data.identity_card.substring(3, data.identity_card.length - 3).length)
        var cmidden = data.identity_card.substring(3, data.identity_card.length - 3).replace(/\d/g, function (v) { return '*' });
        var card = data.identity_card.substring(0, 3) + cmidden + data.identity_card.substr(-3, 3)
        this.setData({
          phone: phone,
          idCord: card,
          isDisabled: true
        })
      }
    })
  }
})