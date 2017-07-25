//logs.js
var util = require('../../utils/util.js')
Page({
  data: {
    logs: []
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(function (log) {
        var DATE = new Date(log);
        if (typeof DATE === 'date') {
          //当log是一个毫秒数，延用官方的案例，转成对应时间存LOG中（util.formatTime被我改成只输出时分秒）
          return util.formatTime(new Date(log))
        }
        
        //非毫秒数时，记录LOG原始内容，不作转换
        return log;
      })
    })
  }
})
