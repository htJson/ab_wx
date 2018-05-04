// Pages/login/login.js
var app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    radioItems: [
      { name: 'man', value: '男', checked:true},
      { name: 'woman', value: '女', checked:false},
    ],
    phone:'',
    idNum:'',
    isEditer:true,
    errorTip:'',
    errorNews:{},
    isDisabled:false,
  },
  onLoad: function (options) {
    this.getUserNews();
  },

  getUserNews(){
    app.req({ "query": 'query{my_student_bindinfo{phone,identity_card}}' }, res => {
      if (res.data.data.my_student_bindinfo == null || res.errors != undefined) { return false }
      this.setData({
        isEditer: false
      })
      var data = res.data.data.my_student_bindinfo;
      var midden = data.phone.substring(3, data.phone.length - 1).replace(/\d/g, function (v) { return '*' });
      var phone = data.phone.substr(0, 3) + midden + data.phone.substr(-1, 1);
      var cmidden = data.identity_card.substr(3, data.identity_card.length - 3).replace(/\d/g, function (v) { return '*' });
      var card = data.identity_card.substring(0, 3) + cmidden + data.identity_card.substr(-1, 1)
      this.setData({
        isBind: true,
        phone: phone,
        idNum: card,
        isDisabled: true
      })
    })
  },
  phoneInupt(e){
    this.setData({
      phone:e.detail.value
    })
  },
  idNumInput(e) {
    this.setData({
      idNum: e.detail.value
    })
  },
  checkoutData(){
    var phoneReg =/^[1][3,4,5,7,8][0-9]{9}$/;
    var idNumReg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
    if (!idNumReg.test(this.data.idNum)){
      this.setData({
        errorTip:'身份证号填写不正确'
      })
    }
    if (!phoneReg.test(this.data.phone)){
      this.setData({
        errorTip:'手机号填写不正确'
      })
    }
    return phoneReg.test(this.data.phone) && idNumReg.test(this.data.idNum)
  },
  bindUser(){
    if(!this.checkoutData()){return false;}
    this.setData({
      errorTip:''
    })
    app.req({ "query": ['mutation{my_student_binduser(phone:"', this.data.phone, '",id_num:"', this.data.idNum, '"){status}}'].join('') }, res => {
      if (res.data.errors != undefined) {
        if (res.data.errors[0].errcode == '40103') {
          this.setData({
            errorTip: '该学生已被绑定'
          })
          return false;
        } else if (res.data.errors[0].errcode == '40101') {
          this.setData({
            errorTip: '没有该学生信息'
          })
          return false;
        } else {
          this.setData({
            errorTip: res.data.errors.message
          })
        }
      } else {
        wx.switchTab({
          url: '../index/index',
          success: function (e) {
            // var nq=getCurrentPages().pop();
            // if(nq == null || nq == undefined) return false;
            // nq.onLoad();
          }
        })
        console.log('跳转前==============')
      }
    })
  }
})