
//用户登录Url
const userKey = require('./utils/config.js').cachKey.userInfo;
const getPeopleInfoByIdUrl = require('./utils/config.js').httpConfig.getPeopleInfoByIdUrl;
const huaRunUrl = require('./utils/config.js').httpConfig.huaRunUrl;
const div = require('./utils/util.js').div;
const TXYouShu = require('./utils/sr-sdk-wxapp.js').init({
  //腾讯有数：您在腾讯有数的token，以 bi 开头，【数据接入】-【接入工具】-【密钥管理】处获取token
  token: 'bidf6771b1e30a450a',
  //微信小程序appID，以 wx 开头
  appid: 'wxd45dffdd4692d69d',
  //若使用小程序插件，需要设置为true
  usePlugin: true,
  proxyPage: true,
  //开启后允许控制台打印查看埋点数据
  debug: false,
  //开启自动代理，此功能为有数SDK核心功能，建议开启
  autoProxy: true
});
App({
  TXYouShu,
  data: {
    path: '',
    id: '',
  },

  /**
   * 获取用户信息
   * @param {用户ID} peopleId
   */
  getPeopleInfoById(peopleId) {
    let that = this
    wx.request({
      url: getPeopleInfoByIdUrl,
      data: {
        peopleId: peopleId
      },
      success: function (res) {
        if (res.data.flag) {
          if (!!res.data.data.phone) {
            res.data.data.phone = Math.round(div(res.data.data.phone, res.data.data.peopleId));
          }
          that.setUserInfo(res.data.data)
        }
      }
    })
  },

  /**
   * 华润Url
   */
  getHuaRunRegisterUrl() {
    let url = huaRunUrl
    return url
  },

  /**
   *
   * @param {*} opt
   */
  getHuaRunRegisterParam() {
    return "memberId=" + this.globalData.userInfo.peopleId +
      "&phone=" + this.globalData.userInfo.phone +
      "&shopCode=8S" + this.globalData.shopInfo.code +
      "&merchantCode=1651200000001"
  },

  /***
   * 初始化
   */
  onLaunch: function (opt) {
    //影藏微信自带的底部导航
    wx.hideTabBar();
    this.globalData.userInfo = wx.getStorageSync(userKey)
    this.globalData.shopInfo = wx.getStorageSync('shopInfo')
    this.globalData.carrierInfo = wx.getStorageSync('carrierInfo')


    if (this.globalData.shopInfo == "") {
      this.globalData.shopInfo = null;
    }

    if (this.globalData.userInfo == "") {
      this.globalData.userInfo = null;
      this.data = opt;
    } else {
      //获取用户信息
      if (!this.isRegisterSugo()) {
        this.getPeopleInfoById(this.globalData.userInfo.peopleId)
      }
    }
    if (this.globalData.carrierInfo == "") {
      this.globalData.carrierInfo = null;
    }

    //有数接入
    const user = this.globalData.userInfo;
    if(!!user) {
      TXYouShu.setUser({open_id:user.wxMinOpenId})
    } else {
      TXYouShu.setUser({open_id:'visitorvisitorvisitorvisitor'})
    }

    console.log(user)
    //OTO购物车
    this.globalData.shopCarList.push({
      name : "OTO",
      carts : [],
      cartTotal : {}
    })
    //预售页面
    this.globalData.shopCarList.push({
      name : "Adavnce",
      carts : [],
      cartTotal : {}
    })

    this.getSystemInfo();
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top,//胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2;//导航高度
        this.globalData.navHeight = navHeight;
        this.globalData.navTop = navTop;
        this.globalData.windowHeight = res.windowHeight;
      },
      fail(err) {
        console.log(err);
      }
    })
  },
  //监听全局信息变动
  watch: function (method) {
    var obj = this.globalData;
    let that = this
    Object.defineProperty(obj, "data", {  //这里的 data 对应 上面 globalData 中的 data
      configurable: true,
      enumerable: true,
      set: function (value) {  //动态赋值，传递对象，为 globalData 中对应变量赋值
        that.globalData.shopInfo = value.shopInfo;
        method(value);
      },
      get: function () {  //获取全局变量值，直接返回全部
        return that.globalData;
      }
    })
  },
  /**
   * 是否注册苏果会员
   */
  isRegisterSugo() {
    if (this.globalData.userInfo == "" || this.globalData.userInfo.suguoMemberId == undefined || this.globalData.userInfo.suguoMemberId == 0) {
      return false
    } else {
      return true
    }
  },

  setUserInfo: function (userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync(userKey, userInfo)
  },

  setShopInfo: function (shopInfo) {
    this.globalData.shopInfo = shopInfo
    wx.setStorageSync('shopInfo', shopInfo)
  },

  setCouponSetId: function (couponSetId) {
    this.globalData.couponSetId = couponSetId
  },

  setOrderId: function (orderId) {
    this.globalData.orderId = orderId
  },

  navigateTo: function (type, url, data) {
    if (type == 1) {
      wx.showLoading({//开始加载loding
        title: '加载中',
        mask: true
      })
      wx.navigateTo({
        url: url + data,
        success: function () { },//成功后的回调；
        fail: function () { }, //失败后的回调；
        complete: function () {
          wx.hideLoading()//关闭loding
        } //结束后的回调(成功，失败都会执行)
      }) //，保留当前页面，跳转到应用内的某个页面，使用 wx.navigateBack 可以返回;
    } else if (type == 2) {
      wx.redirectTo({
        url: url + data,
      }) //关闭当前页面，跳转到非tabBar的某个页面，
    }
  },
  // 判断手机类型 红包组件需要
  getSystemInfo: function () {
    var info = wx.getSystemInfoSync() || {};
    var iphoneX = "";
    if (info) {
      var statusBarHeight = info.statusBarHeight;
      var model = info.model;
      var windowHeight = info.windowHeight;
      var totalTopHeight = 68;
      model.indexOf("iPhone X") !== -1
        ? ((totalTopHeight = 94), (iphoneX = "iphone-x"))
        : -1 !== model.indexOf("iPhone") ? (totalTopHeight = 64) : -1 !== model.indexOf("MI 8") && (totalTopHeight = 88);
      var titleBarHeight = totalTopHeight - statusBarHeight;
      this.globalData.systemInfo = Object.assign({}, info, {
        statusBarHeight,
        titleBarHeight,
        totalTopHeight,
        iphoneX,
        windowHeight
      })
    }
  },

  setCartShop(cartShop){
    this.globalData.cartShop = cartShop
    //wx.setStorageSync('cartShop', cartShop)
  },

  setCartBuy(cartBuy){
    this.globalData.cartBuy = cartBuy
    //wx.setStorageSync('cartBuy', cartBuy)
  },

  setAdvanceCart(advanceCart){
    this.globalData.advanceCart = advanceCart
    //wx.setStorageSync('advanceCart', advanceCart)
  },

  setCartShopTotal(cartShopTotal){
    this.globalData.cartShopTotal = cartShopTotal
    //wx.setStorageSync('cartShopTotal', cartShopTotal)
  },

  setCartBuyTotal(cartBuyTotal){
   this.globalData.cartBuyTotal = cartBuyTotal
  },

  setAdvanceCartTotal(advanceCartTotal){
    this.globalData.advanceCartTotal = advanceCartTotal
  },

  setParentId(parentId){
    this.globalData.parentId = parentId
  },

  setRoomId : function(roomId){
    this.globalData.roomId = roomId
  },

  setBankToken(token){
    this.globalData.bankToken = token
  },

  setChnlMrchNo(chnlMrchNo){
    this.globalData.chnlMrchNo = chnlMrchNo
  },

  globalData: {
    systemInfo: {},
    mobile: null, // 手机信息
    isIphoneX: null, // 是否是IphoneX
    //用户信息数据
    userInfo: null,
    shopInfo: null,
    couponSetId: -1,
    orderId: -1,
    navHeight:0,
    navTop:0,
    windowHeight:0,
    //OTO购物车
    cartShop : [],
    cartShopTotal : {},
    //团购购物车
    cartBuy : [],
    cartBuyTotal : {},
    //预售页面
    advanceCart :[],
    advanceCartTotal:{},
    //上级人员
    parentId : -1,
    roomId : null,
    //购物车列表
    shopCarList:[],
    //紫金银行用户Token
    bankToken : "",
    //商城类型
    chnlMrchNo : "",
    //一级分类
    headId:null,
    //提货点信息
    carrierInfo: null
  }
})
