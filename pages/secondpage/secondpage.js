const app = getApp()
//获取二级页数据
const getSecondBannerInfoUrl = require('../../utils/config.js').httpConfig.getSecondBannerInfoNewUrl
const getSecondModuleGoodsListUrl = require('../../utils/config.js').httpConfig.getSecondModuleGoodsListUrl
const getNearbyShopOneUrl = require('../../utils/config.js').httpConfig.getNearbyShopOne;
const getSecondModuleCouponListUrl = require('../../utils/config.js').httpConfig.getSecondModuleCouponListUrl;


//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
//获取坐标到门店的距离
const shopDistanceUrl = require('../../utils/config.js').httpConfig.getShopDistanceUrl;
let shopcartUtil = require('../../utils/shopcart')
let request = require('../../utils/request.js')
const PosterParam = require('../../utils/config.js').httpConfig.PosterParam;
const GetSceneParam = require('../../utils/util.js').GetSceneParam;
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
    hasData: false,
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
    deliveryWay: 1,
    couponList: [], //优惠券列表
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
      // if (app.globalData.userInfo == null) {
      //   //app.data.path = '/category/categroy'
      //   wx.navigateTo({
      //     url: '../login/login'
      //   })
      //   return
      // }
      wx.hideTabBar()
      that.setData({
        bannerId: options.bannerId
      })
      if (options.shopId != undefined) {
        that.getShopById(options.shopId)
      } else {
        if (app.globalData.shopInfo == null) {
          //获取门店信息        
          wx.getLocation({
            success: function (res) {
              that.getNearShopOne(res.longitude, res.latitude)
            },
          })
        } else {
          that.setShopInfo(app.globalData.shopInfo)
        }

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
        that.setShopInfo(res.data.data)
        wx.getLocation({
          success: function (ress) {
            that.getDistance(shopId, ress.longitude, ress.latitude)
          }
        })
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
      curCategoryIndex: 0,
      current: 0,
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
        peopleId: app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1,
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
          })
          wx.setNavigationBarTitle({
            title: res.data.data.bannerTitle
          })
          that.initShopCart(that.data.secondPageinfo.isAloneCart)
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
          that.getSecondModuleCouponList(that.data.secondPageinfo.secondModuleDtoList[that.data.curCategoryIndex].id)
        }
      }
    })
  },
  getSecondModuleCouponList(moduleId) {
    let that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: getSecondModuleCouponListUrl,
      data: {
        shopId: that.data.shopInfo.id,
        peopleId: app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1,
        moduleId: moduleId,
      },
      fail: function (err) {

      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            couponList: res.data.data,
          })
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
        peopleId: app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1,
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
            if (res.data.data.total <= that.data.goodsList.length) {
              that.setData({
                hasData: false
              })
            } else {
              that.setData({
                hasData: true
              })
            }
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
    this.getSecondModuleCouponList(this.data.secondPageinfo.secondModuleDtoList[curCategoryIndex].id)
  },
  //加载楼层商品
  loadcategoryGoods(curCategoryIndex) {
    this.setData({
      hasData: true,
      current: 0,
      curCategoryIndex: curCategoryIndex,
      goodsList: []
    })
    const moId = this.data.secondPageinfo.secondModuleDtoList[curCategoryIndex].id;
    this.loadGoodsInfo(moId, this.data.current, this.data.limit);
  },
  onLower: function () {
    if (this.data.goodsList.length == 0) {
      return
    }
    let moId = this.data.moduleId
    let current = this.data.current
    if (this.data.hasData) {
      this.setData({
        current: current + 1
      })
    } else {
      if (this.data.secondPageinfo.secondModuleDtoList.length > (this.data.curCategoryIndex + 1)) {
        this.setData({
          sc2rollIntoItem: "sc2rollIntoViewId" + (this.data.curCategoryIndex + 1),
          scrollIntoItem: "navbar"
        })
        this.loadcategoryGoods(this.data.curCategoryIndex + 1)
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
      cartTypeName = shopcartUtil.cartType.SecondPage + "-" + this.data.bannerId
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
    let centerGoods = this.data.secondPageinfo.secondModuleGoodsDtoList
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

    let pageinfo = this.data.secondPageinfo
    pageinfo.secondModuleGoodsDtoList = centerGoods
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
    let goodsId = e.currentTarget.dataset.goodsinfo.id
    let url = '../goods/goods?cartTypeName=' + this.data.cartTypeName + '&goodsId=' + goodsId
    if (e.currentTarget.dataset.goodsinfo.marketType == 1) {
      url = '../advancegoods/advancegoods?goodsId=' + goodsId
    }
    wx.navigateTo({
      url: url,
    })
  },
  //检查活动是否在设置的活动时间段
  checkActivityTime: function () {
    let startTime = new Date(this.data.secondPageinfo.startTime)
    let endTime = new Date(this.data.secondPageinfo.endTime)
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
    let goodsList = shopcartUtil.modifyGoodsList(this.data.secondPageinfo.secondModuleGoodsDtoList, goods);
    let pageinfo = this.data.secondPageinfo
    pageinfo.secondModuleGoodsDtoList = goodsList
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
    let goodsList = shopcartUtil.modifyGoodsList(this.data.secondPageinfo.secondModuleGoodsDtoList, goods);
    let pageinfo = this.data.secondPageinfo
    pageinfo.secondModuleGoodsDtoList = goodsList
    this.setData({
      secondPageinfo: pageinfo,
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
    })
    //this.refreshCartNum()
  },
  carModifyEvent: function (e) {
    if (e.detail.type == 'clear') { //请购购车
      this.data.secondPageinfo.secondModuleGoodsDtoList.forEach((item) => {
        item.buyCount = 0
      })
      this.setData({
        goodsList: [],
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
      let goodsInfoList = this.data.secondPageinfo.secondModuleGoodsDtoList
      goodsInfoList.forEach((item) => {
        if (item.id == goods.goodsId) {
          item.buyCount = goods.buyCount
        }
      })
      let pageinfo = this.data.secondPageinfo
      pageinfo.secondModuleGoodsDtoList = goodsInfoList
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
  },
  /**
   * 监听页面滑动事件
   */
  onViewScroll1: function (e) {
    var that = this;
    //获取节点距离顶部的距离
    wx.createSelectorQuery().select('#navbar').boundingClientRect(function (rect) {
      console.log(rect.top)
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
    this.shareAppMessage()
    let secondPageinfo = this.data.secondPageinfo;
    let title = secondPageinfo.bannerTitle
    let bannerId = secondPageinfo.id
    let shopId = app.globalData.shopInfo.id

    let urlPath = '/pages/secondpage/secondpage?shopId=' + shopId +
      '&bannerId=' + bannerId
    if (app.globalData.userInfo) {
      urlPath += '&parentId=' + app.globalData.userInfo.peopleId
    }
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
    let url = '../poster/poster?shopId=' + app.globalData.shopInfo.id + '&pageType=4' + '&bannerId=' + this.data.secondPageinfo.id
    wx.navigateTo({
      url: url
    })
  },
  //有数--页面分享(事件page_share_app_message)
  shareAppMessage() {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '促销二级页',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  /**
   * 倒计时
   */
  caulTime: function () {
    this.setData({
      currentTime: Date.parse(new Date())
    })
    setTimeout(function () {
      that.caulTime();
    }, 1000)
  }
})