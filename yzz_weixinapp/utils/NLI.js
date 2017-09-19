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

//解析NLI接口返回的数据，从语义结果中筛选出适合显示的文本内容
function getSentenceFromNliResult(nliArray) {
  var sentence;
  try {
    for (var i = 0; i < nliArray.length; i++) {
      var singleResult = nliArray[i];
      sentence = singleResult.desc_obj.result;

      var content = '';
      var appName = singleResult.type;
      //0: normal, 1: selection, 9 : openweb
      var tagType = 0;
      if (appName === 'selection') {
        appName = singleResult.desc_obj.type;
        tagType = 1;
      } else if (appName === 'openweb') {
        //appName = singleResult.desc_obj.type;
        tagType = 9;
      }
      switch (appName) {
        case 'joke':
        case 'story':
          sentence = singleResult.data_obj[0].content;
          break;
        case 'poem':
          if (tagType === 1) {
            for (var k = 0; k < singleResult.data_obj.length; k++) {
              content += '第' + (k + 1) + '个： ' + singleResult.data_obj[k].author + '   ' + singleResult.data_obj[k].poem_name + '\n';
            }
          }
          break;
        case 'cooking':
          if (tagType === 1) {
            for (var k = 0; k < singleResult.data_obj.length; k++) {
              content += '第' + (k + 1) + '个： ' + singleResult.data_obj[k].name + '\n';
            }
          } else if (tagType === 0) {
            content = singleResult.data_obj[0].content;
          }
          break;
        case 'baike':
          var filedNames = singleResult.data_obj[0].field_name;
          var filedValues = singleResult.data_obj[0].field_value;
          for (var k = 0; k < filedNames.length; k++) {
            content += filedNames[k] + ' : ' + filedValues[k] + '\n';
          }
          break;
        case 'news':
          if (tagType === 1) {
            for (var k = 0; k < singleResult.data_obj.length; k++) {
              content += singleResult.data_obj[k].title + '\n';
              content += singleResult.data_obj[k].detail + '…………\n';
              content += '【欲看此条新闻详情请说第' + (k + 1) + '个，或拷此链接到浏览器中打开：' + singleResult.data_obj[k].ref_url + '】\n\n';
            }
          } else if (tagType === 0) {
            content = singleResult.data_obj[0].detail;
          }
          break;
        case 'stock':
          var nowHour = new Date().getHours();
          var isKaiPan = (nowHour >= 9) && (nowHour <= 15);
          for (var k = 0; k < singleResult.data_obj.length; k++) {
            content += singleResult.data_obj[k].name + ' : ' + singleResult.data_obj[k].id + '\n';
            content += '开盘：' + singleResult.data_obj[k].price_start + '\n';
            if (isKaiPan) {
              content += '现价（' + UTIL.getHHMMSS(singleResult.data_obj[k].time) + '）：' + singleResult.data_obj[k].cur_price + '\n';
            } else {
              content += '收盘：' + singleResult.data_obj[k].price_end + '\n';
            }
            content += '成交量：' + singleResult.data_obj[k].volume + '\n';
            content += '成交额：' + singleResult.data_obj[k].amount + '\n';
            content += '最高价：' + singleResult.data_obj[k].price_high + '\n\n';
          }
          break;
        case 'tvprogram':
          for (var k = 0; k < singleResult.data_obj.length; k++) {
            content += singleResult.data_obj[k].time + '   ' + singleResult.data_obj[k].name + '\n';
          }
          break;
        case 'openweb':
          content += '【拷此链接到浏览器中打开：' + singleResult.data_obj[0].url + '】\n';
          break;
          defalt:
          break;
      }
      if (content !== '') {
        sentence += '\n\n' + content;
      }
      UTIL.log('NLI返回sentence:' + sentence)
    }
  } catch (e) {
    UTIL.log('getSentenceFromNliResult() 错误' + e.message + '发生在' + e.lineNumber + '行');
    sentence = '没明白你说的，换个话题？'
  }

  if (typeof sentence === 'undefined' || sentence === '') {
    sentence = '没明白你说的什么意思';
  }

  return sentence;
}


module.exports = {
  process: process,
  getSentenceFromNliResult: getSentenceFromNliResult,
}