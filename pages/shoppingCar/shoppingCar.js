const app = getApp()
let shopcartUtil = require('../../utils/shopcart')
const getIsDeliveryFee = require('../../utils/config.js').httpConfig.getIsDeliveryFee;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sumPrice: 0,
    shopCart: [],
    cartShopTotal: [],
    cartTypeName: shopcartUtil.cartType.OTO,
    deliveryWay: 0,
    cartNum: 0, //购物车商品数量
    tabIdx: 0,
    tabList: [{
        id: 0,
        name: '社群购',
        cartTyp: shopcartUtil.cartType.OTO
      },
      {
        id: 1,
        name: '社区购',
        cartTyp: shopcartUtil.cartType.GroupBuy
      }
    ],
    freightTips: ''//凑运费提示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  /**
   * tab切换
   */
  tabSwitch: function (t) {
    let idx = t.currentTarget.dataset.idx
    let carttype = t.currentTarget.dataset.carttype
    if (idx != this.data.tabIdx) {
      this.setData({
        tabIdx: idx,
        cartTypeName: carttype
      }, function () {
        this.getShopCartData();
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getShopCartData();
    this.browseWxappPage();
  },
  /**
   * 获取购物车数据
   */
  getShopCartData: function () {
    let shopCart = shopcartUtil.getShopCart(this.data.cartTypeName)
    let cartTotal = shopcartUtil.getShopCartTotal(this.data.cartTypeName)
    this.setData({
      shopCart: shopCart,
      sumPrice: cartTotal.sumPrice
    })
    if (this.data.shopCart.length > 0) {
      this.getFreightTips()
    }
    this.refreshCartNum()

  },
  /**
   * 获取凑运费提示
   */
  getFreightTips() {
    let that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let peopleId = -1;
    if (app.globalData.userInfo != null) {
      peopleId = app.globalData.userInfo.peopleId
    }
    wx.request({
      url: getIsDeliveryFee,
      data: {
        shopId: app.globalData.shopInfo.id,
        peopleId: peopleId,
        price: that.data.sumPrice
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: err.message,
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
        that.setData({
          freightTips: res.data.message
        })
        // that.setCarrierInfo(res.data.data)
      }
    })
  },
  /**
   * 刷新底部菜单购物车数量
   */
  refreshCartNum: function () {
    let totalBuyCount = shopcartUtil.getTotalBuyCount()
    this.setData({
      cartNum: totalBuyCount
    })
  },
  /**
   * 更新缓存
   * @param {购物车} shopCart
   */
  updateShopCartCatch(shopCart) {
    shopcartUtil.setShopCart(shopCart, this.data.cartTypeName)
    shopcartUtil.caulTotal(this.data.cartTypeName)
    let cartTotal = shopcartUtil.getShopCartTotal(this.data.cartTypeName)
    this.setData({
      shopCart: shopCart,
      buyCount: cartTotal.buyCount,
      sumPrice: cartTotal.sumPrice,
      sumProductPrice: cartTotal.sumProductPrice
    })
    this.getFreightTips()
  },
  /**
   * 购物车增加商品
   * @param {*} e
   */
  cartAdd(e) {
    let shopCart = this.data.shopCart

    //获取购物车商品
    let cart = e.currentTarget.dataset.goodsinfo
    //最小起订量
    let addTotal = cart.minBuyCount;
    if (addTotal == undefined || addTotal == null) addTotal = 1;

    //用户购买数量是否大于最大购买数
    if (cart.userMaxBuy > 0) {
      if (cart.userMaxBuy < cart.userBuy + cart.total + addTotal) {
        wx.showToast({
          title: '该商品已经超过最大购买数！',
          icon: 'none'
        });
        return;
      }
    }
    //判断库存
    if (cart.goodsTotal < cart.total + addTotal) {
      wx.showToast({
        title: '该商品已经没有库存不能添加！',
        icon: 'none'
      });
      return;
    }

    cart.total += addTotal;
    let index = shopcartUtil.shopCartIndex(cart.goodsId, shopCart)
    shopCart[index] = cart;
    cart = shopcartUtil.caulCartRealPrice(cart, cart, shopCart)
    //金额
    // cart.realPrice = cart.total * cart.price
    // cart.realPrice = parseFloat(cart.realPrice.toFixed(2));
    //原价金额
    cart.realProductPrice = cart.total * cart.productPrice
    cart.realProductPrice = parseFloat(cart.realProductPrice.toFixed(2));
    this.modifyShopCartList(cart)


    //shopCart[index] = cart;
    //更新缓存
    this.updateShopCartCatch(shopCart)
    this.refreshCartNum()
    //商品加购（事件add_to_cart）
    this.addToCart(cart, "append_to_cart");
  },

  /**
   * 购物车内减少商品
   */
  cartDel: function (e) {
    let cart = e.currentTarget.dataset.goodsinfo
    //最小起订量
    let addTotal = cart.minBuyCount;
    if (addTotal == undefined || addTotal == null) addTotal = 1;
    let shopCart = this.data.shopCart
    if (cart.total - addTotal < addTotal) {
      let index = shopcartUtil.shopCartIndex(cart.goodsId, shopCart)
      shopCart.splice(index, 1)
    } else {
      //减少数量
      cart.total -= addTotal;
      //金额
      // cart.realPrice = cart.total * cart.price
      // cart.realPrice = parseFloat(cart.realPrice.toFixed(2));
      let index = shopcartUtil.shopCartIndex(cart.goodsId, shopCart)
      shopCart[index] = cart;
      cart = shopcartUtil.caulCartRealPrice(cart, cart, shopCart)
      //原价金额
      cart.realProductPrice = cart.total * cart.productPrice
      cart.realProductPrice = parseFloat(cart.realProductPrice.toFixed(2));
      this.modifyShopCartList(cart)

    }

    //更新缓存
    this.updateShopCartCatch(shopCart)
    this.refreshCartNum()
    //商品加购（事件add_to_cart）
    this.addToCart(cart, "remove_from_cart");

  },

  /**
   * 清空购物车
   */
  clearShopCart: function () {
    console.log("this.data.shopCart", this.data.shopCart)
    // this.data.shopCart.forEach((item) => {
    //   item.userBuy -= item.buyCount
    //   item.buyCount = 0
    // })
    this.setData({
      shopCart: []
    })
    this.updateShopCartCatch([])
    this.refreshCartNum()
  },
  /**
   * 修改购物车内商品数
   */
  modifyShopCartList: function (cart) {
    this.data.shopCart.forEach((item) => {
      if (item.goodsId == cart.goodsId) {
        //数量
        item.total = cart.total
        //金额
        item.realPrice = cart.realPrice
        //原价金额
        item.realProductPrice = cart.realProductPrice
        return item
      }
    })
  },
  /**
   * 跳转支付页面
   * @param {*} e
   */
  toPayPage: function (e) {
    //判断是否有数据
    let shopCarts = shopcartUtil.getShopCart(this.data.cartTypeName)
    if (shopCarts.length == 0) {
      return
    }
    // let value = JSON.stringify(this.data.shopCart);
    //跳转到支付
    wx.navigateTo({
      url: '../shoppay/shoppay?cartTypeName=' + this.data.cartTypeName + '&source=1&deliveryWay=' + this.data.deliveryWay
    })
  },

  //有数--商品加购（事件add_to_cart）
  addToCart(goodsInfo, actionType) {
    app.TXYouShu.track('add_to_cart', {
      "action_type": actionType,
      "sku": {
        "sku_id": goodsInfo.goodsId + "",
        "sku_name": goodsInfo.title
      },
      "spu": {
        "spu_id": goodsInfo.goodsId + "",
        "spu_name": goodsInfo.title
      },
      "shipping_shop": {
        "shipping_shop_id": app.globalData.shopInfo.code,
        "shipping_shop_name": app.globalData.shopInfo.name
      },
      "sku_num": 1,
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '购物车',
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
