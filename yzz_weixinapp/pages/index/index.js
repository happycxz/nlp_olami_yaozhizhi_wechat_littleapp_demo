// index.js

//获取应用实例
var app = getApp()

var UTIL = require('../../utils/util.js');
var GUID = require('../../utils/GUID.js');
var NLI = require('../../utils/NLI.js');

var cursor = 0;
var lastYYYTime = new Date().getTime();

var domainCorpus = '';
var lastCorpus = '';


function log(obj) {
  UTIL.log(obj)
}

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
    log('index.onLoad')
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function (userInfo2) {
      log('user unique 1: ' + UTIL.getUserUnique(userInfo2))
    })
    log('user unique 2: ' + UTIL.getUserUnique(app.globalData.userInfo))
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    log('index.onReady')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    log('index.onShow')

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
          log('摇的太频繁啦，请等2秒再摇！' + e.x + ', '+ e.y + ', ' + e.z);
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
    log('index.onHide')
    //页面隐藏后，关掉摇一摇检测
    wx.stopAccelerometer();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    log('index.onUnload')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    log('index.onPullDownRefresh')
    
    wx.stopPullDownRefresh();

    //页面下拉，触发轮换语料理解
    selectCorpusRunNli(this)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    log('index.onReachBottom')
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    log('index.onShareAppMessage')

    wx.showToast({
      title: '谢谢分享！',
      icon: 'success',
      duration: 1500
    });
  },

  switchChange: function (e) {
    log('index.switchChange by:' + e.detail.value)
  },

  //输入文本框聚焦触发清除输入框中的内容
  bindFocusClear: function(e) {
    log('index.bindFocusClear')
    if (e.detail.value === '') {
      return;
    }

    log('clear: ' + e.detail.value)
    var self = this;
    self.setData({
      inputTxt: ''
    });
  },

  //点击完成按钮时触发
  bindConfirmControl: function(e) {
    var inputTxt = e.detail.value;
    log('index.bindConfirmControl input string: ' + inputTxt);

    //手动打字输入语料运行语义理解
    singleCorpusRunNli(inputTxt, this)
  },

  //测试按钮触发事件
  bindTest: function () {
    log('index.bindTest')

    //测试按钮替代摇一摇，从语料库中选语料测试
    selectCorpusRunNli(this)
  },

  //快捷按钮触发语料运行语义理解
  bindCorpusGenerator: function (e) {
    log('index.bindCorpusGenerator')
    //获取"data-cp"中的语料
    var corpusList = e.target.dataset.cp.split('|');

    //默认头一次（或新切换时）点击，选用第一句语料
    var corpus = corpusList[0];
    if (domainCorpus !== corpusList[0]) {
      domainCorpus = corpusList[0];
    } else {
      //否则在语料表中随机挑选一个
      corpus = getRandomItem(corpusList);

      //与上一句重复就换一句
      if (lastCorpus === corpus) {
        corpus = getRandomItem(corpusList);
        if (lastCorpus === corpus) {
          corpus = getRandomItem(corpusList);
          if (lastCorpus === corpus) {
            corpus = getRandomItem(corpusList);
          }
        }
      }
    }

    //记录最近一次使用的语料
    lastCorpus = corpus;

    singleCorpusRunNli(corpus, this);
  }
})

//从语料数组中随机挑选一条语料
function getRandomItem(corpusList) {
  var ret = corpusList[0];
  ret = corpusList[Math.floor(Math.random() * corpusList.length)];
  return ret;
}

//解析NLI接口返回的数据，从语义结果中筛选出适合显示的文本内容
function getSentenceFromNliResult(nliResult) {
  var sentence;
  try {
    var resultJson = JSON.parse(nliResult);
    var nliArray = resultJson.nli;
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
        case 'joke' :
        case 'story' :
          sentence = singleResult.data_obj[0].content;
          break;
        case 'poem' :
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
        case 'baike' :
          var filedNames = singleResult.data_obj[0].field_name;
          var filedValues = singleResult.data_obj[0].field_value;
          for (var k = 0; k < filedNames.length; k++) {
            content += filedNames[k] + ' : ' + filedValues[k] + '\n';
          }
          break;
        case 'news' :
          if (tagType === 1) {
            for (var k = 0; k < singleResult.data_obj.length; k++) {
              content += singleResult.data_obj[k].title + '\n';
              content += singleResult.data_obj[k].detail + '…………\n';
              content += '【欲看此条新闻详情请说第' + (k+1) + '个，或拷此链接到浏览器中打开：' + singleResult.data_obj[k].ref_url + '】\n\n';
            }
          } else if (tagType === 0) {
            content = singleResult.data_obj[0].detail;
          }
          break;
        case 'stock' :
          var nowHour = new Date().getHours();
          var isKaiPan = (nowHour >= 9) && (nowHour <= 15);
          for (var k = 0; k < singleResult.data_obj.length; k++) {
            content += singleResult.data_obj[k].name + ' : ' + singleResult.data_obj[k].id + '\n';
            content += '开盘：' + singleResult.data_obj[k].price_start + '\n';
            if (isKaiPan) {
              content += '现价（' + getHHMMSS(singleResult.data_obj[k].time) + '）：' + singleResult.data_obj[k].cur_price + '\n';
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
        defalt :
          break;
      }
      if (content !== '') {
        sentence += '\n\n' + content;
      }
      log('NLI返回sentence:' + sentence)
    }
  } catch (e) {
    log('错误' + e.message + '发生在' + e.lineNumber + '行');
    sentence = '没明白你说的，换个话题？'
  }
  
  if (typeof sentence === 'undefined' || sentence === '') {
    sentence = '没明白你说的什么意思';
  }

  return sentence;
}

//由 毫秒数字符串 获取  HH:mm:ss 格式时间
function getHHMMSS(dateStr) {
  var dateVal = new Date(parseInt(dateStr));
  var hh = dateVal.getHours()
  var mm = dateVal.getMinutes()
  var ss = dateVal.getSeconds()

  return ((hh >= 10) ? hh : '0' + hh) + ':' + ((mm >= 10) ? mm : '0' + mm) + ':' + ((ss >= 10) ? ss : '0' + ss)
}

//处理NLI语义结果
function NliProcess(corpus, self) {
  var nliResult;
  NLI.process(corpus, function (isSuccess, result) {
    if (isSuccess) {
    } else {
    }
    nliResult = result;
    log("NLI RESULT IS:" + nliResult);
    typeof self !== 'undefined' && self.setData ({
      outputTxt: getSentenceFromNliResult(nliResult)
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

  log('selected corpus:' + corpusSelected)
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