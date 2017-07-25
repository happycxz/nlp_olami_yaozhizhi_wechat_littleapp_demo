//app.js

const corpusList = require('./config').corpus
var UTIL = require('./utils/util.js');

App({
  onShow: function () {
    UTIL.log('App Show')
  },
  onHide: function () {
    UTIL.log('App Hide')
  },
  onLaunch: function () {
    UTIL.log('App Launch')
    this.updateUserLocation()
  },

  updateUserLocation: function() {
    var that = this
    wx.getLocation({
      //type: 'wgs84',  // gps原始坐标
      type: 'gcj02', //国家标准加密坐标
      success: function (res) {
        that.globalData.latitude = res.latitude
        that.globalData.longitude = res.longitude
        that.globalData.speed = res.speed
        //var accuracy = res.accuracy
        UTIL.log('REFRESH LOCATION: ' + that.globalData.latitude + ' | ' + that.globalData.longitude + ' , speed: ' + that.globalData.speed)
      },
      fail: function(res) {
        UTIL.log('REFRESH LOCATION FAILED...')
      }
    })
  },

  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              that.globalData.custId = UTIL.getUserUnique(that.globalData.userInfo);
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        },
        fail: function () {
          UTIL.log('登录WX失败了！')
        }
      })
    }
  },

  clearUserInfo: function() {
    var that = this
    that.globalData.userInfo = null;
    that.globalData.hasLogin = false;
  },

  globalData:{
    userInfo:null,
    corpus: corpusList,
    custId: '',
    latitude: 0.0,
    longitude: 0.0,
    speed: 0,
  }
})
