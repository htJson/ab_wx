// pages/uploadFile/uploadFile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    urls:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  selectedFile(){
    wx.chooseImage({
      count: 4, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res=> {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        this.setData({
          urls:tempFilePaths
        })
        this.uploadImage(tempFilePaths)
        // console.log(this.data.urls)
        // this.prevImage(res.tempFiles)
      }
    })
  },
  uploadImage(tempFilePaths){
    var str = tempFilePaths[0]
    var uploadTask=wx.uploadFile({
      url: 'https://test-auth.aobei.com', //仅为示例，非真实的接口地址
      filePath: str,
      name: 'file',
      formData: {
        'user': 'test'
      },
      success: function (res) {
        var data = res.data
        console.log(data,'=====')
        //do something
      }
    })
    uploadTask.onProgressUpdate((res) => {
      console.log('上传进度', res.progress)
      console.log('已经上传的数据长度', res.totalBytesSent)
      console.log('预期需要上传的数据总长度', res.totalBytesExpectedToSend)
    })
  },
  prevImage(imgarr){
    // 预览图片
    wx.previewImage({
      current: '', // 当前显示图片的http链接
      urls: imgarr // 需要预览的图片http链接列表
    })
  }
})