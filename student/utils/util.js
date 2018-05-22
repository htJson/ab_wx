const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

var getNowDate=function(){
  var time=getDate();
}

var randomWord = function (randomFlag, min, max) {
  var str = "",
    range = min, arr = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  // 随机产生
  if (randomFlag) {
    range = Math.round(Math.random() * (max - min)) + min;
  }
  for (var i = 0; i < range; i++) {
    var pos = Math.round(Math.random() * (arr.length - 1));
    str += arr[pos];
  }
  return str;
}
var getTime=function(){
  var d=new Date();
  return d.getTime();
}
var getTowHoursMin=function(){
  var addTime= 60*60*1000*2;
  var nowTime=new Date().getTime();
  var  newMin= addTime +nowTime;
  return newMin;
}
var getTowMonthTime =function(){
  var addTime=1000*60*60*24*60;
  var nowTime = new Date().getTime();
  var all=nowTime+addTime;
  return all;
}

module.exports = {
  formatTime: formatTime,
  randomWord: randomWord,
  getTime: getTime,
  getTowHoursMin: getTowHoursMin,
  getTowMonthTime: getTowMonthTime
}