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
    // polyline: [{
    //   points: [{
    //     longitude: 113.3245211,
    //     latitude: 23.10229
    //   }, {
    //     longitude: 113.324520,
    //     latitude: 23.21229
    //   }],
    //   color: "#FF0000DD",
    //   width: 2,
    //   dottedLine: true
    // }],
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