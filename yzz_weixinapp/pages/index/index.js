//获取应用实例
var app = getApp()

var UTIL = require('../../utils/util.js');
var GUID = require('../../utils/GUID.js');
var NLI = require('../../utils/NLI.js');

var cursor = 0;
var lastYYYTime = new Date().getTime();

var domainCorpus = '';
var lastCorpus = '';


Page({

  isShow: false,

  /**
   * 页面的初始数据
   */
  data: {
    //调试后门
    isDbg: false,
    //输入框文本
    inputTxt: '',
    //输出框文本
    outputTxt: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    UTIL.log('index.onLoad')
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo2) {
      UTIL.log('user unique 1: ' + UTIL.getUserUnique(userInfo2))
    })
    UTIL.log('user unique 2: ' + UTIL.getUserUnique(app.globalData.userInfo))
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    UTIL.log('index.onReady')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    UTIL.log('index.onShow')

    var that = this;
    that.isShow = true;

    //调用重力加速度传感API模拟摇一摇接口
    wx.onAccelerometerChange(function (e) {
      
      if (!that.isShow) {
        //当前界面不显示时不应该调用
        return
      }

      if (isBong(e.x) && isBong(e.y)) {
        if (new Date().getTime() - lastYYYTime <= 2000) {
          //1秒限制摇一次，避免摇一下触发多次请求
          UTIL.log('摇的太频繁啦，请等2秒再摇！' + e.x + ', '+ e.y + ', ' + e.z);
          return;
        }

        //更新最后一次成功摇的时间戳
        lastYYYTime = new Date().getTime()

        //从语料库中挑选语料运行语义理解，显示结果
        var selectedCorpus = selectCorpusRunNli(that);

        //弹Toast窗提示当前刷到哪句语料
        wx.showToast({
          title: selectedCorpus,
          icon: 'success',
          duration: 1500
        });
      }
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    UTIL.log('index.onHide')
    //页面隐藏后，关掉摇一摇检测
    wx.stopAccelerometer();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    UTIL.log('index.onUnload')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    UTIL.log('index.onPullDownRefresh')
    
    wx.stopPullDownRefresh();

    //页面下拉，触发轮换语料理解
    selectCorpusRunNli(this)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    UTIL.log('index.onReachBottom')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    UTIL.log('index.onShareAppMessage')

    wx.showToast({
      title: '谢谢分享！',
      icon: 'success',
      duration: 1500
    });
  },

  switchChange: function (e) {
    UTIL.log('index.switchChange by:' + e.detail.value)
  },

  //输入文本框聚焦触发清除输入框中的内容
  bindFocusClear: function(e) {
    UTIL.log('index.bindFocusClear')
    if (e.detail.value === '') {
      return;
    }

    UTIL.log('clear: ' + e.detail.value)
    var self = this;
    self.setData({
      inputTxt: ''
    });
  },

  //点击完成按钮时触发
  bindConfirmControl: function(e) {
    var inputTxt = e.detail.value;
    UTIL.log('index.bindConfirmControl input string: ' + inputTxt);

    //手动打字输入语料运行语义理解
    singleCorpusRunNli(inputTxt, this)
  },

  //测试按钮触发事件
  bindTest: function () {
    UTIL.log('index.bindTest')

    //测试按钮替代摇一摇，从语料库中选语料测试
    selectCorpusRunNli(this)
  },

  //快捷按钮触发语料运行语义理解
  bindCorpusGenerator: function (e) {
    UTIL.log('index.bindCorpusGenerator')
    //获取"data-cp"中的语料
    var corpusList = e.target.dataset.cp.split('|');

    //默认头一次（或新切换时）点击，选用第一句语料
    var corpus = corpusList[0];
    if (domainCorpus !== corpusList[0]) {
      domainCorpus = corpusList[0];
    } else {
      //否则在语料表中随机挑选一个
      corpus = UTIL.getRandomItem(corpusList);

      //与上一句重复就换一句
      if (lastCorpus === corpus) {
        corpus = UTIL.getRandomItem(corpusList);
        if (lastCorpus === corpus) {
          corpus = UTIL.getRandomItem(corpusList);
          if (lastCorpus === corpus) {
            corpus = UTIL.getRandomItem(corpusList);
          }
        }
      }
    }

    //记录最近一次使用的语料
    lastCorpus = corpus;

    singleCorpusRunNli(corpus, this);
  },

  turnToNew: function() {
    wx.navigateBack({
    })
  }
})


//处理NLI语义结果
function NliProcess(corpus, self) {
  var nliResult;
  NLI.process(corpus, function (isSuccess, result) {
    if (isSuccess) {
    } else {
      
    }

    var sentenceResult;
    try {
      var resultJson = JSON.parse(result);
      nliResult = resultJson.nli;
      UTIL.log("NLI RESULT IS:" + nliResult);
      sentenceResult = NLI.getSentenceFromNliResult(nliResult);
    } catch (e) {
      UTIL.log('NliProcess() 错误' + e.message + '发生在' + e.lineNumber + '行');
      sentenceResult = '没明白你说的，换个话题？'
    }

    typeof self !== 'undefined' && self.setData({
      outputTxt: sentenceResult
    })
  })
}

//如输入是dbg且确认，则切换到debug模式，多显示两个按钮
function singleCorpusRunNli(inputTxt, self) {
  if (inputTxt === 'dbg' || inputTxt === 'DBG' || inputTxt === 'Dbg') {
    self.setData({
      //打开调试按钮
      isDbg: true,
      inputTxt: ''
    });
    // 打开调试
    wx.setEnableDebug({
      enableDebug: true
    })
    return;
  } else if(inputTxt === 'gbd' || inputTxt === 'GBD' || inputTxt === 'Gbd') {
    self.setData({
      //关闭调试按钮
      isDbg: false,
      inputTxt: ''
    });
    // 关闭调试
    wx.setEnableDebug({
      enableDebug: false,
    })
    return;
  }

  //正常用户输入文本
  if (inputTxt !== '') {
    self.setData({
      inputTxt: inputTxt
    });
    NliProcess(inputTxt, self);
  }
}

//选择预置语料运行语义理解
function selectCorpusRunNli(self) {
  var corpus = app.globalData.corpus;

  //顺序选择一句语料
  var corpusSelected = corpus[cursor]

  self.setData({
    //更新页面input框显示
    inputTxt: corpusSelected
  })

  UTIL.log('selected corpus:' + corpusSelected)
  //调用语料处理，刷新输出框结果
  NliProcess(corpusSelected, self);

  //光标后移，备下次挑选下一条语料
  if (cursor++ >= corpus.length - 1) {
    cursor = 0;
  }

  return corpusSelected;
}

//检测加速度传感器灵敏度
function isBong(val) {
  //目前灵敏度设置为0.8，且摇一摇只监测了x和y轴变动，具体见调用此函数的地方
  if (val >= 0.8 || val <= -0.8) {
    return true;
  }

  return false;
}