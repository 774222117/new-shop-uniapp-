const app = getApp()
//获取二级页数据
const getSecondBannerInfoUrl = require('../../utils/config.js').httpConfig.getSecondBannerInfoNewUrl
const getSecondModuleGoodsListUrl = require('../../utils/config.js').httpConfig.getSecondModuleGoodsListUrl
const getNearbyShopOneUrl = require('../../utils/config.js').httpConfig.getNearbyShopOne;
//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
//获取坐标到门店的距离
const shopDistanceUrl = require('../../utils/config.js').httpConfig.getShopDistanceUrl;
//根据自提点Id获取自提点信息
const getCarrierByIdUrl = require('../../utils/config.js').httpConfig.getCarrierByIdUrl;
const getNearByCarrierOneUrl = require('../../utils/config.js').httpConfig.getNearByCarrierOneUrl;
const getShopNearByCarrierOneUrl = require('../../utils/config.js').httpConfig.getShopNearByCarrierOneUrl;
const posterUrl = require('../../utils/config.js').httpConfig.posterUrl;
const getGroupBuyActivityByShopFormIdUrl = require('../../utils/config.js').httpConfig.getGroupBuyActivityByShopFormIdUrl;
let shopcartUtil = require('../../utils/shopcart')
let request = require('../../utils/request.js')
const PosterParam = require('../../utils/config.js').httpConfig.PosterParam;
const GetSceneParam = require('../../utils/util.js').GetSceneParam;

import Poster from '../../component/poster/poster';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerId: -1,
    shopId: -1,
    shopInfo: null,
    peopleId: -1,
    secondPageinfo: null,
    curCategoryIndex: 0,
    goodsList: [],
    moduleId: "",
    current: 0, //当前页
    limit: 6, //1页数据量
    hasData: true,
    longitude: 0,
    latitude: 0,
    scrollIntoItem: 'scrollIntoViewId1',
    //购物车
    cartTypeName: '',
    shopCart: [],
    //领取开关
    isGetKey: true,
    //pageKey
    pageKey: '',
    is_share_html: true,
    navbarInitTop: 0, //导航栏初始化距顶部的距离
    isFixedTop: false, //是否固定顶部
    screenHeight: 750,
    //提货方式 1只能自提
    deliveryWay: 0,
    carrierId: 0,
    //自提点信息
    carrierInfo: null,
    //选择团长回传的团长信息
    paramsCarrierId: null,
    //是否已授权获取位置服务
    isCanGetLocation: false,
    countDownContent: '',
    //防止跳转到团长选择页面，返回的时候刷新数据期间，出现null值的倒计时
    stopCountDown: false,
    modalName: 'null',
    posterConfig: {},
    posterImg: '',
    currentTime: Date.parse(new Date()) //当前时间戳
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
    //获取滚动条可滚动高度
    wx.getSystemInfo({
      success: (res) => {
        let screenHeight = res.windowHeight; //获取屏幕高度
        that.setData({
          screenHeight: screenHeight
        })
        console.log(that.data.screenHeight)
      }
    });

    app.watch(this.watchBack)
    //获取二维码参数
    GetSceneParam(PosterParam, options, function (res) {
      options = res
      if (app.globalData.userInfo == null) {
        app.data.path = 'pages/groupbuy/groupbuy'
        app.data.query = options
        wx.navigateTo({
          url: '../login/login'
        })
        return
      }
      // if(app.globalData.shopInfo == null){
      //   wx.showModal({
      //     showCancel: false, //是否显示取消按钮
      //     content: '请先选择附近的门店',
      //     complete: function (resm) {
      //       wx.switchTab({
      //         url: '/pages/index/index',
      //       })
      //     }
      //   })
      //   return
      // }
      wx.hideTabBar()
      if (options.bannerId != undefined) {
        that.setData({
          bannerId: options.bannerId
        })
      }

      if (options.carrierId != undefined) {
        that.setData({
          carrierId: options.carrierId
        })
      }
      if (that.data.bannerId == -1) {
        wx.request({
          url: getGroupBuyActivityByShopFormIdUrl,
          data: {
            shopFormId: app.globalData.shopInfo.shopFormId
          },
          fail: function (err) {
            wx.hideLoading()
            wx.showToast({
              title: '获取团购信息出错',
              icon: 'none'
            });
          },
          success: function (res) {
            wx.hideLoading();
            if (!res.data.flag) {
              wx.showToast({
                title: res.data.message || '获取团购信息出错',
                icon: 'none'
              });
              return
            }
            that.setData({
              bannerId: res.data.data.id
            })
            //获取门店信息        
            wx.getLocation({
              success: function (res) {
                that.setData({
                  longitude: res.longitude,
                  latitude: res.latitude,
                  isCanGetLocation: true
                })
                that.getIntPageDate()
              }
            })
          }
        })
      } else {
        //获取门店信息        
        wx.getLocation({
          success: function (res) {
            that.setData({
              longitude: res.longitude,
              latitude: res.latitude,
              isCanGetLocation: true
            })
            that.getIntPageDate()
          }
        })
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
  getIntPageDate: function () {
    let that = this
    if (that.data.carrierId != 0) {
      that.getCarrierById()
    } else {
      if (app.globalData.shopInfo == null) {
        that.getNearByCarrierOne()
      } else {
        that.setData({
          shopId: app.globalData.shopInfo.id
        })
        that.getShopNearByCarrierOne()
      }
    }
  },
  /**
   * 根据自提点Id获取自提点团长信息
   */
  getCarrierById: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: getCarrierByIdUrl,
      data: {
        carrierId: that.data.carrierId,
        bannerId: that.data.bannerId,
        latitude: that.data.latitude,
        longitude: that.data.longitude
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

        if (res.data.code == 1) {
          wx.showModal({
            showCancel: false, //是否显示取消按钮
            content: '当前团长已停止服务，已帮您切换到最近的团长！',
            complete: function (resm) {
              that.setCarrierInfo(res.data.data)
            }
          })
        } else {
          that.setCarrierInfo(res.data.data)
        }
      }
    })
  },
  //获取最近的一个团长
  getNearByCarrierOne: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: getNearByCarrierOneUrl,
      data: {
        bannerId: that.data.bannerId,
        latitude: that.data.latitude,
        longitude: that.data.longitude
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
        that.setCarrierInfo(res.data.data)
      }
    })
  },
  //获取门店中最近的一个团长
  getShopNearByCarrierOne: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: getShopNearByCarrierOneUrl,
      data: {
        shopId: that.data.shopId,
        latitude: that.data.latitude,
        longitude: that.data.longitude,
        bannerId: that.data.bannerId
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
        if (res.data.code == 1) {
          wx.showModal({
            showCancel: false, //是否显示取消按钮
            content: '当前门店没有团长活动，已帮您切换到最近的团长！',
            complete: function (resm) {
              that.setCarrierInfo(res.data.data)
            }
          })
        } else {
          that.setCarrierInfo(res.data.data)
        }
      }
    })
  },
  setCarrierInfo: function (carrierInfo) {
    //1.data.shopInfo赋值
    this.setData({
      carrierId: carrierInfo.id,
      carrierInfo: carrierInfo,
      shopId: carrierInfo.shopId
    })
    this.getShopById(this.data.shopId)
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
        that.setShopInfo(res.data.data)
        // wx.getLocation({
        //   success: function (ress) {
        //     that.getDistance(shopId, ress.longitude, ress.latitude)
        //   }
        // })
      }
    })
  },
  //从后台获取最近门店信息
  getNearShopOne: function (longitude, latitude) {

    let that = this
    //获取缓存中的门店信息
    let cacheShopId = undefined
    if (app.globalData.shopInfo != null) {
      that.setShopInfo(app.globalData.shopInfo)
      that.setData({
        loading: false
      })
    }
    //0.都为空，获取附近的门店
    else {
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
            that.setShopInfo(res.data.data)
            that.setData({
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
      secondPageinfo: [],
      goodsList: [],
      current: 0,
      hasData: true,
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName),
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName)
    })
    app.setShopInfo(shopInfo)
    this.getSecondPageInfo()
  },
  getSecondPageInfo: function () {
    let that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getSecondBannerInfoUrl,
      data: {
        shopId: that.data.shopInfo.id,
        peopleId: app.globalData.userInfo.peopleId,
        bannerId: that.data.bannerId,
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
          that.setData({
            secondPageinfo: res.data.data,
            stopCountDown: false
          })
          wx.setNavigationBarTitle({
            title: res.data.data.bannerTitle
          })
          that.initShopCart(that.data.secondPageinfo.isAloneCart)
          that.caulTime()
        } else {
          if (res.data.data != undefined) {
            that.setData({
              secondPageinfo: res.data.data
            })
          }
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
        if (that.data.secondPageinfo.secondModuleDtoList.length > 0) {
          that.loadGoodsInfo(that.data.secondPageinfo.secondModuleDtoList[that.data.curCategoryIndex].id, that.data.current, that.data.limit)
        }
      }
    })
  },
  loadGoodsInfo: function (moId, current, limit) {
    let that = this;
    let goodsList = this.data.goodsList;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getSecondModuleGoodsListUrl,
      data: {
        shopId: that.data.shopInfo.id,
        peopleId: app.globalData.userInfo.peopleId,
        moduleId: moId,
        pn: current,
        ps: limit
      },
      fail: function (err) {

      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          if (res.data.data.rows.length > 0) {
            if (moId != that.data.moduleId) {
              goodsList = res.data.data.rows
            } else {
              goodsList = goodsList.concat(res.data.data.rows)
            }

            that.setData({
              goodsList: goodsList,
              moduleId: moId
            })
            console.log("loadGoodsInfo->success")
            console.log(that.data.goodsList)
            that.initShopCart(that.data.secondPageinfo.isAloneCart)
          } else {
            that.setData({
              hasData: false
            })
          }
        }
      }
    })
  },
  //计算坐标到门店之间的距离
  getDistance: function (shopId, longitude, latitude) {
    let that = this
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
          if (distance > 3000) {
            wx.showModal({
              title: '提示',
              content: '当前距离较远，是否切换门店',
              success(res) {
                if (res.confirm) {
                  that.myAddress.showShopListModal()
                }
              }
            })
          }
        }
      }
    })
  },
  /**
   * 促销分类点击选择
   */
  tabCategorySelect(e) {
    let curCategoryIndex = e.currentTarget.dataset.id
    this.setData({
      scrollIntoItem: "navbar"
    })
    this.loadcategoryGoods(curCategoryIndex)
  },
  //加载楼层商品
  loadcategoryGoods(curCategoryIndex) {
    this.setData({
      hasData: true,
      current: 0,
      curCategoryIndex: curCategoryIndex,
      scrollIntoItem: "scrollIntoViewId" + curCategoryIndex,
      goodsList: []
    })
    const moId = this.data.secondPageinfo.secondModuleDtoList[curCategoryIndex].id;
    this.loadGoodsInfo(moId, this.data.current, this.data.limit);
  },
  onLower: function () {
    let moId = this.data.moduleId
    let current = this.data.current
    console.log("onlower->hasData")
    console.log(this.data.hasData)
    if (this.data.hasData) {
      this.setData({
        current: current + 1
      })
    } else {
      if (this.data.secondPageinfo.secondModuleDtoList.length > (this.data.curCategoryIndex + 1)) {
        this.loadcategoryGoods(this.data.curCategoryIndex + 1)
        this.setData({
          scrollIntoItem: "navbar"
        })
      }
      return
    }
    this.loadGoodsInfo(moId, this.data.current, this.data.limit);
  },
  /**
   * 初始化购物车信息
   */
  initShopCart: function (isAloneCart) {
    let cartTypeName = shopcartUtil.cartType.OTO
    if (isAloneCart == 1) {
      cartTypeName = shopcartUtil.cartType.SecondPage + "-" + this.data.bannerId + "-" + this.data.carrierId
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
    let goodsInfoList = this.data.goodsList
    let centerGoods = this.data.secondPageinfo.secondModuleTopGoodsDtoList
    shopCart.forEach((item) => {
      goodsInfoList.forEach((goods) => {
        if (item.goodsId == goods.id) {
          goods.buyCount = item.total
        }
      })
      centerGoods.forEach((centerGoods) => {
        if (item.goodsId == centerGoods.id) {
          centerGoods.buyCount = item.total
        }
      })
    })
    if (shopCart.length <= 0) {
      this.data.goodsList.forEach((item) => {
        item.buyCount = 0
      })
      this.setData({
        goodsList: this.data.goodsList,
      })
    }

    let pageinfo = this.data.secondPageinfo
    pageinfo.secondModuleTopGoodsDtoList = centerGoods
    this.setData({
      goodsList: goodsInfoList,
      cartTypeName: cartTypeName,
      shopCart: shopCart,
      cartShopTotal: cartShopTotal,
      secondPageinfo: pageinfo
    })
  },
  //跳转到商品详情
  jumpToDetail: function (e) {
    //检查活动是否在设置的活动时间段
    if (!this.checkActivityTime()) {
      return
    }
    let goodsId = e.currentTarget.dataset.goodsinfo.id
    let bannerId = this.data.bannerId
    let carrierId = this.data.carrierId
    let url = '../goods/goods?cartTypeName=' + this.data.cartTypeName + '&goodsId=' + goodsId + "&groupBuyActivityId=" + bannerId + '&carrierId=' + carrierId
    // if (e.currentTarget.dataset.goodsinfo.marketType == 1) {
    //   url = '../advancegoods/advancegoods?goodsId=' + goodsId +"&groupBuyActivityId="+ bannerId + '&carrierId=' +carrierId
    // }
    wx.navigateTo({
      url: url,
    })
  },
  //检查活动是否在设置的活动时间段
  checkActivityTime: function () {
    let startTimeStr = this.data.secondPageinfo.startTime
    let endTimeStr = this.data.secondPageinfo.endTime
    let startTime = new Date(startTimeStr.replace(/-/g, '/'))
    let endTime = new Date(endTimeStr.replace(/-/g, '/'))
    let now = new Date()
    if (startTime > now) {
      wx.showToast({
        title: '活动尚未开始！',
        icon: 'none'
      })
      return false
    }
    if (endTime < now) {
      wx.showToast({
        title: '活动已经结束！',
        icon: 'none'
      })
      return false
    }
    return true
  },
  /**
   * 加入购物车
   */
  addCart: function (e) {
    //检查活动是否在设置的活动时间段
    if (!this.checkActivityTime()) {
      return
    }
    let goods = e.currentTarget.dataset.goodsinfo
    goods = shopcartUtil.addShopCart(goods, this.data.cartTypeName)
    let goodsList = shopcartUtil.modifyGoodsList(this.data.secondPageinfo.secondModuleTopGoodsDtoList, goods);
    let pageinfo = this.data.secondPageinfo
    pageinfo.secondModuleTopGoodsDtoList = goodsList
    this.setData({
      secondPageinfo: pageinfo,
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
    })
    this.refreshModuleGoodsNum(goods)
  },

  /**
   * 减少购物车
   */
  delCart: function (e) {
    //检查活动是否在设置的活动时间段
    if (!this.checkActivityTime()) {
      return
    }
    let goods = e.currentTarget.dataset.goodsinfo
    goods = shopcartUtil.delShopCart(goods, this.data.cartTypeName)
    let goodsList = shopcartUtil.modifyGoodsList(this.data.secondPageinfo.secondModuleTopGoodsDtoList, goods);
    let pageinfo = this.data.secondPageinfo
    pageinfo.secondModuleTopGoodsDtoList = goodsList
    this.setData({
      secondPageinfo: pageinfo,
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
    })
    this.refreshModuleGoodsNum(goods)
  },
  carModifyEvent: function (e) {
    if (e.detail.type == 'clear') { //请购购车
      this.data.secondPageinfo.secondModuleTopGoodsDtoList.forEach((item) => {
        item.buyCount = 0
      })
      this.data.goodsList.forEach((item) => {
        item.buyCount = 0
      })
      this.setData({
        goodsList: this.data.goodsList,
        curCategoryIndex: 0,
        current: 1,
        secondPageinfo: this.data.secondPageinfo,
        cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName)
      })
    } else { //增加减少购物车内数量
      //检查活动是否在设置的活动时间段
      if (!this.checkActivityTime()) {
        return
      }
      let goods = e.detail.goods
      let goodsInfoList = this.data.secondPageinfo.secondModuleTopGoodsDtoList
      goodsInfoList.forEach((item) => {
        if (item.id == goods.id) {
          item.buyCount = goods.buyCount
        }
      })
      let pageinfo = this.data.secondPageinfo
      pageinfo.secondModuleTopGoodsDtoList = goodsInfoList
      this.setData({
        secondPageinfo: pageinfo,
        cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName)
      })
      this.refreshModuleGoodsNum(goods)
    }
  },
  //刷新楼层商品购买数量
  refreshModuleGoodsNum(goods) {
    shopcartUtil.modifyGoodsList(this.data.goodsList, goods)
    this.setData({
      goodsList: this.data.goodsList
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
    // let index = e.currentTarget.dataset.index
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
                // let couponReceived = 'couponList['+index+'].received'
                // _this.setData({
                //   [couponReceived]: 1
                // })
              }
            } else {
              //领取失败
              let _msg = _data.message;
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
  showAllGoods: function (e) {
    let index = e.currentTarget.dataset.idx
    let modularShowMore = 'secondPageinfo.secondModuleDtoList[' + index + '].showMore'
    this.setData({
      [modularShowMore]: !this.data.secondPageinfo.secondModuleDtoList[index].showMore
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.myAddress = this.selectComponent('#myAddress')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.secondPageinfo != null) {
      this.initShopCart(this.data.secondPageinfo.isAloneCart)
    }
    if (this.data.paramsCarrierId != null && this.data.carrierId != this.data.paramsCarrierId) {
      let carrierId = this.data.paramsCarrierId
      this.setData({
        carrierId: carrierId,
        paramsCarrierId: null,
        stopCountDown: true
      })
      if (this.data.secondPageinfo != null) {
        this.data.secondPageinfo.secondModuleTopGoodsDtoList.forEach((item) => {
          item.buyCount = 0
        })
      }

      this.getCarrierById()
    }
  },
  /**
   * 监听页面滑动事件
   */
  onViewScroll1: function (e) {
    var that = this;
    //获取节点距离顶部的距离
    wx.createSelectorQuery().select('#navbar').boundingClientRect(function (rect) {
      console.log(rect)
      if (that.data.navbarInitTop == 0) {
        that.setData({
          navbarInitTop: rect.top
        })
      }
      if (rect.top <= 0) {
        that.setData({
          isFixedTop: true
        });
      } else {
        that.setData({
          isFixedTop: false
        });
      }
    }).exec();
    return
    var that = this;
    var scrollTop = parseInt(e.detail.scrollTop); //滚动条距离顶部高度
    console.log("scrollTop:" + scrollTop)
    //判断'滚动条'滚动的距离 和 '元素在初始时'距顶部的距离进行判断
    var isSatisfy = scrollTop >= that.data.navbarInitTop ? true : false;
    //为了防止不停的setData, 这儿做了一个等式判断。 只有处于吸顶的临界值才会不相等
    if (that.data.isFixedTop === isSatisfy) {
      return false;
    }
    that.setData({
      isFixedTop: isSatisfy
    });
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
    this.hide_share_handler()
    let secondPageinfo = this.data.secondPageinfo;
    let title = secondPageinfo.bannerTitle
    let bannerId = secondPageinfo.id
    let shopId = app.globalData.shopInfo.id
    this.shareAppMessage()
    let urlPath = '/pages/groupbuy/groupbuy?shopId=' + shopId +
      '&bannerId=' + bannerId + '&carrierId=' + this.data.carrierId
    return {
      title: title,
      path: urlPath,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },
  //有数--页面分享(事件page_share_app_message)
  shareAppMessage() {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '团购二级页',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
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
  tochooseCommander: function () {
    let that = this
    wx.getLocation({
      success: function (res) {
        that.setData({
          latitude: res.latitude,
          longitude: res.longitude
        })
      },
      complete: function () {
        wx.navigateTo({
          url: '../choosehead/choosehead?carrierId=' + that.data.carrierId + '&bannerId=' + that.data.bannerId + '&latitude=' + that.data.latitude + '&longitude=' + that.data.longitude,
        })
      }
    })
  },
  openLocation: function () {
    var that = this
    wx.openSetting({
      success(res) {
        console.log(res.authSetting)
        that.setData({
          isCanGetLocation: res.authSetting['scope.userLocation']
        })
        if (that.data.isCanGetLocation) {
          that.getIntPageDate()
        }
      }
    })
  },
  //计算倒计时
  caulTime: function () {
    let that = this
    if (!that.data.stopCountDown) {
      let startTimeStr = this.data.secondPageinfo.startTime
      let endTimeStr = this.data.secondPageinfo.endTime
      let startTime = new Date(startTimeStr.replace(/-/g, '/'))
      let endTime = new Date(endTimeStr.replace(/-/g, '/'))
      let now = new Date()
      let countDownContent = ''

      //活动已经结束！
      if (endTime < now) {
        //clearInterval(timer)
        countDownContent = "活动已结束"
        that.setData({
          countDownContent: countDownContent
        })
        return
      }
      //活动尚未开始！
      if (startTime > now) {
        countDownContent = that.timedifference(now, startTime)
        countDownContent = "距离开始：" + countDownContent
      } else {
        countDownContent = that.timedifference(now, endTime)
        countDownContent = "距离结束：" + countDownContent
      }
      that.setData({
        countDownContent: countDownContent,
        currentTime: Date.parse(new Date())
      })
    }
    setTimeout(function () {
      that.caulTime();
    }, 1000)
  },
  ////计算两个时间之间的时间差
  timedifference: function (faultDate, completeTime) {
    var stime = Date.parse(faultDate); //获得开始时间的毫秒数
    var etime = Date.parse(completeTime); //获得结束时间的毫秒数
    var usedTime = etime - stime; //两个时间戳相差的毫秒数
    var days = Math.floor(usedTime / (24 * 3600 * 1000));
    //计算出小时数
    var leave1 = usedTime % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
    var hours = Math.floor(leave1 / (3600 * 1000)); //将剩余的毫秒数转化成小时数
    //计算相差分钟数
    var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
    var minutes = Math.floor(leave2 / (60 * 1000)); //将剩余的毫秒数转化成分钟
    //计算相差秒数
    var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
    var seconds = Math.floor(leave3 / 1000); //将剩余的毫秒数转化成秒数

    var dayStr = days == 0 ? "" : days + "天";
    var hoursStr = hours == 0 ? "" : hours + "小时";
    var minutesStr = minutes == 0 ? "" : minutes + "分"
    var time = dayStr + hoursStr + minutesStr + seconds + "秒";
    return time;
  },
  //获取数据
  getPosterData: function () {
    wx.showLoading({
      title: '分享码绘制中...',
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
        posterType: 5,
        minPath: "pages/groupbuy/groupbuy",
        bannerId: that.data.bannerId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取分享码数据网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        if (!res.data.flag) {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message || '获取分享码数据出错！',
            icon: 'none'
          });
          return
        }
        that.hide_share_handler()
        wx.hideLoading();
        // let posterConfig = JSON.parse('{"width":636,"height":698,"debug":true,"pixelRatio":1,"texts":[{"x":142,"y":94,"fontSize":32,"baseLine":"top","text":"微信用户给您分享了一个团","lineHeight":44,"fontWeight":"bold","lineNum":1,"color":"#323232"},{"x":142,"y":138,"baseLine":"top","text":"奥体庐山路购物广场店","fontSize":24,"color":"#323232"},{"x":118,"y":704,"baseLine":"top","text":"苏果优选小区GO“生鲜团”","fontSize":34,"color":"#fff"},{"x":184,"y":776,"baseLine":"top","text":"团购价格 外卖速度","fontSize":32,"color":"#EC4E41"},{"x":198,"y":863,"baseLine":"top","text":"开团时间","fontSize":22,"color":"#323232"},{"x":198,"y":895,"baseLine":"top","width":192,"lineHeight":30,"lineNum":2,"text":"2022 03.01 - 07.08","fontSize":24,"color":"#323232","fontFamily": "PingFang SC, PingFang SC-Medium"},{"x":408,"y":863,"baseLine":"top","text":"提货时间","fontSize":22,"color":"#323232"},{"x":408,"y":895,"width":192,"lineHeight":30,"lineNum":2,"baseLine":"top","text":"3月1日-3月6日门店自提","fontSize":24,"color":"#323232"}],"images":[{"width":636,"height":1004,"x":0,"y":0,"url":"https://sourced.sgsugou.com/poster/groupbybg.png"},{"width":88,"height":88,"x":34,"y":80,"url":"https://thirdwx.qlogo.cn/mmopen/vi_32/DYAIOgq83eq6eG5vCwklibO5hgf3PsjYd0AbJiboIZJhiaoNibHZNtuR7eHbkZlTmh4IWTcEGF1j0E1uJu1TzEQthw/132"},{"width":110,"height":110,"x":66,"y":848,"url":"https://sourced.sgsugou.com/qrcode/GroupBuy/197621.png"}]}')
        that.setData({
          posterConfig: JSON.parse(res.data.data.configure),
          // posterConfig: posterConfig,

        }, () => {
          Poster.create(true);
        })
        that.setData({
          // shareImg: res.data.data.posterImage,
          modalName: 'wechatcodeModal'
        })
      }
    })
  },
  /**
   * 保存手机相册
   */
  // saveToPhotos: function () {
  //   wx.getImageInfo({
  //     src: this.data.shareImg,
  //     success: function (ret) {
  //       let path = ret.path
  //       wx.saveImageToPhotosAlbum({
  //         filePath: path,
  //         success(res) {
  //           wx.showToast({
  //             title: '保存成功',
  //             icon: 'none'
  //           })
  //         },
  //         fail(res) {
  //           console.info(res)
  //         }
  //       })
  //     }
  //   })
  // },
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
  hideModal: function () {
    this.setData({
      modalName: null
    })
  }
})