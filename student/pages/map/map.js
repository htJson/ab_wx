// map.js
Page({
  data: {
    scale:'14',
    lat:0,
    lng:0,
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
    console.log(options);
    var markLatstr = 'markers[0].latitude';
    var markLngstr = 'markers[0].longitude';

    this.setData({
      lat:options.lat,
      lng:options.lng,
      [markLatstr]:options.lat,
      [markLngstr]:options.lng
    })
    console.log(this.data.markers[0])
  },
  regionchange(e) {
    console.log(e.type)
  },
  markertap(e) {
    console.log(e.markerId)
  },
  controltap(e) {
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