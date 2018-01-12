Page({

  /**
   * 页面的初始数据
   */
  data: {
    trainList:[
      {
        imgUrl:'../../images/001.jpg',
        title:'保洁',
        hour:'40',
        type:'面授',
        typeNum:false,
        credit:'100',
        startTime: '2013/12/03',
        endTime: '2020/12/08',
        centum:'20'
      },
      { 
        imgUrl: '../../images/002.jpg',
        title: '母婴',
        hour:'50',
        type:'在线',
        typeNum:true,
        credit:'90',
        startTime:'2019/12/03',
        endTime:'2020/12/08',
        centum: '50'
      }
    ],
    coursesList: [
      {
        startTime: '2019/12/02 10:30:20',
        id:'2',
        curTitle: '月嫂',
        typeName: '面授',
        isRead: true,
        title: '月嫂的注意事项',
        schoolDddress: '智学苑301',
        schoolName: '智学苑北京东城职业大学'
      },
      {
        startTime: '2019/12/02 10:30:20',
        id:'4',
        curTitle: '月嫂',
        isRead: false,
        typeName: '面授',
        title: '月嫂的注意事项',
        schoolDddress: '智学苑301',
        schoolName: '智学苑北京东城职业大学'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.request({  //请求token;
      url: 'http://10.10.30.65:8080/oauth/token', //仅为示例，并非真实的接口地址
      data: {
        x: '',
        y: ''
      },
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': 'Basic Y2xpZW50OiBzZWNyZXQ='
      },
      success: function (res) {
        console.log(res.data)
      }
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },
  // 自定义事件

  toDetail: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
})