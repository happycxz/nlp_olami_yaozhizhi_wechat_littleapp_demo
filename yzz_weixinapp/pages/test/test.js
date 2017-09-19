var page = undefined;

var UTIL = require('../../utils/util.js');

Page({
  onLoad: function () {
    page = this;

    wx.getSystemInfo({
      success: function (res) {
        UTIL.log('system info:' + JSON.stringify(res))
      }
    })

  },
  bindbt: function () {
    var timer = setInterval(this.addDoomm, 1000)
  },
  data: {
    doommData: []
  },

  addDoomm : function() {
    if (doommList.length < 5) {
      doommList.push(new Doomm("弹幕测试程序", Math.ceil(Math.random() * 40 + 50), Math.ceil(Math.random() * 10 + 10), getRandomColor()));
      this.setData({
        doommData: doommList
      })
    }
  }
})

var doommList = [];
var i = 0;
class Doomm {
  constructor(text, top, time, color) {
    this.text = text + i;
    this.top = top;
    this.time = time;
    this.color = color;
    this.display = true;
    let that = this;
    this.id = i++;
    setTimeout(function () {
      doommList.splice(doommList.indexOf(that), 1);
      page.setData({
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