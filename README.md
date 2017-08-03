# nlp_olami_yaozhizhi_wechat_littleapp_demo
wechat little app, base on olami NLI inteface, named it as '遥知之' (yaozhizhi).


##微信小程序智能生活小秘书开发详解


**>>>>>>>>>>>>>>>>>>>>>>>> 欢迎转载 <<<<<<<<<<<<<<<<<<<<<<<<**

**本文原地址:[http://blog.csdn.net/happycxz/article/details/75432928](http://blog.csdn.net/happycxz/article/details/75432928)**

**“遥知之”微信小程序完整源码下载：**
CSDN: [http://download.csdn.net/download/happycxz/9919690](http://download.csdn.net/download/happycxz/9919690)
github: [https://github.com/happycxz/nlp_olami_yaozhizhi_wechat_littleapp_demo](https://github.com/happycxz/nlp_olami_yaozhizhi_wechat_littleapp_demo)


###实现功能
实现一个智能生活信息查询的小秘书功能，支持查天气、新闻、日历、汇率、笑话、故事、百科、诗词、邮编、区号、菜谱、股票、节目预告，还支持闲聊、算24点、数学计算、单位换算、购物、搜索等功能。
使用方式上支持摇一摇、点界面按钮、手动输入、下拉刷新这四种方式。

###扫码试用（左右皆可）
![小程序码小](http://img.blog.csdn.net/20170720103514998?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaGFwcHljeHo=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast) ![二维码小](http://img.blog.csdn.net/20170720103917321?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaGFwcHljeHo=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

###界面展示
![遥知之首页](http://img.blog.csdn.net/20170720101733931?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaGFwcHljeHo=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)


###开发资源
1. 免费开放语义接口平台 olami.ai
2. 微信小程序平台
3. js, css


###源码分析
![源码各文件说明](http://img.blog.csdn.net/20170720134028543?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaGFwcHljeHo=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

基本延用官方案例的目录结构和命名，index.xx是首页面相关代码，logs.xx是日志页相关代码。

比官方目录结构多了两个文件：

1. config.js
	
	因为用到一些配置，放在.js里封装起来比较好。

2. pics/bg.jpg
	
	小程序背景图片，开发环境上加载本地文件作为背景图片是生效的，预览体验时不生效，网上有人说不支持本地文件，因此这里这个图片其实没有用到，只是暂时留着。

####小程序根目录文件：app.js, app.json, app.wxss, config.js
---
**app.js**

提供获取用户微信账号昵称和所在地，获取当前地理位置这两个公共接口。

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


---
**app.json**

配置小程序窗体相关属性：标题名称，背景色，网络超时等。
配置首页面为pages/index/index。

	{
	  "pages": [
	    "pages/index/index",
	    "pages/logs/logs"
	  ],
	  "window": {
	    "backgroundTextStyle": "black",
	    "navigationBarBackgroundColor": "#F8F8F8",
	    "navigationBarTitleText": "遥知之 -- olami语义支持",
	    "navigationBarTextStyle": "black",
	    "backgroundColor": "#F8F8F8"
	  },
	  "networkTimeout": {
	    "request": 10000,
	    "connectSocket": 10000,
	    "uploadFile": 10000,
	    "downloadFile": 10000
	  }
	}

---
**app.wxss**

配置了“遥知之”小程序container全局样式

	/**app.wxss**/
	.container {
	  height: 100%;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  box-sizing: border-box;
	} 

---
**配置文件：config.js**

保存一些配置信息，包括NLI的key和secret，还有小程序中预置的语料集合。

	module.exports = {
	
	  //NLI appkey
	  appkey: `b4118cd178064b45b7c8f1242bcde31f`,
	
	  //NLI appsecret
	  appsecret: `7908028332a64e47b8336d71ad3ce9ab`,
	  
	  corpus: [
	    // '闲聊',
	    // '天气',
	    // '诗词',
	    // '单位换算',
	    // '新闻',
	    // '算24点',
	    // '菜谱',
	    // '汇率',
	    // '邮编',
	    // '区号',
	    // '股票',
	    // '日历',
	    // '节目预告',
	    // '笑话',
	    // '故事',
	    // '购物',
	    // '数学运算',
	    // '百科',
	    // '搜索',
	
	    '你今年多大啦',
	    '上海今天天气如何',
	    '北京的呢',
	    '李白写过什么诗',
	    '我要听李白的静夜思',
	    '背一首将进酒',
	    '一公里等于多少英尺',
	    '我要看体育新闻',
	    '4567算24点',
	    '红烧肉的做法',
	    '1美元能换算多少人民币',
	    '查一下南昌的邮编',
	    '郑州的区号是多少',
	    '中国石油的股价',
	    '今年中秋节是哪一天',
	    '明晚湖南卫视放什么节目',
	    '来个笑话',
	    '讲个故事听听',
	    '我要买电脑',
	    '1加到100等于多少',
	    '黄山有多高',
	    '百度搜一下薛之谦的照片',
	  ]
	};

####utils目录文件：GUID.js, MD5.js, NLI.js, util.js
---
**获取随机GUID：GUID.js**

	//表示全局唯一标识符 (GUID)。
	function Guid(g) {
	  var arr = new Array(); //存放32位数值的数组
	
	  if (typeof (g) == "string") { //如果构造函数的参数为字符串
	    InitByString(arr, g);
	  } else {
	    InitByOther(arr);
	  }
	
	  //返回一个值，该值指示 Guid 的两个实例是否表示同一个值。
	  this.Equals = function (o) {
	    if (o && o.IsGuid) {
	      return this.ToString() == o.ToString();
	    } else {
	      return false;
	    }
	  }
	
	  //Guid对象的标记
	  this.IsGuid = function () { }
	  //返回 Guid 类的此实例值的 String 表示形式。
	  this.ToString = function (format) {
	    if (typeof (format) == "string") {
	      if (format == "N" || format == "D" || format == "B" || format == "P") {
	        return ToStringWithFormat(arr, format);
	      } else {
	        return ToStringWithFormat(arr, "D");
	      }
	    } else {
	      return ToStringWithFormat(arr, "D");
	    }
	  }
	
	  //由字符串加载
	  function InitByString(arr, g) {
	    g = g.replace(/\{|\(|\)|\}|-/g, "");
	    g = g.toLowerCase();
	    if (g.length != 32 || g.search(/[^0-9,a-f]/i) != -1) {
	      InitByOther(arr);
	    } else {
	      for (var i = 0; i < g.length; i++) {
	        arr.push(g[i]);
	      }
	    }
	  }
	
	  //由其他类型加载
	  function InitByOther(arr) {
	    var i = 32;
	    while (i--) {
	      arr.push("0");
	    }
	  }
	
	  /*
	  根据所提供的格式说明符，返回此 Guid 实例值的 String 表示形式。
	  N  32 位： xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
	  D  由连字符分隔的 32 位数字 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
	  B  括在大括号中、由连字符分隔的 32 位数字：{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}
	  P  括在圆括号中、由连字符分隔的 32 位数字：(xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
	  */
	
	  function ToStringWithFormat(arr, format) {
	    switch (format) {
	      case "N":
	        return arr.toString().replace(/,/g, "");
	      case "D":
	        var str = arr.slice(0, 8) + "-" + arr.slice(8, 12) + "-" + arr.slice(12, 16) + "-" + arr.slice(16, 20) + "-" + arr.slice(20, 32);
	        str = str.replace(/,/g, "");
	        return str;
	      case "B":
	        var str = ToStringWithFormat(arr, "D");
	        str = "{" + str + "}";
	        return str;
	      case "P":
	        var str = ToStringWithFormat(arr, "D");
	        str = "(" + str + ")";
	        return str;
	      default:
	        return new Guid();
	    }
	  }
	}
	
	//Guid 类的默认实例，其值保证均为零。
	Guid.Empty = new Guid();
	
	//初始化 Guid 类的一个新实例。
	Guid.NewGuid = function () {
	  var g = "";
	  var i = 32;
	
	  while (i--) {
	    g += Math.floor(Math.random() * 16.0).toString(16);
	  }
	  return new Guid(g).ToString();
	}
	
	module.exports = {
	  NewGuid: Guid.NewGuid
	}

---
**计算MD5值：MD5.js**

	//md5加密算法
	function md5(string) {
	  var x = Array();
	  var k, AA, BB, CC, DD, a, b, c, d;
	  var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
	  var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
	  var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
	  var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
	  string = Utf8Encode(string);
	  x = ConvertToWordArray(string);
	  a = 0x67452301;
	  b = 0xEFCDAB89;
	  c = 0x98BADCFE;
	  d = 0x10325476;
	  for (k = 0; k < x.length; k += 16) {
	    AA = a;
	    BB = b;
	    CC = c;
	    DD = d;
	    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
	    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
	    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
	    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
	    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
	    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
	    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
	    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
	    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
	    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
	    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
	    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
	    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
	    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
	    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
	    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
	    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
	    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
	    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
	    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
	    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
	    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
	    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
	    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
	    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
	    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
	    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
	    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
	    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
	    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
	    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
	    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
	    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
	    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
	    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
	    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
	    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
	    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
	    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
	    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
	    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
	    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
	    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
	    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
	    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
	    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
	    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
	    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
	    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
	    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
	    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
	    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
	    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
	    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
	    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
	    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
	    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
	    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
	    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
	    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
	    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
	    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
	    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
	    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
	    a = AddUnsigned(a, AA);
	    b = AddUnsigned(b, BB);
	    c = AddUnsigned(c, CC);
	    d = AddUnsigned(d, DD);
	  }
	  var temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
	  return temp.toLowerCase();
	}
	function RotateLeft(lValue, iShiftBits) {
	  return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
	}
	function AddUnsigned(lX, lY) {
	  var lX4, lY4, lX8, lY8, lResult;
	  lX8 = (lX & 0x80000000);
	  lY8 = (lY & 0x80000000);
	  lX4 = (lX & 0x40000000);
	  lY4 = (lY & 0x40000000);
	  lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
	  if (lX4 & lY4) {
	    return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
	  }
	  if (lX4 | lY4) {
	    if (lResult & 0x40000000) {
	      return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
	    } else {
	      return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
	    }
	  } else {
	    return (lResult ^ lX8 ^ lY8);
	  }
	}
	function F(x, y, z) {
	  return (x & y) | ((~x) & z);
	}
	function G(x, y, z) {
	  return (x & z) | (y & (~z));
	}
	function H(x, y, z) {
	  return (x ^ y ^ z);
	}
	function I(x, y, z) {
	  return (y ^ (x | (~z)));
	}
	function FF(a, b, c, d, x, s, ac) {
	  a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
	  return AddUnsigned(RotateLeft(a, s), b);
	}
	function GG(a, b, c, d, x, s, ac) {
	  a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
	  return AddUnsigned(RotateLeft(a, s), b);
	}
	function HH(a, b, c, d, x, s, ac) {
	  a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
	  return AddUnsigned(RotateLeft(a, s), b);
	}
	function II(a, b, c, d, x, s, ac) {
	  a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
	  return AddUnsigned(RotateLeft(a, s), b);
	}
	function ConvertToWordArray(string) {
	  var lWordCount;
	  var lMessageLength = string.length;
	  var lNumberOfWords_temp1 = lMessageLength + 8;
	  var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
	  var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
	  var lWordArray = Array(lNumberOfWords - 1);
	  var lBytePosition = 0;
	  var lByteCount = 0;
	  while (lByteCount < lMessageLength) {
	    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
	    lBytePosition = (lByteCount % 4) * 8;
	    lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
	    lByteCount++;
	  }
	  lWordCount = (lByteCount - (lByteCount % 4)) / 4;
	  lBytePosition = (lByteCount % 4) * 8;
	  lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
	  lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
	  lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
	  return lWordArray;
	}
	function WordToHex(lValue) {
	  var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
	  for (lCount = 0; lCount <= 3; lCount++) {
	    lByte = (lValue >>> (lCount * 8)) & 255;
	    WordToHexValue_temp = "0" + lByte.toString(16);
	    WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
	  }
	  return WordToHexValue;
	}
	function Utf8Encode(string) {
	  var utftext = "";
	  for (var n = 0; n < string.length; n++) {
	    var c = string.charCodeAt(n);
	    if (c < 128) {
	      utftext += String.fromCharCode(c);
	    } else if ((c > 127) && (c < 2048)) {
	      utftext += String.fromCharCode((c >> 6) | 192);
	      utftext += String.fromCharCode((c & 63) | 128);
	    } else {
	      utftext += String.fromCharCode((c >> 12) | 224);
	      utftext += String.fromCharCode(((c >> 6) & 63) | 128);
	      utftext += String.fromCharCode((c & 63) | 128);
	    }
	  }
	 return utftext;
	}
	module.exports = {
	  md5: md5
	}

---
**olami免费开放语义平台NLI接口封装：NLI.js**

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

---
**其它utils：util.js**

	//获取应用实例
	var app = getApp()
	
	var Guid = require('./GUID.js');
	
	var uuidSaved = '';
	
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
	
	//获取用户唯一标识，NLI接口中要上传用户唯一标识，这里获取：第一次登录时生成的uuid+微信号所在地+昵称
	function getUserUnique(userInfo) {
	  //从缓存中读取uuid
	  if (typeof uuidSaved === 'undefined' || uuidSaved === '') {
	    var tmpUuid = wx.getStorageSync('uuid');
	    if (typeof tmpUuid === 'undefined' || tmpUuid === '') {
	      uuidSaved = Guid.NewGuid();
	      wx.setStorageSync('uuid', uuidSaved);
	    } else {
	      uuidSaved = tmpUuid;
	    }
	  }
	
	  var unique = uuidSaved;
	  if (userInfo != null) {
	    unique += '_' + userInfo.province + '_' + userInfo.nickName;
	  }
	  log('getUserUnique() return:' + unique)
	  return unique;
	}
	
	module.exports = {
	  formatTime: formatTime,
	  log: log,
	  getUserUnique: getUserUnique
	}



####page/logs页面：logs.js, logs.json, logs.wxml, logs.wxss
---
**logs.js**

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

---
**logs.json**

	{
	    "navigationBarTitleText": "调试LOG页"
	}

---
**logs.wxml**

	<!--logs.wxml-->
	<view class="container log-list">
	  <block wx:for="{{logs}}" wx:for-item="log" wx:key="*this">
	    <text class="log-item">{{index + 1}}. {{log}}</text>
	  </block>
	</view>

---
**logs.wxss**

	.log-list {
	  display: flex;
	  flex-direction: column;
	  padding: 40rpx;
	}
	.log-item {
	  margin: 10rpx;
	}

####page/index页面：index.js, index.json, index.wxml, index.wxss
---
**index.js**

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


---
**index.json**

首页延用app.json中的配置，不需要单独的配置，这里主要配置一个允许下拉。

	{
	  "window": {
	    "enablePullDownRefresh": true
	  }
	}

---
**index.wxml**

这个是首页的h5布局。

	<view class="container">
	  <view class="page-section">
	    <view class="text-box" scroll-y="true">      
	      <text style="max-width:200px;overflow-y:auto;height:200px;" selectable="true">{{outputTxt}}</text>
	    </view>
	  </view>
	
	  <view class="page-section page-gap page-center">
	    <text selectable="true" class="text-head">语义理解基于“欧拉密”：cn.olami.ai</text>
	    <text selectable="true" class="text-description little-gap-top">支持“摇一摇”、点按钮、手动输入、向下拉</text>
	  </view>
	
	  <view class="page-section">
	    <view class="weui-cells weui-cells_after-title">
	        <input class="weui-input" placeholder-style="color:#6aa84f"  maxlength="50" 
	          placeholder="点此手动输入" value="{{inputTxt}}" confirm-type ="send" bindconfirm="bindConfirmControl" bindfocus="bindFocusClear"/>
	    </view>
	  </view>
	
	  <view class="button-selection page-gap">
	    <view class="{{isDbg?'button-show':'common-disappear'}}">
	      <button type="default" size="mini" bindtap="bindTest">调试</button>
	    </view> 
	
	    <view class="button-selection2">
	      <button type="default" size="mini" data-cp="今天天气|北京今天有雨吗|西安今天冷不冷|今天适合洗车吗|那后天上海怎么样|北京明天有雾霾吗|南京今天空气污染指数有多高" bindtap="bindCorpusGenerator">天气</button>
	      <button type="default" class="little-gap-left" size="mini" data-cp="今天的体育新闻|看国内新闻|今天有什么重大新闻|今天有没有什么大事|有今天的财经新闻吗|钓鱼岛事件的最新进展是什么|来个军事新闻|接下来还有吗" bindtap="bindCorpusGenerator">新闻</button>
	      <button type="default" class="little-gap-left" size="mini" data-cp="今年什么时候中秋节|目前时间|明天星期几|农历八月15是哪天|离国庆节还有几天|还有多久到六点|今年是闰年吗？" bindtap="bindCorpusGenerator">日历</button>
	      <button type="default" class="little-gap-left" size="mini" data-cp="100人民币能换多少美金|美国用什么货币|100美金能换多少日元|英镑现在多少钱|美元现在什么价格|帮我查查美元汇率" bindtap="bindCorpusGenerator">汇率</button>
	      <button type="default" class="little-gap-left" size="mini" data-cp="来个段子|说个笑话听听|讲个黑色幽默|讲个笑话逗逗我|还要一个笑话|换一个|随便来几个笑话听听" bindtap="bindCorpusGenerator">笑话</button>
	    </view>
	
	    <view class="button-selection2">
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="我要看鬼故事|给我讲个好听的故事|下一个|换一个" bindtap="bindCorpusGenerator">故事</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="好无聊啊|你是机器人吗|很高兴见到你|你能嫁给我吗|你的心上人是谁|你今天吃饭了吗|你困了吗|喂,你好吗|你喜欢吃蔬菜吗|你饿吗|你今天过生日吗|你什么时候出生的|你要喝水吗|能和我聊会天吗|你怎么那么笨啊|我在骂你|你听不懂吗|我要生气啦 |你想要气死我啊|怎么什么都不会|你真让我失望|你寂寞吗|你觉得自己聪明吗|我好伤心啊|你有外号吗|你需要休息吗|你要不要休息会啊|你感觉累吗|你脸皮真薄" bindtap="bindCorpusGenerator">闲聊</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="介绍一下刘德华|李双江的老婆是谁|张学友简介|黄山有多高|湖南省有多大|太湖有多大|印度有多少人口" bindtap="bindCorpusGenerator">百科</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="背一首李白的望庐山瀑布|春眠不觉晓下一句是什么|唯见长江天际流上一句是什么|将进酒是谁写的|李白有什么诗|李白还写过什么诗|背首李白的诗" bindtap="bindCorpusGenerator">诗词</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="6789算24点怎么算|用三三八八算出24|1357怎么等于24|1689怎么得到24|怎么用3567得到24|1357帮我刷24点|算24点数字为2346" bindtap="bindCorpusGenerator">24点</button>
	    </view>
	
	    <view class="button-selection2">
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="江西婺源的邮编是多少|哪里的邮政编码是201203|什么地方的邮政编码是201203|我要你帮我查邮政编码|我要查邮政编码|告诉我北京的邮政编码|给我查个邮政编码|我要查邮编|帮我查邮政编码|找一下上海的邮政编码" bindtap="bindCorpusGenerator">邮编</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="帮忙查一下扬州的区号|哪里的区号是021|区号021是哪里|我要查区号|帮我查区号|找一下上海的区号" bindtap="bindCorpusGenerator">区号</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="鲈鱼可以怎么做|排骨怎么烹饪好吃|怎样炖排骨|排骨可以做成什么菜|常见的鲁菜有哪些|川菜有哪些菜式比较有名|有哪些川菜比较有名|哪些菜属于鲁菜|川菜怎么做|你会做川菜吗|推荐几种清真菜|介绍几个湘菜给我" bindtap="bindCorpusGenerator">菜谱</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="今天的大盘指数|中国石化的行情怎么样|今天的行情|中国石化的价格是多少|中国石化的成交量怎么样|上证指数现在多少点|查一下招商银行今日的开盘价|今天上证指数几点" bindtap="bindCorpusGenerator">股票</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="我想买个电风扇|我要买两袋大米|我要网购一盒牛奶|我要在京东买一台电脑|我要买一部HTC的手机|我想买个飞利浦的剃须刀" bindtap="bindCorpusGenerator">购物</button>
	    </view>
	
	    <view class="button-selection2">
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="今晚番茄台放什么节目|中央一台今晚有什么节目|非诚勿扰今晚什么时候播出|7点到9点哪个台有电影|晚上11点以后哪个台放蜘蛛侠|我要看湖南卫视" bindtap="bindCorpusGenerator">节目预告</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="3的平方加8再乘以6再除以2等于几|5的平方根|6的七次方|99的三倍|19的三分之一是多少|77的一半加13等于多少|67个9加起来是多少|5个15乘在一起等于几|4乘以6加5乘以8加12乘以7|四分之三|7的9倍|三的一半|17个9|12的对数|23的自然对数|5加六加七再乘10|三只苹果加五只苹果等于几只苹果|19加7" bindtap="bindCorpusGenerator">计算</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="搜索薛之谦|帮我找一些九寨沟的图片|我想看看范冰冰的照片|我要查一下白羽鸡|帮我搜下科鲁兹的性能" bindtap="bindCorpusGenerator">搜索</button>
	      <button type="default" class="little-gap-left little-gap-top" size="mini" data-cp="1光年等于多少公里|1标准大气压等于多少帕|1标准大气压等于多少毫米汞柱|1兆瓦等于多少毫瓦|1签卡等于多少焦|1纳米等于多少毫米|1埃等于多少纳米|1厘米等于多少英寸|1公斤等于多少克|1担等于多少斤|1两等于多少钱|1毫克等于多少微克|1亩等于多少公顷" bindtap="bindCorpusGenerator">单位换算</button>
	    </view>
	  </view>
	</view>
	
	<view class="little-gap-top button-selection2 button-show bottom-button">
	  <button type="primary" size="mini" open-type="contact">联系作者</button>
	  <button type="primary" size="mini" open-type="share">帮忙分享</button>
	</view>

---
**index.wxss**

首页用到的一些样式，以及配置首页背景图片。

	page{
	  background-color:beige;
	  background-image: url(http://img.blog.csdn.net/20170720105808995?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvaGFwcHljeHo=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast);
	  background-size: cover;
	}
	
	.page-section{
	  display: flex;
	  flex-direction: column;
	  margin-bottom: 10rpx;
	}
	
	.page-center {
	  align-items: center;
	}
	
	.page-gap{
	  margin-top: 5rpx;
	}
	
	.button-selection {
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	  align-items: center;
	}
	
	.button-selection2 {
	  justify-content: space-between;
	  align-content: space-between;
	  flex-shrink:1;
	}
	
	.little-gap-top {
	  margin-top: 15rpx; 
	}
	
	.little-gap-left {
	  margin-left: 5rpx; 
	}
	
	.text-description{
	  color: #ff0000;
	  font-size: 28rpx;
	}
	
	.text-head{
	  color: #00BFFF;
	  font-size: 36rpx;
	}
	
	.common-disappear {
	  display: none
	}
	
	.button-show {
	  display: flex;
	  align-self: center;
	  justify-content: center;
	}
	
	.text-box{
	  margin-bottom: 0rpx;
	  margin-left: 50rpx;
	  margin-right: 50rpx;
	  padding: 40rpx 0;
	  display: flex;
	  min-height: 300rpx;
	  max-width: 600rpx;
	  width:600rpx;
	  background-color: #ffffff;
	  justify-content: center;
	  align-items: center;
	  text-align: left;
	  font-size: 30rpx;
	  color: #353535;
	  line-height: 2em;
	  word-wrap: break-word;
	  border: 1px solid cornflowerblue;
	}
	
	.weui-cells {
	  position: relative;
	  margin-top: 1.17647059em;
	  background-color: #DCDCDC;
	  line-height: 1.41176471;
	  font-size: 14px;
	}
	
	.weui-cells_after-title {
	  margin-top: 0;
	}
	
	.weui-input {
	  height: 2.58823529em;
	  width: 17em;
	  min-height: 2.58823529em;
	  line-height: 2.58823529em;
	}
	
	.bottom-button {
	  justify-content: space-around;
	  flex-shrink:0;
	}


###olami平台资源配置

，在配置上稍微有些不同，下面我会重点说明一下。

1. 用上次注册的账号，在[olami.ai](cn.olami.ai)上登录。
2. 选择**“API&解决方案”**中的**“NLI 自然语言语义互动管理系统”**，然后点“开始免费试用”进入应用配置界面。
3. 生成一个新的应用，比如取名**“遥知之NLI能力”**
4. 点**“配置模块”**进去，会有两个标签页：

	a. **“NLI模块”**：我之前做过一个汇率换算的小DEMO [用olami开放语义平台做汇率换算应用](http://blog.csdn.net/happycxz/article/details/73223916)  用的是使用**“NLI模块”**的功能，其实就是语义接口。

	b. **“对话系统模块”**：这次做“遥知之”微信小程序，用的是他们平台的“处理结果”的能力，就是对应**“对话系统模块”**这里。

	注：有些朋友估计会有点弄不清楚，这里我举个例子，比如“今天上海的天气如何”这一句话：应用配置在**“NLI模块”**里勾天气相对应的模块，接口会返回这一句话的意思“今天，上海，查天气”；	应用配置在**“对话系统模块”**里勾“weather”，接口返回的就是今天上海天气的查询结果。

	好了，弄明白上述两块，接下来就知道，这次我做的**“遥知之”**全是要结果输出的，所以把**“对话系统模块”**中所有的功能模块全勾选上了，后面有配置优先级的，优先级是用来处理语义冲突时仲裁哪个模块优先的，我都没有动，直接用默认值，根据提示：数值越小优先级越高，1000是优先级最高。

5. **“遥知之NLI能力”**应用中，点击**“查看Key”**可以获取调用OLAMI开放语义平台的授权密钥，包括**“App Key”**和**“App Secret”**。 这两个码，对应小程序源码中的“config.js”中的“appkey”和“appsecret”。
6. **“遥知之NLI能力”**应用中有个**“测试”**，需要的话，可点进去输入一些句子测输出结果（注：这里是NLI接口输出的一部分）。


**>>>>>>>>>>>>>>>>>>>>>>>> 欢迎转载 <<<<<<<<<<<<<<<<<<<<<<<<**

**本文原地址:[http://blog.csdn.net/happycxz/article/details/75432928](http://blog.csdn.net/happycxz/article/details/75432928)**

**“遥知之”微信小程序完整源码下载：**
CSDN: [http://download.csdn.net/download/happycxz/9919690](http://download.csdn.net/download/happycxz/9919690)
github: [https://github.com/happycxz/nlp_olami_yaozhizhi_wechat_littleapp_demo](https://github.com/happycxz/nlp_olami_yaozhizhi_wechat_littleapp_demo)


###写在最后
这次做微信小程序，是边摸索边做，JS和CSS基本是边改边学，好在微信小程序框架清晰，接口文档全，另外olami平台之前做  [用olami开放语义平台做汇率换算应用](http://blog.csdn.net/happycxz/article/details/73223916) 时接触过，所以总体来讲还算顺利。

---------------
**另外这里特意推荐一下跟自然语言理解相关的比较不错的文章：**

[根据OLAMI平台开发的日历Demo](http://blog.csdn.net/xinfinityx/article/details/72840977)

[用olami开放语义平台做汇率换算应用](http://blog.csdn.net/happycxz/article/details/73223916)

[自然语言处理-实际开发:用语义开放平台olami写一个翻译的应用](http://blog.csdn.net/u011211290/article/details/74330469)

[自定义java.awt.Canvas—趣味聊天](http://blog.csdn.net/u011827504/article/details/74332383)

[微信小程序+OLAMI自然语言API接口制作智能查询工具--快递、聊天、日历等](http://blog.csdn.net/huangmeimao/article/details/74923621)

[热门自然语言理解和语音API开发平台对比](http://blog.csdn.net/huangmeimao/article/details/74905918)

[使用OLAMI SDK和讯飞语音合成制作一个语音回复的短信小助手](http://blog.csdn.net/speeds3/article/details/75131125)

[微信小程序——智能小秘“遥知之”源码分享（语义理解基于olami）](http://blog.csdn.net/happycxz/article/details/75432928)







