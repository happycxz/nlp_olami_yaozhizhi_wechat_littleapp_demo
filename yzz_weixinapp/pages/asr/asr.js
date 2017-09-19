/**
 * 作者：happycxz
 * 时间：2017.09.19
 * 源码分享链接：http://blog.csdn.net/happycxz/article/details/78024986
 * 
 * https的silk语音识别API（专供微信小程序调用）：https://api.happycxz.com/test/silk2asr/olami/asr
 * 该API服务搭建全过程解析及源码分享贴：http://blog.csdn.net/happycxz/article/details/78016299
 * 需要使用此API请联系作者QQ：404499164
 * 
 * 遵循开放、分享、自由、免费的精神，把开源坚持到底
 */

//获取应用实例 
var app = getApp()

var UTIL = require('../../utils/util.js');
var GUID = require('../../utils/GUID.js');
var NLI = require('../../utils/NLI.js');

const appkey = require('../../config').appkey
const appsecret = require('../../config').appsecret

//弹幕定时器
var timer;

var pageSelf = undefined;

var doommList = [];
class Doomm {
  constructor() {
    this.text = UTIL.getRandomItem(app.globalData.corpus);
    this.top = Math.ceil(Math.random() * 40);
    this.time = Math.ceil(Math.random() * 8 + 6);
    this.color = getRandomColor();
    this.display = true;
    let that = this;
    setTimeout(function () {
      doommList.splice(doommList.indexOf(that), 1);
      doommList.push(new Doomm());

      pageSelf.setData({
        doommData: doommList
      })
    }, this.time * 1000)
  }
}
function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}

Page({
  data: {
    j: 1,//帧动画初始图片 
    isSpeaking: false,//是否正在说话
    outputTxt : "", //输出识别结果

    doommData: []
  },

  initDoomm: function () {
    doommList.push(new Doomm());
    doommList.push(new Doomm());
    doommList.push(new Doomm());
    this.setData({
      doommData: doommList
    })
  },

  onLoad: function () {
    pageSelf = this;
    this.initDoomm();
  },

  //手指按下 
  touchdown: function () {
    UTIL.log("手指按下了... new date : " + new Date)
    var _this = this;
    speaking.call(this);
    this.setData({
      isSpeaking: true
    })
    //开始录音 
    wx.startRecord({
      success: function (res) {
        //临时路径,下次进入小程序时无法正常使用
        var tempFilePath = res.tempFilePath;
        UTIL.log('record SUCCESS file path:' + tempFilePath)
        _this.setData({
          recordPath: tempFilePath
        });
      },
      fail: function (res) {
        //录音失败 
        wx.showModal({
          title: '提示',
          content: '录音的姿势不对!',
          showCancel: false,
          success: function (res) {
            if (res.confirm) {
              UTIL.log('用户点击确定')
              return
            }
          }
        })
      }
    })
  },
  //手指抬起 
  touchup: function () {
    UTIL.log("手指抬起了...")
    this.setData({
      isSpeaking: false,
    })
    clearInterval(this.timer)
    wx.stopRecord()

    var _this = this
    setTimeout(function () {
      var urls = "https://api.happycxz.com/test/silk2asr/olami/asr";
      UTIL.log(_this.data.recordPath);
      wx.uploadFile({
        url: urls,
        filePath: _this.data.recordPath,
        name: 'file',
        formData: { "appKey": appkey, "appSecret": appsecret, "userId": UTIL.getUserUnique() },
        header: { 'content-type': 'multipart/form-data' },
        success: function (res) {
          UTIL.log('res.data:' + res.data);

          var nliResult = getNliFromResult(res.data);
          UTIL.log('nliResult:' + nliResult);
          var stt = getSttFromResult(res.data);
          UTIL.log('stt:' + stt);

          var sentenceResult;
          try {
            sentenceResult = NLI.getSentenceFromNliResult(nliResult);
          } catch (e) {
            UTIL.log('touchup() 错误' + e.message + '发生在' + e.lineNumber + '行');
            sentenceResult = '没明白你说的，换个话题？'
          }

          var lastOutput = "==>语音识别结果：\n" + stt + "\n\n==>语义处理结果：\n" + sentenceResult;
          _this.setData({
            outputTxt: lastOutput,
          });
          wx.hideToast();
        },
        fail: function (res) {
          UTIL.log(res);
          wx.showModal({
            title: '提示',
            content: "网络请求失败，请确保网络是否正常",
            showCancel: false,
            success: function (res) {
            }
          });
          wx.hideToast();
        }
      });
    }, 1000)
  },

  //切换到老版本
  turnToOld: function() {
    wx.navigateTo({
      url: '../index/index',
    })
  },

})

function getNliFromResult(res_data) {
  var res_data_json = JSON.parse(res_data);
  var res_data_result_json = JSON.parse(res_data_json.result);
  return res_data_result_json.nli;
}

function getSttFromResult(res_data) {
  var res_data_json = JSON.parse(res_data);
  var res_data_result_json = JSON.parse(res_data_json.result);
  return res_data_result_json.asr.result;
}

//麦克风帧动画 
function speaking() {
  var _this = this;
  //话筒帧动画 
  var i = 1;
  this.timer = setInterval(function () {
    i++;
    i = i % 5;
    _this.setData({
      j: i
    })
  }, 200);
}
