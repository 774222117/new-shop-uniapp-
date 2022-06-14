const app = getApp()
//获取门店下的促销活动
const getSaleActivityGoodsInfoUrl = require('../../utils/config.js').httpConfig.getSaleActivityGoodsInfoUrl
const getNearbyShopOneUrl = require('../../utils/config.js').httpConfig.getNearbyShopOne;
//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
let shopcartUtil = require('../../utils/shopcart')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopInfo:null,
    activityId: 0,
    activityInfo:null,
    //商品列表
    goodsInfoList: [],
    //
    categoryTotal: 0,
    cartShopTotal: {},
    cartNum: 0,//购物车商品数量
    //去结算是否强制弹框选择门店classId
    chooseShop: 0,
    pn: 0
  },
  //全局shopInfo 改变后，回调函数
  watchBack: function (value) { //这里的value 就是 app.js 中 watch 方法中的 set, 返回整个 globalData
    console.log('回调watchBack：', value)
    this.setShopInfo(value.shopInfo)
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    app.watch(this.watchBack)
    if (app.globalData.userInfo == null) {
      //app.data.path = '/category/categroy'
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    if (options.chooseShop != undefined) {
      this.setData({
        chooseShop: options.chooseShop
      })
    }
    wx.hideTabBar()
    this.setData({
      activityId: options.activityId
    })
    //获取门店信息        
    wx.getLocation({
      success: function (res) {
        that.getNearShopOne(res.longitude, res.latitude, options.shopId)
      },
    })
  },
  //从后台获取最近门店信息
  getNearShopOne: function (longitude, latitude, shopId) {

    let that = this
    //获取缓存中的门店信息
    let cacheShopId = undefined
    if (app.globalData.shopInfo != null && that.data.chooseShop!=1) {
      if (app.globalData.shopInfo.id == shopId || shopId == undefined) {
        that.setShopInfo(app.globalData.shopInfo)
      }
      else {
        that.getShopById(shopId)
      }
      that.setData({
        loading: false
      })
    }
    //0.都为空，获取附近的门店
    else {
      if (shopId != null) {
        this.getShopById(shopId)
        return
      }
      //存储一下
      this.setData({
        longitude: longitude,
        latitude: latitude
      })
      wx.showLoading({
        title: '加载中...'
      })
      //访问数据
      wx.request({
        url: getNearbyShopOneUrl,
        data: {
          longitude: longitude,
          latitude: latitude,
          saleActivityId: that.data.activityId
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.flag) {
            that.setShopInfo(res.data.data)
            that.setData({
              loading: false
            })
          }
          else {
            console.log("获取最近门店出错！");
          }
        },
        fail: function (err) {
          wx.hideLoading()
          wx.showToast({
            title: '获取位置信息网络异常！',
            icon: 'none'
          });
        }
      })
    }

  },
  /**
     * 设置门店
     *   1.data.shopInfo赋值
     *   2.写入缓存
     */
  setShopInfo: function (shopInfo) {
    //1.data.shopInfo赋值
    this.setData({
      shopInfo: shopInfo,
      activityInfo:null,
      goodsInfoList: [],
      pn: 0,
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName),
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName)
    })
    app.setShopInfo(shopInfo)
    this.getPromotionInfo()
  },
  getPromotionInfo:function(){
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getSaleActivityGoodsInfoUrl,
      data: {
        shopId: that.data.shopInfo.id,
        peopleId: app.globalData.userInfo.peopleId,
        saleActivityId: that.data.activityId,
        pn: that.data.pn,
        isNew: 1
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          let pnNext = that.data.pn + 1
          that.setData({
            activityInfo: res.data.data,
            goodsInfoList: that.data.goodsInfoList.concat(res.data.data.goodsList),
            pn: pnNext
          })
          that.initShopCart()
        } else {
          if(res.data.data!=undefined){
            that.setData({
              activityInfo: res.data.data
            })
          }
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
        console.info(that.data)
      }
    })
  },
  /**
   * 根据Id获取门店信息
   */
  getShopById: function (shopId) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: shopInfoUrl,
      data: {
        shopId: shopId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取门店数据出错',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取门店数据出错',
            icon: 'none'
          });
          return
        }
        if(app.globalData.shopInfo && app.globalData.shopInfo.id != shopId){
          shopcartUtil.clearShopCartList()
        }
        that.setShopInfo(res.data.data)
      }
    })
  },
  /**
     * 初始化购物车信息
     */
  initShopCart: function () {
    let cartTypeName = shopcartUtil.cartType.OTO
    let carType = 0
    if(this.data.activityInfo != null){
      carType = this.data.activityInfo.carType
    }
    if (carType == 1) {
      cartTypeName = shopcartUtil.cartType.ShopRecommend + "-" + this.data.activityId
      shopcartUtil.initCartInfo(cartTypeName)
    }else{
      cartTypeName = shopcartUtil.cartType.OTO
    }
    let shopCart = shopcartUtil.getShopCart(cartTypeName)
    let cartShopTotal = shopcartUtil.getShopCartTotal(cartTypeName)
    if (cartShopTotal.sumPrice == undefined) {
      cartShopTotal.sumPrice = 0
      cartShopTotal.sumProductPrice = 0
      cartShopTotal.buyCount = 0
    }

    //写入已购数据  
    let goodsInfoList = this.data.goodsInfoList
    shopCart.forEach((item) => {
      goodsInfoList.forEach((goods) => {
        if (item.goodsId == goods.id) {
          goods.buyCount = item.total
        }
      })
    })
    this.setData({
      goodslist: goodsInfoList,
      cartTypeName: cartTypeName,
      shopCart: shopCart,
      cartShopTotal: cartShopTotal
    })
  },
  //跳转到商品详情
  jumpToGoodsDetail: function (e) {

    wx.showLoading({//开始加载loding
      title: '加载中'
    })
    if (app.globalData.userInfo == null) {
      wx.navigateTo({
        url: '../login/login',
        complete() { wx.hideLoading() }//关闭loding
      })
      return
    }
    let goodsId = e.detail.goods.id
    let marketType = e.detail.goods.marketType
    //不管商品预售，全部跳转到普通商品详情
    wx.navigateTo({
      url: '../goods/goods?cartTypeName=' + this.data.cartTypeName + '&goodsId=' + goodsId + '&saleActivityId=' + this.data.activityId,
    })
  },
  /**
   * 加入购物车
   *   getShopGoodsInfo方法获得到的categoryGoodsList列表将商品信息（goodsInfo）绑定到控件上
   */
  addCart: function (e) {
    console.log(e)
    let goods = e.detail.goods
    goods = shopcartUtil.addShopCart(goods, this.data.cartTypeName)
    let goodsList = shopcartUtil.modifyGoodsList(this.data.goodsInfoList, goods);
    // 在商品详情中重新设置下数据
    this.setData({
      shopCarInfoData: goods,
      goodsInfoList: goodsList,
      cartShopTotal:  shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
    })
  },
  carModifyEvent: function (e) {
    if (e.detail.type == 'clear') {//请购购车
      this.data.goodsInfoList.forEach((item) => {
        item.buyCount = 0
      })
      this.setData({
        goodsInfoList: this.data.goodsInfoList,
        cartShopTotal:  shopcartUtil.getShopCartTotal(this.data.cartTypeName)
      })
    } else {//增加减少购物车内数量
      let goods = e.detail.goods
      let goodsInfoList = shopcartUtil.modifyGoodsList(this.data.goodsInfoList, goods)
      this.setData({
        goodsInfoList: goodsInfoList,
        cartShopTotal:  shopcartUtil.getShopCartTotal(this.data.cartTypeName)
      })
    }
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initShopCart()
    this.browseWxappPage()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.leaveWxappPage();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.leaveWxappPage();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.getPromotionInfo()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    this.shareAppMessage();
  },

  //有数--页面浏览
  browseWxappPage(){
    app.TXYouShu.track('browse_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d", 
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面离开
  leaveWxappPage(){
    app.TXYouShu.track('leave_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d", 
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面分享(事件page_share_app_message)
  shareAppMessage(){
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '促销活动',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d", 
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  }
  
})