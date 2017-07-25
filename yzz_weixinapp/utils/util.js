//获取应用实例
var app = getApp()

var Guid = require('./GUID.js');

//将date格式的数据转成  hh:mm:ss 字符串格式
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  //return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  return [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//log接口封装
function log(obj) {
  console.log('<' + formatTime(new Date(Date.now())) + '>' + ' ' + obj)

  //往用户缓存去写
  // var logs = wx.getStorageSync('logs') || []
  // logs.unshift('[' + formatTime(new Date(Date.now())) + ']' + ' ' + obj)
  // wx.setStorageSync('logs', logs)
}

//获取用户唯一标识，NLI接口中要上传用户唯一标识，这里获取微信号所在地+昵称
function getUserUnique(userInfo) {
  var unique = Guid.NewGuid();
  if (userInfo != null) {
    unique = userInfo.province + '_' + userInfo.nickName;
  }
  log('getUserUnique() return:' + unique)
  return unique;
}

module.exports = {
  formatTime: formatTime,
  log: log,
  getUserUnique: getUserUnique
}
