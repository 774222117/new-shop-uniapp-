const app = getApp()
//详细信息
const findSupplierActivityInfourl = require('../../utils/config.js').httpConfig.findSupplierActivityInfourl;
//社区购接龙数据
const findSupplierActivityOrders = require('../../utils/config.js').httpConfig.findSupplierActivityOrders;
const isSharePeopleUrl = require('../../utils/config.js').httpConfig.isSharePeopleUrl
const getNearbyShopOneUrl = require('../../utils/config.js').httpConfig.getNearbyShopOne
let shopcartUtil = require('../../utils/shopcart')
//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
// yb 优惠券详情
const couponDetailsUrl = require('../../utils/config.js').httpConfig.couponDetailsUrl;
// yb 领券
const submitConponUrl = require('../../utils/config.js').httpConfig.submitConponUrl;
const PosterParam = require('../../utils/config.js').httpConfig.PosterParam;
const GetSceneParam = require('../../utils/util.js').GetSceneParam;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopId: '',
    shopInfo: {},
    //供应商活动Id
    supplierActivityId: 0,
    //可用门店分类
    useShopCategory: -1,
    //商品列表
    goodsInfoList: [],
    //活动信息
    activityInfo: null,
    //社区购接龙数据列表
    activityOrdersList: [],
    //接龙数据列表当前页码
    pn: 0,
    hasMore: false,
    testvalue: 0,
    //已经参数人数
    orderNumber: 0,
    //购物车
    cartTypeName: '',
    shopCart: [],
    cartShopTotal: {},
    //是否显示佣金
    showRate: false,
    parentId: '',
    is_share_html: true,
    roomId: 0,
    //yb 是否弹窗领取优惠券
    isShowReceiveCoupon: 0,
    //yb 是否分销人员
    isSharePeople: false,
    //支付成功页是否显示 分享弹框
    isShowShare: 0,
    //是否选择门店
    chooseShop: 0,
    goodspn: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    //获取二维码参数
    GetSceneParam(PosterParam, options, function (res) {
      options = res
      if (options.parentId != undefined) {
        app.setParentId(options.parentId)
      }
      //yb 是否弹窗
      console.log(options.isShowReceiveCoupon)
      if (options.isShowReceiveCoupon) {
        that.setData({
          isShowReceiveCoupon: options.isShowReceiveCoupon
        })
      }
      //直播间Id
      if (options.roomId) {
        that.setData({
          roomId: options.roomId
        })
        app.setRoomId(options.roomId)
      }
      if (options.chooseShop) {
        that.setData({
          chooseShop: options.chooseShop
        })
      }
      //判断登录
      // if (app.globalData.userInfo == null) {
      //   wx.redirectTo({
      //     url: '../login/login'
      //   })
      //   return
      // }
      let shopId = options.shopId
      if (options.activityId) {
        that.setData({
          supplierActivityId: options.activityId
        })
      } else {
        wx.showToast({
          title: '没有团购活动！',
          icon: 'none'
        });
        return
      }
      //上级ID
      if (options.parentId) {
        that.setData({
          parentId: options.parentId
        })
      }
      //获取门店信息
      if (shopId) {
        that.setData({
          shopId: shopId
        })
        if (app.globalData.shopInfo == null || shopId != app.globalData.shopInfo.id) {
          that.getShopById(shopId)
        } else {
          that.setData({
            shopInfo: app.globalData.shopInfo
          })
          that.checkIsSharePeople()
          //获取活动数据
          that.getSupplierActivityInfo()
          that.getSupplierActivityOrders()
        }
      } else {
        //缓存中不存在获取店铺信息
        if (app.globalData.shopInfo == null) {
          if (shopId) {
            that.getShopById(shopId)
          } else {
            //获取附近的门店
            wx.getLocation({
              success: function (res) {
                that.getNearShopOne(res.longitude, res.latitude)
              },
            })
          }
        } else {
          that.setData({
            shopId: app.globalData.shopInfo.id,
            shopInfo: app.globalData.shopInfo
          })
          that.checkIsSharePeople()
          //获取活动数据
          that.getSupplierActivityInfo()
          that.getSupplierActivityOrders()
        }
      }
    })
  },

  getNearShopOne: function (longitude, latitude) {
    let that = this
    //获取缓存中的门店信息
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
        supplierActivityId: that.data.supplierActivityId
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          let shopInfo = res.data.data
          app.setShopInfo(shopInfo)
          this.setData({
            shopInfo: shopInfo
          })
          that.checkIsSharePeople()
          that.getSupplierActivityInfo()
          that.getSupplierActivityOrders()
        } else {
          cnosole.log("获取最近门店出错！");
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
  },

  /**
   * 初始化购物车信息
   * @param {商品平台} isAloneCart 0 不单独购物车 1 单独购物车
   */
  initShopCart: function (isAloneCart) {
    let cartTypeName = shopcartUtil.cartType.OTO
    if (isAloneCart == 1) {
      cartTypeName = shopcartUtil.cartType.GroupBuy + "-" + this.data.supplierActivityId
    }
    let carInfo = shopcartUtil.initCartInfo(cartTypeName)
    let shopCart = carInfo.carts
    let cartShopTotal = carInfo.cartTotal

    if (cartShopTotal.sumPrice == undefined) {
      cartShopTotal.sumPrice = 0
      cartShopTotal.sumProductPrice = 0
      cartShopTotal.buyCount = 0
    }

    //写入已购数据  
    let goodsInfoList = this.data.goodsInfoList
    if (shopCart.length <= 0) { //支付成功后，返回到当前页，需要刷新商品列表已选择数量 为0
      goodsInfoList.forEach((goods) => {
        goods.buyCount = 0
      })
    } else {
      shopCart.forEach((item) => {
        goodsInfoList.forEach((goods) => {
          if (item.goodsId == goods.id) {
            goods.buyCount = item.total
          }
        })
      })
    }
    this.setData({
      goodsInfoList: goodsInfoList,
      cartTypeName: cartTypeName,
      shopCart: shopCart,
      cartShopTotal: cartShopTotal
    })
  },
  /**
   * 根据Id获取门店信息
   */
  getShopById: function (shopId, goodsId) {
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
        //写入缓存
        if (app.globalData.shopInfo && app.globalData.shopInfo.id != shopId) {
          shopcartUtil.clearShopCartList()
        }
        app.setShopInfo(res.data.data)
        that.setData({
          shopInfo: app.globalData.shopInfo
        })
        that.checkIsSharePeople()
        //获取活动数据
        that.getSupplierActivityInfo()
        that.getSupplierActivityOrders()
      }
    })
  },
  //检查用户是否是分销人员
  checkIsSharePeople: function () {
    let that = this
    //查询用户是否是分销人员
    wx.request({
      url: isSharePeopleUrl,
      data: {
        peopleId: app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1
      },
      success: function (res) {
        wx.hideLoading();
        that.setData({
          showRate: res.data.flag,
          isSharePeople: res.data.flag //yb
        })
      }
    })
  },
  /**
   * 获取社区购详细信息
   */
  getSupplierActivityInfo: function () {
    if (this.data.supplierActivityId == -1) {
      wx.showToast({
        title: '没有团购活动！',
        icon: 'none'
      });
      return
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this

    wx.request({
      url: findSupplierActivityInfourl,
      data: {
        peopleId: app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1,
        shopId: that.data.shopInfo.id,
        activityId: that.data.supplierActivityId,
        chooseShop: that.data.chooseShop,
        pn: that.data.goodspn,
        isNew: 1
      },

      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取团购活动网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取商品数据出错！',
            icon: 'none'
          });
        }
        //活动数据
        let activityInfo = {}
        activityInfo.id = res.data.data.id
        activityInfo.supplierId = res.data.data.supplierId
        activityInfo.title = res.data.data.title
        activityInfo.description = res.data.data.description
        activityInfo.imgUrl = res.data.data.imgUrl
        activityInfo.sketchMap = res.data.data.sketchMap
        activityInfo.deliveryWay = res.data.data.deliveryWay
        activityInfo.isDelivery = res.data.data.isDelivery
        activityInfo.startTime = res.data.data.startTime
        activityInfo.endTime = res.data.data.endTime
        activityInfo.takeTime = res.data.data.takeTime
        activityInfo.groupByCount = res.data.data.groupByCount
        activityInfo.couponIds = res.data.data.couponIds //yb
        //是否单独购物车
        activityInfo.isAloneCart = res.data.data.isAloneCart

        that.setData({
          deliveryWay: activityInfo.deliveryWay,
          activityInfo: activityInfo,
          useShopCategory: res.data.data.useShopCategory
        })

        //商品数据
        let resGoodsList = res.data.data.goodsList
        // let goodsInfoList = []
        // resGoodsList.forEach((item) => {
        //   goodsInfoList.push(item)
        // })
        let pnNext = that.data.goodspn + 1
        that.setData({
          goodsInfoList: that.data.goodsInfoList.concat(resGoodsList),
          goodspn: pnNext
        })

        that.initShopCart(activityInfo.isAloneCart)

        //是否获取优惠券 yb
        if (that.data.activityInfo.couponIds && that.data.activityInfo.couponIds != 0) {
          that.getCoupon(that.data.activityInfo.couponIds)
          that.setData({
            isShowShare: 1
          })
        }
      }
    })
  },

  //yb 获取优惠券数据
  getCoupon: function (couponId) {
    let that = this
    wx.request({
      url: couponDetailsUrl,
      data: {
        couponId: couponId,
        peopleId: app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1,
      },
      fail: function (err) {
        wx.hideLoading()
        // wx.showToast({
        //   title: '优惠券数据出错！',
        //   icon: 'none'
        // });
        that.setData({
          isShowReceiveCoupon: 0
        })
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          console.debug("获取优惠券出错：" + res.data.message)
          // wx.showToast({
          //   title: res.data.message || '获取优惠券数据出错',
          //   icon: 'none'
          // });
          that.setData({
            isShowReceiveCoupon: 0
          })
          return
        }
        that.setData({
          couponInfo: res.data.data,
        })
        if (that.data.isShowReceiveCoupon == 1) {
          that.setData({
            modalName: 'isShowReceiveCoupon'
          })
        }


      }
    })
  },

  //商品列表 修改数量
  buyCountEdit: function (e) {
    let goods = e.detail.goods
    let goodsInfoList = shopcartUtil.modifyGoodsList(this.data.goodsInfoList, goods)
    this.setData({
      goodsInfoList: goodsInfoList,
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
    })
  },
  carModifyEvent: function (e) {
    if (e.detail.type == 'clear') { //请购购车
      this.data.goodsInfoList.forEach((item) => {
        item.buyCount = 0
      })
      this.setData({
        goodsInfoList: this.data.goodsInfoList,
        cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
        shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
      })
    } else { //增加减少购物车内数量
      let goods = e.detail.goods
      let goodsInfoList = shopcartUtil.modifyGoodsList(this.data.goodsInfoList, goods)
      this.setData({
        goodsInfoList: goodsInfoList,
        cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
        shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
      })
    }
  },
  /**
   * 获取社区购接龙数据
   */
  getSupplierActivityOrders: function () {
    if (this.data.supplierActivityId == -1) {
      return
    }
    let that = this
    wx.request({
      url: findSupplierActivityOrders,
      data: {
        pn: that.data.pn,
        shopId: that.data.shopInfo.id,
        supplierActivityId: that.data.supplierActivityId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取接龙数据网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取接龙数据出错！',
            icon: 'none'
          });
          return;
        }

        //活动数据 
        if (res.data.data.total == that.data.activityOrdersList.length) {
          that.setData({
            hasMore: true
          })
          return
        }

        let pnNext = that.data.pn + 1
        that.setData({
          orderNumber: res.data.data.total,
          pn: pnNext,
          activityOrdersList: that.data.activityOrdersList.concat(res.data.data.rows)
        })
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
    if (this.data.activityInfo != null) {
      this.initShopCart(this.data.activityInfo.isAloneCart)
    }
    this.browseWxappPage()
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
    //this.getSupplierActivityOrders()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let activityInfo = this.data.activityInfo;
    let title = activityInfo.title
    let activityId = activityInfo.id
    let shopId = this.data.shopInfo.id

    let urlPath = '/pages/jielong/jielong?shopId=' + shopId +
      '&activityId=' + activityId
    if (app.globalData.userInfo) {
      urlPath += '&parentId=' + app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1
    }

    let imgUrl = '';
    // yb 判断是否分销人员
    if (this.data.isSharePeople == true) {
      imgUrl = 'https://source.ckldzsw.com/coupon/share/coupon.png'
    } else {
      imgUrl = activityInfo.imgUrl;
    }

    //yb 分销人员分享
    if (this.data.isSharePeople && this.data.couponInfo.id) {
      urlPath += '&isShowReceiveCoupon=1'
      imgUrl = imgUrl;
    }

    this.shareAppMessage();

    return {
      title: title,
      path: urlPath,
      imageUrl: imgUrl,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  share_handler: function () {
    this.setData({
      is_share_html: false
    })
  },

  hide_share_handler: function () {
    this.setData({
      is_share_html: true
    })
  },
  /**
   * 生成海报
   */
  toPoster: function () {
    let url = '../poster/poster?shopId=' + this.data.shopId + '&pageType=3' + '&supplierActivityId=' + this.data.supplierActivityId
    wx.navigateTo({
      url: url
    })
  },

  // yb 弹框领取优惠券
  receiveCouponFun() {
    var that = this
    that.receiveCoupon(that.data.couponInfo.id)
  },

  /**
   * yb 领取优惠券
   * @param {*} couponId 
   */
  receiveCoupon: function (couponId) {
    let _this = this;

    let _params = {
      pageKey: _this.pageKeyFunc(couponId), //pageKey,
      amount: 0,
      merchantId: 1,
      payType: 2,
      peopleId: app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1,
      orderItems: [{
        number: 1,
        couponId: couponId
      }]
    };
    wx.showLoading({
      title: '领取优惠券中...',
      mask: true
    })

    wx.request({
      url: submitConponUrl,
      method: 'post',
      data: _params,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取优惠券数据出错',
            icon: 'none'
          });
          return
        }
        wx.showToast({
          title: "领取优惠券成功",
          icon: 'none'
        });
      }
    })
  },

  //yb 初始方法 -- key生成
  pageKeyFunc: function (id) {
    if (app.globalData.userInfo == undefined) return
    let _date = new Date().getTime(),
      _peopleId = app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1,
      _id = id;
    let _str = _peopleId + '' + _date + '' + _id;
    if (_peopleId || _peopleId == 0) {
      return _str
    } else {
      console.log('用户不存在');
    }
  },

  //yb
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  //有数--页面分享(事件page_share_app_message)
  shareAppMessage() {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '接龙',
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
  }

})