/**
 * 店铺下单支付界面
 * 接受shop页面的购物车数据
 */
const app = getApp()
//提货点
const shopCarrierUrl = require('../../utils/config.js').httpConfig.shopCarrierUrl;
//提交订单
const submitShopOrderUrl = require('../../utils/config.js').httpConfig.submitShopOrderUrl;
//订单支付，用于取消支付后，继续支付
const payOrderUrl = require('../../utils/config.js').httpConfig.payOrderUrl;
//支付回调
const payCallbackUrl = require('../../utils/config.js').httpConfig.payCallbackUrl;
//支付失败
const payFaildOrderUrl = require('../../utils/config.js').httpConfig.payFaildOrderUrl;
//获取优惠券
const myShopCouponsUrl = require('../../utils/config.js').httpConfig.myShopCouponsUrl;
//华润注册地址
const huaRunUrl = require('../../utils/config.js').httpConfig.huaRunUrl;
//订单送券urql
const getCouponSetInfoUrl = require('../../utils/config.js').httpConfig.getCouponSetInfoUrl;
//获取可订阅的模版消息Id
const subscribeTempIdsUrl = require('../../utils/config.js').httpConfig.getSubscribeTempIdsUrl;
//订阅的模版消息
const subscribeMsgUrl = require('../../utils/config.js').httpConfig.subscribeMsgUrl;
//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
//获取配送费
const getDeliverFeeUrl = require('../../utils/config.js').httpConfig.getDeliverFeeUrl;
//获取配送优惠
const getDeliverFeeDiscountSetByPeopleUrl = require('../../utils/config.js').httpConfig.getDeliverFeeDiscountSetByPeopleUrl;
//获取配送时间可选择列表
const findShopDeliverTimeIntervalUrl = require('../../utils/config.js').httpConfig.findShopDeliverTimeIntervalUrl;
//查询订单 提货时间
const getOrderTakeTimeUrl = require('../../utils/config.js').httpConfig.getOrderTakeTimeUrl;
//查询订单 换购信息
const getExchangeActivityUrl = require('../../utils/config.js').httpConfig.getExchangeActivityUrl;
//根据自提点Id获取自提点信息
const getCarrierByIdUrl = require('../../utils/config.js').httpConfig.getCarrierByIdUrl;

let shopcartUtil = require('../../utils/shopcart')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //分享人
    parentId: -1,
    //来源 ：1 店铺页面 2 预售页面
    source: 1,
    //推广来源
    orderSource: 1,
    //团购，砍价的营销id，外部传入
    marketId: -1,
    //团购砍价的的明细id
    marketDetailId: -1,
    //门店号
    shopId: -1,
    //接受的数据
    shopCart: [],
    //支付金额
    payAmount: 0,
    //默认支付金额，为了方便计算配送费用
    defaultPayAmount: 0,
    //总件数
    buyCount: 0,
    //提货点列表
    carrierList: [],
    //自提点Id
    carrierId: 0,
    //取货地址
    carrierAddress: '点击此处选择提货点',
    //联系人
    carrierMobile: '',
    //取货时间
    carrierServerTime: '选择提货信息',
    /*********** 界面录入赋值********** */
    //备注
    buyRemark: '',
    //提货人
    pickerName: '',
    //提货人联系电话
    pickerMobile: '',
    //优惠券描述
    couponDetail: '',
    //优惠券列表
    myCoupons: [],
    //可用红包个数
    useCouponCount: 0,
    //选择的红包
    selectCoupon: null,
    couponMonery: 0,
    //优享卡ID
    couponId: 0,
    //赠送优惠券活动ID
    couponSetId: 0,
    //TODO : 配送方式：0 全部 1 门店自提 2 配送到家，2020-03-16 append it
    deliveryWay: 0,
    //用户选择配送方式
    dispatchType: 1,
    dispatchTitle: '选择配送方式',
    //是否隐藏提货点选择
    hideTake: false,
    //是否隐藏配送地址
    hideAddrress: false,
    //是否隐藏选择配送方式
    hideSelectDispatchType: false,
    //配送区域
    regionInfo: '配送地址',
    //详细地址
    detailInfo: '选择&录入配送地址',
    dispatchList: [{
      value: 1,
      name: "门店&社区自提",
      description: '提货时间：每周一到每周五 18:00～20:00',
      checked: false
    }, {
      value: 2,
      name: "配送到家",
      description: '由蜂鸟骑手配送，预计一小时内送达',
      checked: true
    }],
    supplierActivityId: 0,
    //配送方式：快递到家，蜂鸟配送
    expressType: 1,
    //购物车类型名称
    cartTypeName: '',
    //购物车汇总信息
    cartTotal: {},
    //可订阅的模版消息id
    tmplIds: [],
    //直播间Id
    roomId: 0,
    //原订单id
    originalOrderId: 0,
    //是否分享
    isShowShare: 0,
    //是否是oto门店
    isOto: 0,
    //是否直送
    isDelivery: 0,
    //配送费，暂时写死，如果是oto门店，并且选择的是快递/蜂鸟 固定3元，其他情况 0元
    dispatchPrice: 0,
    //配送优惠Id
    discountSetId: 0,
    //配送优惠金额
    dispatchDiscountPrice: 0,
    //是否显示配送费
    isShowDispatchPrice: true,
    //包装费 写死0.5
    packPrice: 0,
    isSend: 0,
    //当前tab序号
    currentTab: 0,
    tabsList: [{
      title: '到店自提'
    }, {
      title: '送货上门'
    }],
    //影藏tab标签
    hidetabbar: false,
    //预计送达时间
    expectTime: '约17:30~18:00送达',
    expectDateSelectIndex: 0,
    deliveryTimeList: [],
    canSelectTimeList: [],
    takeTimeIndex: 0,
    takeTime: '',
    takeTimeDescription: '',
    //促销活动id
    saleActivityId: -1,
    //是否显示所有购物车商品
    ishowallCartgoods: false,
    //换购活动信息
    exchangeActivity: null,
    //已经选择的换购商品
    selectExchangeGoods: null,
    //已选择的换购商品 换购价格
    exchangeGoodsPrice: 0,
    //换购活动id，如果选择了换购商品 赋值换购活动id
    exchangeActivityId: 0,
    //团长活动id
    groupBuyActivityId: 0,
    //配送费提示信息
    freightTips:'',
  },


  /**
   * 生命周期函数--监听页面加载
   * expressType : 快递方式
   *
   */
  onLoad: function (options) {
    if (options.cartTypeName == undefined || options.cartTypeName == null) {
      wx.showToast({
        title: '没有购物车类型！',
        icon: 'none'
      });
      return
    }
    //获取上一个页面的商品
    if (options.isShowShare) {
      //获取路径
      this.setData({
        isShowShare: options.isShowShare
      })
    }
    //直播间ID
    if (options.roomId) {
      this.setData({
        roomId: options.roomId
      })
      app.setRoomId(null)
    }
    //获取来源
    this.setData({
      source: options.source,
      shopId: app.globalData.shopInfo.id,
      cartTypeName: options.cartTypeName
    })
    //分享人Id
    this.setData({
      parentId: app.globalData.parentId
    })

    //快递方式
    if (options.expressType) {
      this.setData({
        expressType: options.expressType
      })
    }
    //是否直送
    if (options.isDelivery) {
      this.setData({
        isDelivery: options.isDelivery
      })
    }

    //供应商活动Id
    if (options.supplierActivityId) {
      this.setData({
        supplierActivityId: options.supplierActivityId
      })
    }
    //促销活动Id
    if (options.saleActivityId) {
      this.setData({
        saleActivityId: options.saleActivityId
      })
    }
    //原订单Id
    if (options.originalOrderId) {
      this.setData({
        originalOrderId: options.originalOrderId
      })
    }
    if (options.groupBuyActivityId) {
      this.setData({
        groupBuyActivityId: options.groupBuyActivityId
      })
    }
    if (options.carrierId && options.carrierId > 0) {
      //获取团长自提点
      this.getCarrierById(options.carrierId)
    } else {
      //获取提货点
      this.getShopCarrierService(this.data.shopId)
    }

    //购物车数据
    let shopCart = shopcartUtil.getShopCart(this.data.cartTypeName)
    let cartTotal = shopcartUtil.getShopCartTotal(this.data.cartTypeName)
    let payAmount = cartTotal.sumPrice + this.data.dispatchPrice + this.data.packPrice
    let defaultPayAmount = cartTotal.sumPrice + this.data.packPrice
    payAmount = parseFloat(payAmount).toFixed(2)
    defaultPayAmount = parseFloat(defaultPayAmount).toFixed(2)
    this.setData({
      shopCart: shopCart,
      cartTotal: cartTotal,
      payAmount: payAmount,
      defaultPayAmount: defaultPayAmount,
      buyCount: cartTotal.buyCount,
    })

    //配送方式
    let deliveryWay = options.deliveryWay
    if (deliveryWay != null && deliveryWay != undefined) {
      this.setData({
        deliveryWay: deliveryWay
      })
    }

    //重新或取一次用户信息
    if (!app.isRegisterSugo()) {
      app.getPeopleInfoById(app.globalData.userInfo.peopleId)
    }
    this.getPeoplePhone()
    //获取优惠券
    this.getMyShopCoupons()
    //获取可订阅的模版id
    this.getSubscribeTempIds()
    //查询门店是否是oto
    this.getShopById(this.data.shopId)
    //查询可选择配送时间
    this.getDeliverTimeInterval(this.data.shopId)
    //查询订单预计配送时间
    this.getOrderTakeTime()
    //查询订单换购信息
    this.geOrderExchangeGoods()
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
      "share_title": '门店支付',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  /********************************************************* 自定义方法 **************************************************/
  /**
   * 获取提货人信息
   */
  getPeoplePhone: function () {
    let pickerName = wx.getStorageSync("pickerName")
    let pickerMobile = wx.getStorageSync("pickerMobile")
    let regionInfo = wx.getStorageSync("regionInfo")
    let detailInfo = wx.getStorageSync("detailInfo")
    if (!regionInfo) regionInfo = '配送地址'
    if (!detailInfo) detailInfo = '选择&录入配送地址'

    if (!pickerName) {
      pickerName = app.globalData.userInfo.nickName
      wx.setStorageSync("pickerName", pickerName)
    }
    if (!pickerMobile) {
      pickerMobile = app.globalData.userInfo.phone
      wx.setStorageSync("pickerMobile", pickerMobile)
    }
    if (regionInfo != '配送地址') {
      wx.setStorageSync("regionInfo", regionInfo)
    }
    if (detailInfo != '选择&录入配送地址') {
      wx.setStorageSync("detailInfo", detailInfo)
    }

    this.setData({
      pickerName: pickerName,
      pickerMobile: pickerMobile,
      regionInfo: regionInfo,
      detailInfo: detailInfo
    })
  },
  /**
   * 从服务器获取提货点
   */
  getShopCarrierService: function (shopId) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: shopCarrierUrl,
      data: {
        shopId: shopId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取提货点,网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取提货点数据出错',
            icon: 'none'
          });
          return
        }
        that.setData({
          carrierList: res.data.data
        })
        //如果只有一条数据，直接显示
        // if (res.data.data.length == 1) {
        //   that.setCarrierInfo(res.data.data[0])
        // }
        that.setCarrierInfo(res.data.data[0])
      }
    })
  },
  /**
   * 根据自提点Id获取自提点团长信息
   */
  getCarrierById: function (carrierId) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: getCarrierByIdUrl,
      data: {
        carrierId: carrierId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取自提点数据出错',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取自提点数据出错',
            icon: 'none'
          });
          return
        }
        that.setData({
          carrierList: [res.data.data]
        })
        that.setCarrierInfo(res.data.data)
      }
    })
  },
  /**
   * 设置提货点信息
   */
  setCarrierInfo: function (carrierInfo) {
    this.setData({
      //自提点Id
      carrierId: carrierInfo.id,
      //取货地址
      carrierAddress: carrierInfo.address,
      //联系人
      carrierMobile: carrierInfo.mobile,
      //取货时间
      carrierServerTime: carrierInfo.serverTime,
    })
  },

  /**
   * 获取优惠券
   */
  getMyShopCoupons: function () {
    let that = this
    let orderInfo = {
      //门店Id
      shopId: this.data.shopId,
      //用户ID
      peopleId: app.globalData.userInfo.peopleId,
      //支付金额
      price: this.data.payAmount,
    }
    //商品数据
    let orderGoods = []
    this.data.shopCart.forEach((item) => {
      let goods = {
        shopId: that.data.shopId,
        goodsId: item.goodsId,
        total: item.total,
        price: item.price,
        realPrice: item.realPrice
      }
      orderGoods.push(goods)
    })
    orderInfo.goodsItems = orderGoods

    wx.showLoading({
      title: '正在加载数据，请稍后...',
      mask: true
    })

    wx.request({
      url: myShopCouponsUrl,
      method: 'post',
      data: orderInfo,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取优惠券出错,网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取优惠券信息失败！',
            icon: 'none'
          });
          return
        }
        console.info(res.data.data)
        that.setData({
          //可用红包个数
          useCouponCount: res.data.code,
          //红包描述
          couponDetail: res.data.message,
          //优惠券列表
          myCoupons: res.data.data
        })
        //有可用红包
        if (that.data.useCouponCount > 0) {
          let couponMonery = res.data.data[0].productByMoney
          let cartTotal = shopcartUtil.getShopCartTotal(that.data.cartTypeName)
          let payAmount = parseFloat((cartTotal.sumPrice - couponMonery + (that.data.dispatchPrice - that.data.dispatchDiscountPrice) + that.data.packPrice).toFixed(2))
          that.setData({
            selectCoupon: res.data.data[0],
            couponDetail: "-￥" + couponMonery,
            couponMonery: couponMonery,
            payAmount: payAmount
          })
        }
      }
    })
  },

  /**
   * 生成订单数据
   */
  createOrderInfo: function () {

    if (this.data.dispatchType == -1) {
      wx.showToast({
        title: '请选择配送方式！',
        icon: 'none'
      });
      return null
    }
    if (this.data.shopCart.length == 0) {
      wx.showToast({
        title: '没有商品数据！',
        icon: 'none'
      });
      return null
    }
    if (this.data.pickerName.trim() == '') {
      wx.showToast({
        title: '请输入提货人姓名',
        icon: 'none'
      });
      return null
    }
    //门店自提
    if (this.data.dispatchType == 1) {
      if (this.data.carrierId == 0) {
        wx.showToast({
          title: '请选择提货点！',
          icon: 'none'
        });
        return null
      }
    }
    //配送到家
    else {
      if (this.data.regionInfo == "" || this.data.regionInfo == "配送地址") {
        wx.showToast({
          title: '请选择配送地址！',
          icon: 'none'
        });
        return null
      }
      if (this.data.detailInfo == "" || this.data.regionInfo == "选择&录入配送地址") {
        wx.showToast({
          title: '请选择配送地址！',
          icon: 'none'
        });
        return null
      }
    }
    //营销类型 0 正常售卖 1 预售 2 总部促销 3 社区购
    let goods = this.data.shopCart[0]
    let marketType = goods.marketType
    //如果是社区购写入3 暂时拿掉
    // if (this.data.supplierActivityId > 0) {
    //   marketType = 3
    // }

    let payType = 2
    let orderInfo = {
      //优选
      platform: 2,
      //分享人
      parentId: this.data.parentId,
      //门店Id
      shopId: this.data.shopId,
      //门店code
      shopCode: app.globalData.shopInfo.code,
      //门店名称
      shopName: app.globalData.shopInfo.name,
      //自提点Id
      carrierId: this.data.carrierId,
      //取货地址
      carrierAddress: this.data.carrierAddress,
      //联系人
      carrierMobile: this.data.carrierMobile,
      //取货时间
      carrierServerTime: this.data.carrierServerTime,
      //配送各区域
      regionInfo: this.data.regionInfo,
      //配送地址
      detailInfo: this.data.detailInfo,
      //推广来源
      orderSource: this.data.orderSource,
      //订单类型 0 门店 2 总部
      orderType: goods.isPlatform,
      //营销类型  0 正常售卖 1 预售  2 社区购
      marketType: marketType,
      //营销id
      marketId: this.data.marketId,
      //营销明细
      marketDetailId: this.data.marketDetailId,
      //用户ID
      peopleId: app.globalData.userInfo.peopleId,
      //openId
      openId: app.globalData.userInfo.wxMinOpenId,
      //平台Id
      merchantId: goods.merchantId,
      //供应商ID
      supplierId: goods.supplierId,
      //订单备注
      buyRemark: this.data.buyRemark,
      //提货人
      pickerName: this.data.pickerName,
      //提货人电话
      pickerMobile: this.data.pickerMobile,
      //配送方式 = 自提
      dispatchType: this.data.dispatchType,
      //支付金额
      price: this.data.payAmount,
      //商品金额
      goodsPrice: this.data.payAmount,
      //优惠金额
      discountPrice: 0,
      //使用优惠券Id
      useCouponId: 0,
      //优惠券卡
      useCouponCode: "",
      //是否售卖优享卡
      isSaleCoupon: 0,
      //优享卡Id
      couponId: 0,
      //供应商活动Id
      supplierActivityId: this.data.supplierActivityId,
      //直播间Id
      roomId: this.data.roomId,
      //原订单Id
      originalOrderId: this.data.originalOrderId,
      //蜂鸟配送测试
      isSend: this.data.isSend,
      //配送费
      dispatchPrice: this.data.dispatchPrice,
      //包装费
      packPrice: this.data.packPrice,
      //配送优惠Id
      discountSetId: this.data.discountSetId,
      //配送优惠金额
      dispatchDiscountPrice: this.data.dispatchDiscountPrice,
      //提货时间
      takeTime: this.data.takeTime,
      //渠道商户号
      chnlMrchNo: app.globalData.chnlMrchNo,
      //支付方式
      payType: payType,
      //促销活动id
      saleActivityId: this.data.saleActivityId,
      //换购活动id
      exchangeActivityId: this.data.exchangeActivityId,
      //团长活动id
      groupBuyActivityId: this.data.groupBuyActivityId
    }
    //门店自提，不写入配送地址
    if (this.data.dispatchType == 1) {
      orderInfo.regionInfo = ''
      orderInfo.detailInfo = ''
    }
    //配送到家不写入自提点
    else {
      //自提点Id
      orderInfo.carrierId = 0
      if(this.data.groupBuyActivityId>0){
        orderInfo.carrierId = this.data.carrierId
      }
      //取货地址
      orderInfo.carrierAddress = ''
      //联系人
      orderInfo.carrierMobile = ''
      //取货时间
      orderInfo.carrierServerTime = ''
    }
    //优惠券金额
    if (this.data.selectCoupon) {
      orderInfo.useCouponId = this.data.selectCoupon.couponId
      orderInfo.useCouponCode = this.data.selectCoupon.couponCode
      orderInfo.discountPrice = this.data.selectCoupon.productByMoney
    }

    //商品数据
    let orderGoods = []
    let that = this
    let sumTotal = 0
    this.data.shopCart.forEach((item) => {
      sumTotal += item.total
      let goods = {
        shopId: that.data.shopId,
        goodsId: item.goodsId,
        goodssn: item.goodssn,
        total: item.total,
        price: item.price,
        realPrice: item.realPrice,
        productPrice: item.productPrice
      }
      if (item.middleGoodsPromotion) {
        goods.promotionDiscountPrice = item.promotionDiscountPrice
        goods.promotionType = item.middleGoodsPromotion.promotionType
        goods.middlePromotionId = item.middleGoodsPromotion.middlePromotionId
      }
      if (item)
        orderGoods.push(goods)
    })
    //如果存在换购商品
    if (this.data.selectExchangeGoods != null) {
      let item = this.data.selectExchangeGoods
      sumTotal += 1
      let goods = {
        shopId: that.data.shopId,
        goodsId: item.id,
        goodssn: item.goodssn,
        total: 1,
        price: item.marketPrice,
        realPrice: item.marketPrice,
        productPrice: item.productPrice,
        isExchange: 1 //是否换购商品
      }
      if (item.middleGoodsPromotion) {
        goods.promotionDiscountPrice = item.productPrice - item.marketPrice
        goods.promotionType = item.middleGoodsPromotion.promotionType
        goods.middlePromotionId = item.middleGoodsPromotion.middlePromotionId
      }
      if (item)
        orderGoods.push(goods)
    }
    if (sumTotal == 0) {
      wx.showToast({
        title: '商品数量为零！',
        icon: 'none'
      });
      return null
    }
    //添加商品数据
    orderInfo.goodsItems = orderGoods
    //设置提货人缓存
    wx.setStorageSync("pickerName", this.data.pickerName)
    wx.setStorageSync("pickerMobile", this.data.pickerMobile)

    return orderInfo
  },

  /**
   * 提交订单
   */
  submitShopOrder: function () {
    if (this.data.isSubmit) return
    this.setData({
      isSubmit: true
    })
    let orderInfo = this.createOrderInfo();
    if (orderInfo == null) {
      this.setData({
        isSubmit: false
      })
      return
    }
    console.log(JSON.stringify(orderInfo))
    //提交数据
    wx.showLoading({
      title: '正在提交订单，请稍后...',
      mask: true
    })
    let that = this
    wx.request({
      url: submitShopOrderUrl,
      method: 'post',
      data: orderInfo,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '订单提交出错,网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        that.setData({
          isSubmit: false
        })
        //判断是否有错
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '提交订单异常！',
            icon: 'none'
          });
          return
        }
        //无需支付
        if (res.data.code == 1) {
          setTimeout(function () {
            that.toBack(that)
          }, 200)
        }
        //发起支付
        else {
          that.setData({
            orderId: res.data.data.orderId,
            ordersn: res.data.data.ordersn,
            //是否赠送优惠券
            couponSetId: res.data.data.couponSetId
          })
          that.callWxPay(res.data.data)
        }
      },
      fail: function () {
        that.setData({
          isSubmit: false
        })
      }
    })
  },

  payOrder: function () {
    if (this.data.isPay) return
    this.setData({
      isPay: true
    })
    //提交数据
    wx.showLoading({
      title: '加载中，请稍后...',
      mask: true
    })

    let that = this
    wx.request({
      url: payOrderUrl,
      data: {
        shopId: this.data.shopId,
        orderId: this.data.orderId,
        peopleId: app.globalData.userInfo.peopleId,
      },
      fail: function (err) {
        this.setData({
          isPay: false
        })
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        that.setData({
          isPay: false
        })
        //判断是否有错
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '支付订单单异常！',
            icon: 'none'
          });
          return
        }
        //无需支付的订单
        if (res.data.code == 1) {
          setTimeout(function () {
            that.toBack(that)
          }, 200)
        } else {
          //发起支付
          that.callWxPay(res.data.data)
        }

      }
    })
  },

  /**
   * 调用微信支付
   */
  callWxPay: function (weChatInfo) {
    let that = this
    //发送数据到有数
    that.sendOrderData(that.data.ordersn, "pay", that.data.defaultPayAmount, that.data.payAmount)
    wx.requestPayment({
      timeStamp: weChatInfo.timeStamp,
      nonceStr: weChatInfo.nonceStr,
      package: weChatInfo.package1,
      signType: weChatInfo.signType,
      paySign: weChatInfo.paySign,
      //用户放弃支付，只给提示
      fail: function (err) {
        console.log(err);
        //发送数据到有数
        that.sendOrderData(that.data.ordersn, "cancel_pay", that.data.defaultPayAmount, that.data.payAmount)
        let _msg = err.message
        if (_msg == undefined) {
          _msg = "支付失败!"
          wx.redirectTo({
            url: '/pages/shoporderinfo/shoporderinfo?shopId=' + that.data.shopId + '&orderId=' + that.data.orderId,
          })
        }
        wx.showToast({
          title: _msg,
          icon: 'none'
        });

        wx.request({
          url: payFaildOrderUrl,
          data: {
            shopId: that.data.shopId,
            orderId: weChatInfo.orderId
          },
          method: 'GET',
          success: function (res) {
            // wx.switchTab({
            //   url: '../shoporder/shoporder?tab=1',
            // })
          },
          fail: function (res) {},
          complete: function (res) {},
        })
      },
      //支付成功
      success: function (res) {
        that.clearShopCart()
        //售卡，直接跳转卡界面
        setTimeout(function () {
          that.toBack(that)
        }, 200)
      }
    })
  },

  /**
   * 清空父页面购物车数据
   */
  clearShopCart: function () {
    shopcartUtil.clearShopCart(this.data.cartTypeName)
    shopcartUtil.caulTotal(this.data.cartTypeName)
  },

  toHuarunRegister() {
    //已经是会有
    let isRegisterSugo = app.isRegisterSugo()
    if (isRegisterSugo)
      return true
    //已经提示过
    if (this.data.isRegister) return true
    this.setData({
      isRegister: true
    })
    let that = this
    let url = app.getHuaRunRegisterUrl()
    let param = app.getHuaRunRegisterParam()
    url += '?' + param

    url = encodeURIComponent(url)
    url = "https://cloud.huaruntong.cn/web/middlepage/wechatapp.html#?redirect_uri=" + url
    console.info("华润通跳转：" + url)
    url = encodeURIComponent(url)
    let result = false
    wx.showModal({
      content: "是否绑定苏果会员？",
      confirmText: '确定',
      cancelText: '取消',
      success: function (res) {
        result = res.confirm
        if (result) {
          console.info("华润通跳转：" + url)
          wx.navigateTo({
            url: '../webView/webView?path=' + url,
            success() {
              console.log('success')
            },
            fail() {
              console.log('fail')
            },
            complete() {}
          })
        }
        //直接下单
        else {
          if (!that.data.orderId)
            that.submitShopOrder()
          else {
            that.payOrder()
          }
        }
      }
    })
    return false
  },

  //测试用
  btnPay: function (e) {
    let that = this
    console.log("that.data.tmplIds", that.data.tmplIds)
    let tmplIds = that.data.tmplIds
    if (typeof wx.requestSubscribeMessage === 'function') {
      wx.requestSubscribeMessage({
        tmplIds: tmplIds,
        success(res) {
          console.log('requestSubscribeMessage', res)
          let acceptId = [];
          tmplIds.forEach(item => {
            if (res[item] == 'accept') {
              //用户同意了订阅，添加进数据库
              acceptId.push(item);
            } else {
              //用户拒绝了订阅
            }
          })
          if (acceptId.length) {
            that.addAccept(acceptId);
          }
        },
        fail(res) {
          console.log('requestSubscribeMessage-fail', res)
        },
        complete() {
          //判断是否注册过苏果会员，如果没有注册，注册一次
          if (!that.toHuarunRegister()) return //暂时注释 tsp
          if (!that.data.orderId)
            that.submitShopOrder()
          else {
            that.payOrder()
          }
        }
      })
    } else {
      if (!that.toHuarunRegister()) return //暂时注释 tsp
      if (!that.data.orderId)
        that.submitShopOrder()
      else {
        that.payOrder()
      }
    }

  },
  //获取可订阅的模版消息ids
  getSubscribeTempIds: function () {
    let that = this
    wx.request({
      url: subscribeTempIdsUrl,
      fail: function (err) {
        console.log("获取可订阅的模版消息网络出错")
      },
      success: function (res) {
        if (!res.data.flag) {
          console.log(res.data.message)
          return
        }
        that.setData({
          tmplIds: res.data.data
        })
      }
    })
  },
  // 用户点击订阅添加到数据库
  addAccept: function (acceptId) {
    let templateIds = acceptId.join(',');
    wx.request({
      url: subscribeMsgUrl,
      data: {
        peopleId: app.globalData.userInfo.peopleId,
        openId: app.globalData.userInfo.wxMinOpenId,
        templateIds: templateIds
      },
      fail: function (err) {
        console.log("订阅的模版消息网络出错")
      },
      success: function (res) {
        console.log(res.data.message)
        if (!res.data.flag) {
          wx.showToast({
            title: '订阅成功'
          })
        }
      }
    })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  //跳转到商品详情页
  toGoodsInfo: function (e) {
    let goodsId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/goods/goods?goodsId=' + goodsId + '&fromPage=shoppay'
    })
  },
  /**
   * 选择提货点
   */
  hideModal(e) {
    this.setData({
      modalName: null
    })
    let carrier = e.currentTarget.dataset.carrier
    if (carrier == undefined) return
    this.setData({
      //自提点Id
      carrierId: carrier.id,
      //取货地址
      carrierAddress: carrier.address,
      //联系人
      carrierMobile: carrier.mobile,
      //取货时间
      carrierServerTime: carrier.serverTime,
    })
    //将提货点存入到缓存
    wx.setStorageSync("carrierInfo", carrier)
    this.getOrderTakeTime()
  },

  changeName: function (e) {
    let pickerName = e.detail.value
    this.setData({
      pickerName: pickerName
    })
  },

  changeMobile: function (e) {
    let pickerMobile = e.detail.value
    this.setData({
      pickerMobile: pickerMobile
    })
  },

  changeBuyRemark: function (e) {
    let buyRemark = e.detail.value
    this.setData({
      buyRemark: buyRemark
    })
  },

  /**
   * 选择优惠券
   */
  toShopCoupon: function (e) {
    wx.navigateTo({
      url: '/pages/shopcoupon/shopcoupon',
    })
  },

  toBack() {
    //--------------------- 这里直接跳转到订单 wyx delete it -------------------
    // wx.showLoading({
    //   title: '正在获取，订单信息...',
    //   mask: true
    // })
    //售卡，直接跳转卡界面
    // if(this.data.couponSetId && this.data.couponSetId > 0){
    //   app.setCouponSetId(this.data.couponSetId)
    //   app.setOrderId(this.data.orderId)
    // }
    // let that = this
    // wx.navigateBack({
    //   complete: (res) => {
    //     let pages = getCurrentPages();
    //     let prevPage = pages[pages.length - 1];  //上一个页面
    //     prevPage.toShopOrder()
    //   },
    // })
    //如果有订单送券
    if (this.data.couponSetId && this.data.couponSetId > 0) {
      // this.getCouponSetInfo()
      // return
      //跳转订单
      wx.redirectTo({
        url: '../paymentSuccess/paymentSuccess?isShowShare=' + this.data.isShowShare + '&couponSetId=' + this.data.couponSetId + '&orderId=' + this.data.orderId,
      })
    }
    //跳转订单
    wx.redirectTo({
      url: '../paymentSuccess/paymentSuccess?isShowShare=' + this.data.isShowShare,
    })
  },

  /**
   * 获取订单送券详细信息
   * @param {} couponSetId
   */
  getCouponSetInfo() {
    this.setData({
      couponSetId: this.data.couponSetId,
      orderId: this.data.orderId
    })

    let that = this
    wx.request({
      url: getCouponSetInfoUrl,
      data: {
        couponSetId: this.data.couponSetId
      },
      fail: function (err) {
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },

      success: function (res) {
        if (!res.data.flag) {
          wx.showToast({
            title: '获取订单券信息出错！',
            icon: 'none'
          });
        }
        //赋值 couponSetInfo.displayImg 展示图
        if (res.data.data) {
          that.setData({
            couponSetInfo: res.data.data,
            popModelIsShow: true
          })
        }
      }
    })
  },

  /**
   *  弹窗点击事件
   */
  toCouponSet() {
    let couponSetInfo = this.data.couponSetInfo;
    let orderId = this.data.orderId
    this.setData({
      popModelIsShow: false
    })
    //售卡，跳转卡界面
    if (couponSetInfo.giveType == 2) {
      wx.redirectTo({
        url: '../mycardbag/mycardbag?ids=' + couponSetInfo.giveCoupons,
      })
    }
    //老虎机抽奖
    else if (couponSetInfo.giveType == 3) {
      wx.redirectTo({
        url: '../machine/index?activeId=' + couponSetInfo.giveCoupons + '&orderId=' + orderId,
      })
    }
    //跳转优惠券列表
    else {
      wx.redirectTo({
        url: '../mycoupon/mycoupon'
      })
    }

  },
  //关闭弹窗
  popCloseBtn() {
    this.setData({
      popModelIsShow: false
    })
  },

  /**
   * 选择提货点
   */
  chooeAddress: function () {
    let that = this
    wx.chooseAddress({
      success: (res) => {
        console.log(res)
        that.setData({
          // pickerName : res.userName,
          // pickerMobile : res.telNumber,
          regionInfo: res.provinceName + '-' + res.cityName + '-' + res.countyName,
          detailInfo: res.detailInfo
        })
        // let goodsItems = []
        // that.data.shopCart.forEach((item) => {
        //   let goodsDetail = {
        //     goodssn: item.goodsId,
        //     total: item.total
        //   }
        //   goodsItems.push(goodsDetail)
        // });
        // let feeData = {
        //   regionInfo : that.data.regionInfo,
        //   detailInfo : that.data.detailInfo,
        //   shopId: that.data.shopId,
        //   goodsItems: goodsItems
        // }
        // console.log(feeData)
        // console.log(JSON.stringify(feeData))
        // wx.request({
        //   url: getDeliverFeeUrl,
        //   method: 'post',
        //   data: feeData,
        //   fail: function (err) {
        //     wx.showToast({
        //       title: '网络异常！',
        //       icon: 'none'
        //     });
        //   },

        //   success: function (res) {
        //     if (!res.data.flag) {
        //       wx.showToast({
        //         title: res.data.message,
        //         icon: 'none'
        //       });
        //     }
        //     else{
        //       that.setData({
        //         dispatchPrice: res.data.data,
        //       })
        //     }
        //   }
        // })
        wx.setStorageSync("regionInfo", that.data.regionInfo)
        wx.setStorageSync("detailInfo", that.data.detailInfo)
        //TODO : 获取配送费用
        if (this.data.dispatchType != 1 && this.data.isDelivery == 0) {
          this.getDeliverFee()
        } else {
          this.setData({
            dispatchPrice: 0,
            isSend: 0,
            packPrice: 0
          })
        }
      },
      fail: function (err) {
        console.log(JSON.stringify(err))
      }
    })
  },

  showRadioModal: function () {
    this.setData({
      modalName: "RadioModal"
    })
  },

  hideRadioModal: function () {
    this.setData({
      modalName: null
    })
    if (this.data.dispatchType == 1) {
      this.setData({
        hideTake: false,
        hideAddrress: true,
        hideSelectDispatchType: false,
        dispatchTitle: "提货时间：周一到周日7点到9点",
        dispatchPrice: 0,
        payAmount: parseFloat(this.data.defaultPayAmount - this.data.couponMonery).toFixed(2),
        isSend: 0
      })
    } else {
      let isSend = 0
      let dispatchTitle = "厂家直送，快递到家"
      if (this.data.isDelivery == 0) {
        dispatchTitle = "由蜂鸟骑手配送，预计一小时内送达"
        isSend = 1
        this.setData({
          hideTake: true,
          hideAddrress: false,
          hideSelectDispatchType: false,
          dispatchTitle: dispatchTitle,
          isSend: isSend,
          packPrice: 1
        })
        //获取配送费
        this.getDeliverFee()
      } else {
        this.setData({
          payAmount: parseFloat(this.data.defaultPayAmount - this.data.couponMonery).toFixed(2),
          isSend: isSend
        })
      }
    }
  },

  /**
   * 选择配送方式
   * @param {*} e
   */
  radiotap: function (e) {
    console.info(e)
    console.info(e.currentTarget.dataset.value)
    let dispatchType = e.currentTarget.dataset.value
    this.setData({
      dispatchType: dispatchType,
      dispatchPrice: 0,
      discountSetId: 0,
      dispatchDiscountPrice: 0,
      isSend: 0,
      packPrice: 0
    })
    this.hideRadioModal()
  },
  //获取门店信息
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
        that.setData({
          isOto: res.data.data.isOto
        })
        //如果门店是oto
        if (that.data.isOto == 1) {
          //只能自提
          if (that.data.deliveryWay == 1) {
            that.setData({
              hideTake: false,
              hideAddrress: true,
              hideSelectDispatchType: true,
              dispatchTitle: "提货时间：周一到周日7点到9点",
              dispatchType: 1,
              hidetabbar: true
            })
          } else {
            let dispatchList = that.data.dispatchList
            if (that.data.isDelivery == 1) {
              let dispatchTitle = "厂家直送，快递到家"
              that.setData({
                hideTake: true,
                hideAddrress: false,
                hideSelectDispatchType: true,
                dispatchTitle: dispatchTitle,
                dispatchType: 2,
                hidetabbar: true
              })
            } else {
              that.setData({
                hideTake: false,
                hideAddrress: true,
                hideSelectDispatchType: false,
                dispatchType: 1,
                dispatchList: dispatchList
              })
            }
          }

        } else {
          //配送方式可选
          if (that.data.deliveryWay == 0) {
            let dispatchList = that.data.dispatchList
            if (that.data.isDelivery == 1) {
              dispatchList[1].description = "厂家直送，快递到家"
              that.setData({
                hideTake: true,
                hideAddrress: false,
                hideSelectDispatchType: false,
                dispatchType: 1,
                dispatchList: dispatchList,
                hidetabbar: true
              })
            } else {
              that.setData({
                hideTake: false,
                hideAddrress: true,
                hideSelectDispatchType: false,
                dispatchType: 1,
                dispatchList: dispatchList,
                hidetabbar: true
              })
            }
          }
          //门店自提
          else if (that.data.deliveryWay == 1) {
            that.setData({
              hideTake: false,
              hideAddrress: true,
              hideSelectDispatchType: true,
              dispatchTitle: "提货时间：周一到周日7点到9点",
              dispatchType: 1,
              hidetabbar: true
            })
          }
          //配送到家
          else {
            let dispatchTitle = "厂家直送，快递到家"
            if (that.data.isDelivery == 0) {
              dispatchTitle = "由蜂鸟骑手配送，预计一小时内送达"
            }
            that.setData({
              hideTake: true,
              hideAddrress: false,
              hideSelectDispatchType: true,
              dispatchTitle: dispatchTitle,
              dispatchType: 2,
              hidetabbar: true
            })
          }
        }
        console.log(that.data.hideSelectDispatchType)
      }
    })
  },

  /**
   * 获取配送费
   */
  getDeliverFee: function () {
    if (this.data.isSend != 1) return
    if (this.data.regionInfo == '' || this.data.detailInfo == '') return
    let price = parseFloat((this.data.cartTotal.sumPrice - this.data.couponMonery).toFixed(2))
    let orderInfo = {
      //门店Id
      shopId: this.data.shopId,
      peopleId: app.globalData.userInfo.peopleId,
      price: price,
      //配送各区域
      regionInfo: this.data.regionInfo,
      // regionInfo: '江苏省-南京市-秦淮区',
      // detailInfo: '江苏商业管理干部学院(华鑫大厦东)',
      //配送地址
      detailInfo: this.data.detailInfo
    }

    let orderGoods = []
    let that = this
    let sumTotal = 0
    this.data.shopCart.forEach((item) => {
      sumTotal += item.total
      let goods = {
        goodsId: item.goodsId,
        total: item.total
      }
      orderGoods.push(goods)
    })
    if (sumTotal == 0) {
      wx.showToast({
        title: '商品数量为零！',
        icon: 'none'
      });
      return null
    }
    //添加商品数据
    orderInfo.goodsItems = orderGoods

    wx.request({
      url: getDeliverFeeDiscountSetByPeopleUrl,
      method: 'post',
      data: orderInfo,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取配送费出错，网络异常',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取配送费出错',
            icon: 'none'
          });
          return
        }
        let deliverFeeData = res.data.data
        //配送费
        let dispatchPrice = deliverFeeData.deliverFee
        //配送费优惠Id
        let discountSetId = deliverFeeData.discountSetId
        //配送费优惠金额
        let dispatchDiscountPrice = deliverFeeData.dispatchDiscountPrice


        let cartTotal = shopcartUtil.getShopCartTotal(that.data.cartTypeName)
        //配送优惠金额大于配送配，配送优惠金额等于配送费
        if (dispatchDiscountPrice > dispatchPrice)
          dispatchDiscountPrice = dispatchPrice

        let payAmount = parseFloat(cartTotal.sumPrice - that.data.couponMonery + (dispatchPrice - dispatchDiscountPrice) + that.data.packPrice + that.data.exchangeGoodsPrice).toFixed(2)
        that.setData({
          discountSetId: discountSetId,
          dispatchDiscountPrice: dispatchDiscountPrice,
          dispatchPrice: dispatchPrice,
          payAmount: payAmount,
          freightTips: res.data.message
        })

      }
    })
  },
  changeTab: function (e) {
    let curIndex = e.currentTarget.dataset.index
    this.setData({
      currentTab: curIndex
    })
    if (curIndex == 0) {
      this.setData({
        hideTake: false,
        hideAddrress: true,
        hideSelectDispatchType: false,
        dispatchTitle: "提货时间：周一到周日7点到9点",
        dispatchPrice: 0,
        payAmount: parseFloat(this.data.defaultPayAmount - this.data.couponMonery + this.data.exchangeGoodsPrice).toFixed(2),
        isSend: 0,
        dispatchType: 1,
        packPrice: 0,
        dispatchDiscountPrice: 0,
        discountSetId: 0
      })
    } else {
      let isSend = 0
      let dispatchTitle = "厂家直送，快递到家"
      if (this.data.isDelivery == 0) {
        dispatchTitle = "由蜂鸟骑手配送，预计一小时内送达"
        isSend = 1
        this.setData({
          hideTake: true,
          hideAddrress: false,
          hideSelectDispatchType: false,
          dispatchTitle: dispatchTitle,
          isSend: isSend,
          packPrice: 1,
          dispatchType: 2
        })
        //获取配送费
        this.getDeliverFee()
      } else {
        this.setData({
          payAmount: parseFloat(this.data.defaultPayAmount - this.data.couponMonery).toFixed(2),
          isSend: isSend,
          dispatchType: 2
        })
      }
    }
  },
  showTakeTimeModal: function (e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideTakeTimeModal: function (e) {
    this.setData({
      modalName: null
    })
  },
  //选择配送日期
  chooseDeliveryDay: function (e) {
    let timelist = e.currentTarget.dataset.timelist
    let index = e.currentTarget.dataset.index
    this.setData({
      canSelectTimeList: timelist,
      expectDateSelectIndex: index,
      takeTimeIndex: 0,
      takeTime: timelist[0].intervalValue,
    })
  },
  //选择配送时间
  takeTimeSelectTap: function (e) {
    let item = e.currentTarget.dataset.value
    let index = e.currentTarget.dataset.index
    this.setData({
      takeTimeIndex: index,
      takeTime: item.intervalValue,
      expectTime: "约" + item.intervalName + "送达"
    })
    this.hideTakeTimeModal()
  },
  //获取配送时间列表
  getDeliverTimeInterval(shopId) {
    let that = this
    wx.request({
      url: findShopDeliverTimeIntervalUrl,
      data: {
        shopId: shopId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取配送时间出错',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取配送时间出错',
            icon: 'none'
          });
        } else {
          that.setData({
            expectTime: res.data.code,
            deliveryTimeList: res.data.data,
            canSelectTimeList: res.data.data[0].timeIntervalList,
            takeTime: res.data.data[0].timeIntervalList[0].intervalValue
          })
        }
      }
    })
  },
  //查询订单提货时间
  getOrderTakeTime: function () {
    if (this.data.isSend == 1) return
    //营销类型 0 正常售卖 1 预售 2 总部促销 3 社区购
    let goods = this.data.shopCart[0]
    let marketType = goods.marketType
    let orderInfo = {
      //门店Id
      shopId: this.data.shopId,
      peopleId: app.globalData.userInfo.peopleId,
      marketType: marketType,
      //团长活动id
      groupBuyActivityId: this.data.groupBuyActivityId,
      //自提点Id
      carrierId: this.data.carrierId
    }

    let orderGoods = []
    let that = this
    let sumTotal = 0
    this.data.shopCart.forEach((item) => {
      sumTotal += item.total
      let goods = {
        goodsId: item.goodsId,
        total: item.total
      }
      orderGoods.push(goods)
    })
    if (sumTotal == 0) {
      wx.showToast({
        title: '商品数量为零！',
        icon: 'none'
      });
      return null
    }
    //添加商品数据
    orderInfo.goodsItems = orderGoods

    wx.request({
      url: getOrderTakeTimeUrl,
      method: 'post',
      data: orderInfo,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取提货时间，网络异常',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取提货时间',
            icon: 'none'
          });
          return
        }
        let takeTimeDescription = res.data.data

        that.setData({
          takeTimeDescription: takeTimeDescription
        })

      }
    })
  },
  /**
   * 获取订单换购商品
   */
  geOrderExchangeGoods: function () {
    let that = this
    let orderInfo = {
      //门店Id
      shopId: this.data.shopId,
      //用户ID
      peopleId: app.globalData.userInfo.peopleId,
      //支付金额
      price: this.data.payAmount,
    }
    //商品数据
    let orderGoods = []
    this.data.shopCart.forEach((item) => {
      let goods = {
        shopId: that.data.shopId,
        goodsId: item.goodsId,
        total: item.total,
        price: item.price,
        realPrice: item.realPrice
      }
      orderGoods.push(goods)
    })
    orderInfo.goodsItems = orderGoods

    wx.showLoading({
      title: '正在加载数据，请稍后...',
      mask: true
    })

    wx.request({
      url: getExchangeActivityUrl,
      method: 'post',
      data: orderInfo,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取换购信息出错,网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        if (!res.data.flag) {
          console.info(res.data.message)
          return
        }
        that.setData({
          //换购活动信息
          exchangeActivity: res.data.data,
        })
      }
    })
  },

  //展示所有购物车商品
  showAllCartGoods: function () {
    this.setData({
      ishowallCartgoods: !this.data.ishowallCartgoods
    })
  },
  selectExchangeGoods: function (e) {
    let id = e.currentTarget.dataset.id;
    this.data.exchangeActivity.shopGoodsListDtoList.forEach((item => {
      if (item.id == id) {
        item.selected = !item.selected
        if (item.selected) {
          this.setData({
            selectExchangeGoods: item,
            payAmount: (parseFloat(this.data.payAmount) - this.data.exchangeGoodsPrice + item.marketPrice).toFixed(2),
            exchangeGoodsPrice: item.marketPrice,
            exchangeActivityId: this.data.exchangeActivity.id
          })
        } else {
          this.setData({
            selectExchangeGoods: null,
            payAmount: (parseFloat(this.data.payAmount) - item.marketPrice).toFixed(2),
            exchangeGoodsPrice: 0,
            exchangeActivityId: 0
          })
        }
      } else {
        item.selected = false
      }
    }))
    this.setData({
      exchangeActivity: this.data.exchangeActivity
    })
  },
  /**
   * 有数提交
   * @param ordersn 订单编号
   * @param state 去结算 give_order 立即支付 pay 关闭支付 cancel_pay
   * @param orderPrice 订单金额
   * @param payPrice 应付金额
   */
  sendOrderData: function (ordersn, state, orderPrice, payPrice) {
    const orderPriceF = parseFloat(orderPrice).toFixed(2)*1;
    const payPriceF = parseFloat(payPrice).toFixed(2)*1;
    app.TXYouShu.track('custom_order', {
      "order": {
        "order_id": ordersn,
        "order_time": new Date().getTime(),
        "order_status": state
      },
      "sub_orders": [{
        "sub_order_id": ordersn,
        "order_amt": orderPriceF,
        "pay_amt": payPriceF
      }],
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
