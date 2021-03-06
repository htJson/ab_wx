// map.js
Page({
  data: {
    scale:'14',
    markers: [{
      iconPath: "../../images/place.png",
      id: 0,
      latitude: 23.099994,
      longitude: 113.324520,
      width: 20,
      height:30,
      callout:{
        padding:20,
        bgColor:'#fff',
        content:"这是坐标"
      }
    }],
   
    controls: [
      {
        id: 1,
        iconPath: '../../images/add.png',
        position: {
          left: 50,
          top: 610-50,
          width: 30,
          height: 30
        },
        clickable: true
      },
      {
        id: 2,
        iconPath: '../../images/redut.png',
        position: {
          left: 0,
          top: 600 - 50,
          width: 50,
          height: 50
        },
        clickable: true
      },
    ]
  },
  onLoad(options){
    var latstr = 'markers[0].latitude';
    var lngstr ='markers[0].longitude';
    this.setData({
      latitude:options.lat,
      longitude:options.lng,
      [latstr]: options.lat,
      [lngstr]:options.lng
    })
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
    console.log(e.controlId,'===')
    if(e.controlId == 1){
      this.setData({
        scale: ++this.data.scale
      })
    }else if(e.controlId ==2){
      this.setData({
        scale: --this.data.scale
      })
    }
  }
})