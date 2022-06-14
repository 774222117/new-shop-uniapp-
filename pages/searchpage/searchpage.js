const app = getApp()
let request = require('../../utils/request.js');
let shopcartUtil = require('../../utils/shopcart')
const PageGo = require('../../utils/util.js').PageGo;
const getShopGoodsDtoByProductSnUrl = require('../../utils/config.js').httpConfig.getShopGoodsDtoByProductSnUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsInfoList: [],
    pn: 0,
    title: '',
    deliveryWay: 0,
    //购物车
    shopCart: [],
    cartShopTotal: {},
    cartTypeName: '',
    shopId: -1,
    barcode: '',
    histories: [], //历史记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      histories: PageGo.getSearchCache()
    })
    this.initShopCart()
  },
  searchGoods: function (e) {
    this.setData({
      shopId: app.globalData.shopInfo.id,
      pn: 0,
      goodsInfoList: [],
      title: e.detail.value
    })
    this.getShopAllGoods();
    this.searchEvent(e.detail.value);
    PageGo.cacheSearch(e.detail.value);
  },
  /**
   * 点击搜索历史
   */
  onUse:function (e) {
    const title = e.currentTarget.dataset.title;
    this.setData({
      shopId: app.globalData.shopInfo.id,
      pn: 0,
      goodsInfoList: [],
      title: title
    });
    this.getShopAllGoods();
    this.searchEvent(title);
  },
  /**
   * 初始化购物车信息
   * @param {商品平台} goodsPlatform 0 社区购 1 社群购
   */
  initShopCart: function (goodsPlatform) {
    let cartTypeName = shopcartUtil.cartType.OTO
    if (goodsPlatform == 1) {
      cartTypeName = shopcartUtil.cartType.GroupBuy
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
      goodsInfoList: goodsInfoList,
      cartTypeName: cartTypeName,
      shopCart: shopCart,
      cartShopTotal: cartShopTotal
    })
  },
  // 获取店铺所有商品
  getShopAllGoods: function () {
    console.log('getShopAllGoods', app.globalData.shopInfo)
    let that = this
    let peopleId = -1
    if (app.globalData.userInfo != null) {
      peopleId = app.globalData.userInfo.peopleId
    }
    wx.showLoading({
      title: '加载中...'
    })
    request({
      url: 'shopGoodsAllUrl',
      method: 'Get',
      data: {
        shopId: app.globalData.shopInfo.id,
        peopleId: peopleId,
        pn: that.data.pn,
        title: that.data.title
      },
      success: function (res) {
        if (res.data.data.total == that.data.goodsInfoList.length) {
          console.log('没有更多啦~')
          wx.hideLoading()
          return
        }
        that.setData({
          goodsInfoList: that.data.goodsInfoList.concat(res.data.data.rows),
          pn: that.data.pn + 1
        })
        that.initShopCart()
        wx.hideLoading()
      },
      error: function (err) {
        wx.hideLoading()
        console.log(err);
      }
    });
  },
  //商品列表 修改数量
  buyCountEdit: function (e) {
    let goods = e.detail.goods
    let goodsInfoList = shopcartUtil.modifyGoodsList(this.data.goodsInfoList, goods)
    this.setData({
      goodsInfoList: goodsInfoList,
      cartShopTotal: shopcartUtil.getShopCartTotal(shopcartUtil.cartType.OTO),
      shopCart: shopcartUtil.getShopCart(shopcartUtil.cartType.OTO)
    })
  },
  carModifyEvent: function (e) {
    if (e.detail.type == 'clear') { //请购购车
      this.data.goodsInfoList.forEach((item) => {
        item.buyCount = 0
      })
      this.setData({
        goodsInfoList: this.data.goodsInfoList,
        cartShopTotal: shopcartUtil.getShopCartTotal(shopcartUtil.cartType.OTO)
      })
    } else { //增加减少购物车内数量
      let goods = e.detail.goods
      let goodsInfoList = shopcartUtil.modifyGoodsList(this.data.goodsInfoList, goods)
      this.setData({
        goodsInfoList: goodsInfoList,
        cartShopTotal: shopcartUtil.getShopCartTotal(shopcartUtil.cartType.OTO)
      })
    }
  },
  getScancode: function () {
    let that = this
    // 允许从相机和相册扫码
    wx.scanCode({
      scanType: ['barCode'],
      success: (res) => {
        console.log(res.result)
        that.getGoodsByProductsn(res.result)
      },
      fail: (res) => {
        console.info(res)
        // that.getGoodsByProductsn("6920174749335")
      }
    })
  },
  getGoodsByProductsn(productsn) {
    wx.showLoading({
      title: '加载中...'
    })
    let that = this
    //访问数据
    wx.request({
      url: getShopGoodsDtoByProductSnUrl,
      data: {
        productsn: productsn,
        shopId: app.globalData.shopInfo.id,
        peopleId: app.globalData.userInfo.peopleId
      },
      success: function (res) {
        wx.hideLoading();
        console.log(res)
        if (res.data.flag) {
          let goodsList = []
          goodsList.push(res.data.data)
          that.setData({
            goodsInfoList: goodsList
          })
          that.initShopCart()
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取商品网络异常',
          icon: 'none'
        });
      }
    })
  },

  //有数--搜索 search
  searchEvent(keyword) {
    app.TXYouShu.track("search", {
      "keyword": keyword,
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
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
    this.browseWxappPage();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.leaveWxappPage()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.leaveWxappPage()
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
    this.getShopAllGoods()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '搜索页',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面浏览
  browseWxappPage() {
    app.TXYouShu.track('browse_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面离开
  leaveWxappPage() {
    app.TXYouShu.track('leave_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

})
