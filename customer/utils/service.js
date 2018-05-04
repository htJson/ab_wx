var req=function(url,header,data,fn){
  wx.request({
    url: url,
    method:"POST",
    header:header,
    data:data,
    success:res=>{
      return typeof fn == "function" && fn(res)
    },
    fail:res=>{
      return typeof fn == "function" && fn(res)
    }
  })
}
module.exports={
  req:req
}