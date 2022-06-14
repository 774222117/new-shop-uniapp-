/**
 * 商品详情页
 * 增加支持总部促销，根据pid和门店编码查询商品
 */
const app = getApp()
//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
const PosterParam = require('../../utils/config.js').httpConfig.PosterParam;
const GetSceneParam = require('../../utils/util.js').GetSceneParam;
//商品详细信息
const normalgoodsInfoUrl = require('../../utils/config.js').httpConfig.normalgoodsInfoUrl;
//html解析模块
let htmlParse = require('../../component/wxParse/wxParse.js');
//购物车工具
let shopcartUtil = require('../../utils/shopcart')
let request = require('../../utils/request.js');
//获取可领取优惠券列表
const getGoodsCanReceivedCouponByIdUrl = require('../../utils/config.js').httpConfig.getGoodsCanReceivedCouponByIdUrl;
import Poster from '../../component/poster/poster';
const posterUrl = require('../../utils/config.js').httpConfig.posterUrl;

const getNearbyShopOneUrl = require('../../utils/config.js').httpConfig.getNearbyShopOne;
//获取坐标到门店的距离
const shopDistanceUrl = require('../../utils/config.js').httpConfig.getShopDistanceUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //推广人id
    parentId: -1,
    //门店id
    shopId: -1,
    //商品id
    goodsId: -1,
    //父级商品Id
    parentGoodsId: -1,
    //商品数据
    goodsInfo: {},
    //购物车
    shopCart: [],
    //本次购买数
    buyCount: 0,
    //总金额
    sumPrice: 0,
    //门店名称
    shopName: '',
    //配送方式：0 全部 1 门店自提 2 配送到家 wyx 2020-03-16 append it
    deliveryWay: 0,
    //是否直送
    isDelivery: 0,
    //社区购活动Id
    supplierActivityId: 0,
    //汇总数据
    cartTotal: {},
    cartTypeName: shopcartUtil.cartType.OTO,
    cartShopTotal: {},
    goodsInfoList: [],
    roomId: 0,
    //从哪个页面跳转来的
    fromPage: null,
    isShowShare: 0,
    //店长推荐活动id
    saleActivityId: 0,
    //领取开关
    isGetKey: true,
    //pageKey
    pageKey: '',
    //可领取优惠券
    couponList: [],
    //团长活动id
    groupBuyActivityId: 0,
    //团长提货点id
    carrierId: 0,
    modalName: 'null',
    posterConfig: {},
    posterImg: '',
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
      if (options.isShowShare) {
        that.setData({
          isShowShare: options.isShowShare
        })
      }
      //直播间Id
      if (options.roomId) {
        that.setData({
          roomId: options.roomId
        })
        app.setRoomId(options.roomId)
      }
      //判断登录
      // if (app.globalData.userInfo == null) {
      //   //app.data.path = '/category/categroy'
      //   wx.redirectTo({
      //     url: '../login/login'
      //   })
      //   return
      // }
      //是否有商品Id
      if (options.goodsId) {
        that.setData({
          goodsId: options.goodsId
        })
      }
      if (options.fromPage) {
        that.setData({
          fromPage: options.fromPage
        })
      }
      if (that.data.fromPage == 'shoppay') {
        wx.hideShareMenu()
      }
      //判断是否pid
      if (options.pid) {
        that.setData({
          parentGoodsId: options.pid
        })
      }
      let goodId = that.data.goodsId

      if (options.supplierActivityId) {
        that.setData({
          supplierActivityId: options.supplierActivityId
        })
      }
      if (options.groupBuyActivityId) {
        that.setData({
          groupBuyActivityId: options.groupBuyActivityId
        })
      }
      if (options.carrierId) {
        that.setData({
          carrierId: options.carrierId
        })
      }
      let shopId = options.shopId
      if (shopId) {
        that.setData({
          shopId: shopId
        })
        if (app.globalData.shopInfo == null || shopId != app.globalData.shopInfo.id) {
          that.getShopById(shopId)
        } else {
          that.setData({
            shopId: app.globalData.shopInfo.id,
            shopName: app.globalData.shopInfo.name
          })
        }
      } else {
        //缓存中不存在获取店铺信息
        if (app.globalData.shopInfo == null) {
          //获取附近的门店信息
          wx.getLocation({
            success: function (res) {
              that.getNearShopOne(res.longitude, res.latitude)
            },
          })
        } else {
          that.setData({
            shopId: app.globalData.shopInfo.id,
            shopName: app.globalData.shopInfo.name
          })
        }
      }
      if (options.cartTypeName != undefined) {
        that.setData({
          cartTypeName: options.cartTypeName
        })
      }
      if (options.saleActivityId) {
        that.setData({
          saleActivityId: options.saleActivityId
        })
      }
      //获取商品数据
      that.getGoodsInfo(goodId, that.data.shopId)
      wx.getLocation({
        success: function (res) {
          that.getDistance(app.globalData.shopInfo.id, res.longitude, res.latitude)
        }
      })
    });
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
    //支付成功，刷新页面
    if (this.data.cartTypeName != '') {
      this.initShopCart(this.data.cartTypeName)
    }

    // if(this.data.goodsId!=-1){
    //   //获取商品数据
    //   this.getGoodsInfo(this.data.goodsId,this.data.shopId)
    // }


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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let goodsInfo = this.data.goodsInfo;
    let title = goodsInfo.title + '(规格:' + goodsInfo.spec + ')★售价:' + goodsInfo.marketPrice
    let shopId = this.data.shopId
    let goodsId = goodsInfo.id
    let parentId = app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1
    let urlPath = '/pages/goods/goods?shopId=' + shopId +
      '&goodsId=' + goodsId + '&parentId=' + parentId
    if (this.data.supplierActivityId > 0) {
      urlPath += '&supplierActivityId=' + this.data.supplierActivityId
    }
    //如果是团长团购页进入到的商品详情，分享直接跳转到团长页面
    if (this.data.groupBuyActivityId > 0) {
      urlPath = '/pages/groupbuy/groupbuy?shopId=' + shopId +
        '&bannerId=' + this.data.groupBuyActivityId
      if (this.data.carrierId > 0) {
        urlPath += '&carrierId=' + this.data.carrierId
      }
    }

    this.shareAppMessage();

    return {
      title: title,
      path: urlPath,
      imageUrl: goodsInfo.thumb,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }

  },

  /******************************************** 自定义方法 ***************************************************** */
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
        if (app.globalData.shopInfo != null && app.globalData.shopInfo.id != shopId) {
          shopcartUtil.clearShopCartList()
        }
        app.setShopInfo(res.data.data)
        that.setData({
          shopId: app.globalData.shopInfo.id,
          shopName: app.globalData.shopInfo.name
        })

        //查询商品
        if (goodsId) {
          //清除提货点
          wx.removeStorageSync('carrierInfo')
          //如果是预售，不用重查商品，总部促销需要重新查询
          if (that.data.goodsInfo && that.data.goodsInfo.marketType == 2) {
            that.getGoodsInfo(goodsId, app.globalData.shopInfo.id)
          } else {
            that.setData({
              modalName: 'immediatePurchase'
            })
          }
        }
      }
    })
  },

  /**
   * 初始化购物车信息
   * @param {商品平台} goodsPlatform 0 社区购 1 社群购
   */
  initShopCart: function (goodsPlatform) {

    let cartTypeName = this.data.cartTypeName
    if (goodsPlatform == 1) {
      cartTypeName = shopcartUtil.cartType.GroupBuy + "-" + this.data.supplierActivityId
    }
    //初始化活动社区购分享进入的购车
    shopcartUtil.initCartInfo(cartTypeName)

    let shopCart = shopcartUtil.getShopCart(cartTypeName)
    let cartShopTotal = shopcartUtil.getShopCartTotal(cartTypeName)
    if (cartShopTotal.sumPrice == undefined) {
      cartShopTotal.sumPrice = 0
      cartShopTotal.sumProductPrice = 0
      cartShopTotal.buyCount = 0
    }
    if (shopCart.length <= 0) {
      this.data.goodsInfo.buyCount = 0
    }
    this.setData({
      cartTypeName: cartTypeName,
      shopCart: shopCart,
      cartShopTotal: cartShopTotal,
      goodsInfo: this.data.goodsInfo
    })
  },

  getGoodsInfo: function (goodsId, shopId) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    if (!shopId) {
      shopId = -1
    }
    let that = this
    wx.request({
      url: normalgoodsInfoUrl,
      data: {
        goodsId: goodsId,
        peopleId: app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1,
        shopId: shopId,
        pid: this.data.parentGoodsId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取商品数据出错',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取门商品据出错',
            icon: 'none'
          });
          return
        }
        let goodsInfo = res.data.data
        //初始化购物车
        that.initShopCart(goodsInfo.goodsPlatform)
        //写入已购数据
        that.data.shopCart.forEach((item) => {
          if (item.goodsId == goodsInfo.id) {
            goodsInfo.buyCount = item.total
          }
        })
        let goodsInfoList = [goodsInfo];
        //社区购

        that.setData({
          goodsInfo: goodsInfo,
          goodsId: res.data.data.id,
          goodsInfoList: goodsInfoList
        })

        // //如果是团长活动 只能自提
        // if(that.data.groupBuyActivityId>0){
        //   that.setData({deliveryWay : 1})
        // }else{

        // }
        //记录配送方式 wyx 2020-03-16 append it
        if (res.data.data.deliveryWay != null && res.data.data.deliveryWay != undefined) {
          //如果是预售，读取配送标记
          if (res.data.data.marketType == 1 || res.data.data.isPlatform == 1) {
            that.setData({
              deliveryWay: res.data.data.deliveryWay
            })
          }
        }

        if (res.data.data.isDelivery != null && res.data.data.isDelivery != undefined) {
          that.setData({
            isDelivery: res.data.data.isDelivery
          })
        }
        // 模板渲染
        let ruleInfo = that.data.goodsInfo.content;
        if (ruleInfo) {
          htmlParse.wxParse('commodityDetails', 'html', ruleInfo, that, 5);
        }

        that.browseGoodsDetail(that.data.goodsInfo);
      }
    })
  },
  getGoodsCanReceivedCouponById: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: getGoodsCanReceivedCouponByIdUrl,
      data: {
        goodsId: that.data.goodsId,
        peopleId: app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1,
        shopId: that.data.shopId,
        pid: that.data.parentGoodsId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取优惠券信息出错',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取优惠券信息出错',
            icon: 'none'
          });
          return
        }
        let couponList = res.data.data
        that.setData({
          couponList: couponList
        })
      }
    })
  },
  /**
   * 修改购买数量
   */
  changeNumber: function (e) {
    let goods = this.data.goodsInfo
    let ipval = e.detail.value
    ipval = ipval == "" ? 0 : ipval
    goods = shopcartUtil.setShopCartNum(goods, ipval, this.data.cartTypeName)
    // 在商品详情中重新设置下数据
    this.setData({
      goodsInfo: goods,
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
    })
  },
  /**
   * 加入购物车
   *   getShopGoodsInfo方法获得到的categoryGoodsList列表将商品信息（goodsInfo）绑定到控件上
   */
  addCart: function (e) {
    let goods = this.data.goodsInfo
    goods = shopcartUtil.addShopCart(goods, this.data.cartTypeName)
    // 在商品详情中重新设置下数据
    this.setData({
      goodsInfo: goods,
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
    })
  },

  /**
   * 减少购物车
   *   getShopGoodsInfo方法获得到的categoryGoodsList列表将商品信息（goodsInfo）绑定到控件上
   */
  delCart: function (e) {
    let goods = this.data.goodsInfo
    goods = shopcartUtil.delShopCart(goods, this.data.cartTypeName)
    // 在商品详情中重新设置下数据
    this.setData({
      goodsInfo: goods,
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
    })
  },

  carModifyEvent: function (e) {
    if (e.detail.type == 'clear') { //请购购车
      this.data.goodsInfoList.forEach((item) => {
        item.buyCount = 0
      })
      this.data.goodsInfo.buyCount = 0
      this.setData({
        goodsInfo: this.data.goodsInfo,
        goodsInfoList: this.data.goodsInfoList,
        cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName)
      })
    } else {
      let goods = e.detail.goods
      console.log('goodsin', goods);
      let goodsInfoList = shopcartUtil.modifyGoodsList(this.data.goodsInfoList, goods)
      this.setData({
        goodsInfo: goods,
        goodsInfoList: goodsInfoList,
        cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName)
      })
    }
  },
  //获取数据
  getPosterData: function () {
    wx.showLoading({
      title: '海报绘制中...',
      mask: true
    })
    let that = this
    wx.request({
      url: posterUrl,
      method: 'post',
      data: {
        shopId: that.data.shopId,
        carrierId: that.data.carrierId,
        peopleId: app.globalData.userInfo.peopleId,
        posterType: 6,
        id: that.data.goodsId,
        minPath: "pages/groupbuy/groupbuy",
        bannerId: that.data.groupBuyActivityId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取海报数据网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        if (!res.data.flag) {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message || '获取海报数据出错！',
            icon: 'none'
          });
          return
        }
        //写入缓存
        let posterConfig = JSON.parse(res.data.data.configure)
        wx.hideLoading();
        that.setData({
          posterConfig: posterConfig
        }, () => {
          Poster.create(true);
        })
        that.setData({
          modalName: 'wechatcodeModal'
        })
      }
    })
  },
  /**
   * 生成海报
   */
  toPoster: function () {
    let url = ""
    if (this.data.groupBuyActivityId != 0) {
      // this.getPosterData()
      url = '../poster/poster?shopId=' + app.globalData.shopInfo.id + '&goodsId=' + this.data.goodsInfo.id + '&pageType=6' + '&carrierId=' + this.data.carrierId + '&bannerId=' + this.data.groupBuyActivityId
    } else {
      url = '../poster/poster?shopId=' + app.globalData.shopInfo.id + '&goodsId=' + this.data.goodsInfo.id + '&pageType=2'
    }

    if (this.data.supplierActivityId > 0) {
      url += '&supplierActivityId=' + this.data.supplierActivityId
    }
    wx.navigateTo({
      url: url
    })
  },
  showlingquan: function () {
    if (app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    this.getGoodsCanReceivedCouponById()
    this.setData({
      modalName: 'couponModal'
    })
  },
  hideModal: function () {
    this.setData({
      modalName: null
    })
  },
  //领取优惠券
  getCoupon: function (e) {
    if (app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    let _this = this;
    let _id = e.currentTarget.dataset.id; //券id
    let index = e.currentTarget.dataset.index
    let _user = app.globalData.userInfo;
    //开关
    if (!this.data.isGetKey) {
      return;
    } else {
      _this.setData({
        isGetKey: false
      });
    }
    //params
    let _params = {
      pageKey: _this.data.pageKey,
      amount: '0',
      merchantId: '',
      payType: 2,
      peopleId: _user.peopleId,
      orderItems: [{
        number: 1,
        couponId: _id
      }]
    };
    if (_id || _id == 0 && _user) {
      //show loading
      wx.showLoading({
        title: '领取优惠券中...',
        mask: true
      })
      request({
        url: 'submitConponUrl',
        method: 'post',
        data: _params,
        success: function (data) {
          //hidde loading
          wx.hideLoading();
          console.log(data);
          if (data.statusCode == 200 && data.data) {
            let _data = data.data;
            if (_data.flag) {
              let _code = _data.code;
              if (_code == 2) {
                //支付
              } else {
                wx.showToast({
                  title: '领券成功！',
                  icon: 'none'
                })
                let couponReceived = 'couponList[' + index + '].received'
                _this.setData({
                  [couponReceived]: 1
                })
              }
            } else {
              //领取失败
              let _msg = _data.message;
              //消息提示
              // wx.showToast({
              //   title: _msg,
              //   mask: true,
              //   icon: 'none'
              // })
              wx.showModal({
                content: _msg || "领取失败，点击确定查看其它优惠券！",
                confirmText: '确定',
                cancelText: '取消',
                success: function (res) {

                }
              })
            }
          }
        },

        error: function (error) {
          //hidde loading
          wx.hideLoading();
          console.log(error);
          //消息提示
          wx.showToast({
            title: error.errMsg || '领取失败',
            mask: true,
            icon: 'none'
          })
        },

        final: function () {
          //可以继续点击
          _this.setData({
            isGetKey: true
          });
          //pageKey
          _this.pageKeyFunc();
        }
      });
    }
  },
  //初始方法 -- key生成
  pageKeyFunc: function () {
    if (app.globalData.userInfo == undefined) return
    let _date = new Date().getTime(),
      _peopleId = app.globalData.userInfo.peopleId,
      _id = this.data.couponId;
    let _str = _peopleId + '' + _date + '' + _id;
    if (_peopleId || _peopleId == 0) {
      this.setData({
        pageKey: _str
      });
    } else {
      console.log('用户不存在');
    }
  },

  //有数--商品页浏览(事件browse_sku_page)
  browseGoodsDetail(goodsInfo) {
    app.TXYouShu.track('browse_sku_page', {
      "sku": {
        "sku_id": goodsInfo.goodssn,
        "sku_name": goodsInfo.title
      },
      "spu": {
        "spu_id": goodsInfo.goodssn,
        "spu_name": goodsInfo.title
      },
      "shipping_shop": {
        "shipping_shop_id": app.globalData.shopInfo.code,
        "shipping_shop_name": app.globalData.shopInfo.name
      },
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面分享(事件page_share_app_message)
  shareAppMessage() {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '商品详情',
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
  saveToPhotos: function () {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.posterImg,
      success: function (data) {
        wx.hideLoading()
        wx.showModal({
          title: '保存成功',
          icon: 'none'
        })
        that.showDialog4()
      },
      fail: function (err) {
        if (err.errMsg === "saveImageToPhotosAlbum:fail:auth denied" || err.errMsg === "saveImageToPhotosAlbum:fail auth deny" || err.errMsg === "saveImageToPhotosAlbum:fail authorize no response") {
          // 这边微信做过调整，必须要在按钮中触发，因此需要在弹框回调中进行调用
          wx.showModal({
            title: '提示',
            content: '需要您授权保存相册',
            showCancel: false,
            success: modalSuccess => {
              wx.openSetting({
                success(settingdata) {
                  console.log("settingdata", settingdata)
                  if (settingdata.authSetting['scope.writePhotosAlbum']) {
                    wx.showModal({
                      title: '提示',
                      content: '获取权限成功,再次点击图片即可保存',
                      showCancel: false,
                    })
                  } else {
                    wx.showModal({
                      title: '提示',
                      content: '获取权限失败，将无法保存到相册哦~',
                      showCancel: false,
                    })
                  }
                },
                fail(failData) {
                  console.log("failData", failData)
                },
                complete(finishData) {
                  console.log("finishData", finishData)
                }
              })
            }
          })
        }
      },
      complete(res) {
        wx.hideLoading()
      }
    })
  },
  onPosterSuccess(e) {
    const {
      detail
    } = e;
    console.info(detail)
    this.setData({
      posterImg: detail
    })
  },
  onPosterFail(err) {
    console.info(err);
  },

  //从后台获取最近门店信息
  getNearShopOne: function (longitude, latitude) {
    let that = this
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
        secondBannerId: that.data.bannerId
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            shopInfo: res.data.data,
            loading: false
          })
        } else {
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
  },
  getDistance: function (shopId, longitude, latitude) {
    wx.request({
      url: shopDistanceUrl,
      data: {
        shopId: shopId,
        longitude: longitude,
        latitude: latitude
      },
      fail: function (err) {

      },
      success: function (res) {
        if (res.data.flag) {
          let distance = res.data.data
          console.log("距离：" + distance)
          if(distance >= 3000) {
            wx.showModal({
              title: '提示',
              content: '您所在的定位离门店较远，请确认无误后下单',
              success(res) {
                if (res.confirm) {
                }
              }
            })
          }
        }
      }
    })
  },
})
