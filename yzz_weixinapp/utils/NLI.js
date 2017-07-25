/*
  对接olami免费开放语义平台的NLI接口
*/

//获取应用实例
var app = getApp()

const appkey = require('../config').appkey
const appsecret = require('../config').appsecret

var MD5 = require('./MD5.js');
var UTIL = require('./util.js');

const requestUrl = "https://cn.olami.ai/cloudservice/api";
const api = "nli";


function getLocationJson() {
  var lat = app.globalData.latitude;
  var lng = app.globalData.longitude;
  if (lat < 180 && lng < 180) {
    lat *= 1000000;
    lng *= 1000000;
  }

  return { "position_type": 0, "longitude": lng, "latitude": lat };
}

//NLI接口访问
//参数：corpus为句子；cb为回调函数（带两个参数，第一个参数表示调用NLI是否成功，第二个参数是NLI的返回数据）
function process(corpus, cb) {
  var timestamp = new Date().getTime();
  var originalSign = appsecret + "api=" + api + "appkey=" + appkey + "timestamp=" + timestamp + appsecret;
  var sign = MD5.md5(originalSign);

  var locationJson = getLocationJson();
  var rqdataJson = { "data": { "input_type": 1, "text": corpus, "location": locationJson }, "data_type": "stt" };
  var rqdata = JSON.stringify(rqdataJson);

  UTIL.log('input:' + rqdata + '\r\n, custId:' + app.globalData.custId + ', originalSign:' + originalSign);

  wx.request({
    url: requestUrl,
    data: {
      appkey: appkey,
      api: api,
      timestamp: timestamp,
      sign: sign,
      rq: rqdata,
      cusid: app.globalData.custId,
    },
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    method: 'POST',
    success: function (result) {
      var data = result.data.data;
      var jsonData = JSON.stringify(data);
      typeof cb == "function" && cb(true, jsonData)
    },
    fail: function ({errMsg}) {
      typeof cb == "function" && cb(false, jsonData)
    }
  })
}

module.exports = {
  process: process,
}