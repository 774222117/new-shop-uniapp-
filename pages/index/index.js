const app = getApp()
const util = require('../../utils/util.js')
let request = require('../../utils/request.js');
const imgUrl = require('../../utils/config.js').httpConfig.imgUrl;
//根据经纬度获取最近门店
const getNearbyShopOneUrl = require('../../utils/config.js').httpConfig.getNearbyShopOne;
//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
//获取坐标到门店的距离
const shopDistanceUrl = require('../../utils/config.js').httpConfig.getShopDistanceUrl;

const goodsByProductsnUrl = require('../../utils/config.js').httpConfig.goodsByProductsnUrl;

const loginUrl = require('../../utils/config.js').httpConfig.loginUrl;

const div = require('../../utils/util.js').div;

let shopcartUtil = require('../../utils/shopcart')
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: imgUrl,
    inputValue: '',
    firstIn: true, //是否第一次进入
    allDataObj: {},
    indexBackground: '',
    shuf: [],
    enjoy: [],
    kill: [],
    seckill: [],
    brand: [],
    pop: [],
    floating: [],
    community: [], //banner下面苏果超市接龙
    goodscategory: [], //商品分类card
    goodsconpon: [], //商品优惠券
    popModelIsShow: false,
    enjoyName: '',
    categoryData: [],
    categoryItemInfoData: [],
    bottomIsShow: false, //底部是否显示没有数据
    isShowFloating: false, //是否显示浮窗
    floatingImgurl: '',
    // 倒计时渲染
    end_time: {
      'dd': '00',
      'hh': '00',
      'mm': '00',
      'ss': '00'
    },
    //倒计时总秒数
    endTime: '',
    banerloading: true, //骨架屏
    jielongloading: true,
    ccl: 0, //ccl 品牌类型id
    pn: 0, //pn 页码  
    time: 30 * 60 * 60 * 1000,
    timeData: {},
    shopInfo: {},
    shopGoods: [], //门店多有商品
    cartTypeName: shopcartUtil.cartType.OTO,
    cartNum: 0, //购物车商品数量,
    isfirstLoad: true, //第一次加载页面
    seckillCount: {
      yy: '00',
      mm: '00',
      dd: '00',
      hh: '00',
      mm: '00',
      ss: '00'
    }, //秒杀倒计时对象
    myAddress: undefined,
    //标题图片
    titlePictures: [],
    //文字描述
    textDescriptions: [],
    //秒杀 品牌 快递到家
    promotionDisplayList: [],
    //类别
    middleCategoryList: [],
    //店长推荐
    managerRecommend: [],
    //温馨提示
    reminder: [],
    navHeight: app.globalData.navHeight,
    //领取开关
    isGetKey: true,
    //pageKey
    pageKey: '',
  },
  gotoSearch: function () {
    wx.navigateTo({
      url: '../searchpage/searchpage',
    })
  },
  onChange(e) {
    this.setData({
      timeData: e.detail,
    });
  },
  //全局shopInfo 改变后，回调函数
  watchBack: function (value) { //这里的value 就是 app.js 中 watch 方法中的 set, 返回整个 globalData
    console.log('回调watchBack：', value)
    this.setData({
      shuf: [],
      enjoy: [],
      kill: [],
      seckill: [],
      brand: [],
      pop: [],
      floating: [],
      community: [],
      goodscategory: [],
      banerloading: false,
      pn: 0,
      shopGoods: [],
      //标题图片
      titlePictures: [],
      //文字描述
      textDescriptions: [],
      //秒杀 品牌 快递到家
      promotionDisplayList: [],
      //类别
      middleCategoryList: [],
      //店长推荐
      managerRecommend: [],
      //温馨提示
      reminder: []
    })
    this.setShopInfo(value.shopInfo)
    this.refreshCartNum()
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideTabBar()
    if (options.parentId != undefined) {
      app.setParentId(options.parentId)
    }

    //加入紫金token
    if (options.bankToken != undefined) {
      app.setBankToken(options.bankToken)
    }

    if (options.chnlMrchNo != undefined) {
      app.setChnlMrchNo(options.chnlMrchNo)
    }

    let that = this;
    let shopId = options.shopId
    if (shopId == undefined) {
      if (app.globalData.shopInfo != undefined) {
        shopId = app.globalData.shopInfo.id
      }
    }
    if (shopId != undefined) {
      that.getShopById(shopId)
    } else {

      wx.getLocation({
        success: function (res) {
          that.getNearShopOne(res.longitude, res.latitude, options.shopId)
        },
        fail: function (res) {
          that.myAddress.showShopListModal()
        }
      })
    }
    // 获取第一次进入的值
    wx.getStorage({
      key: 'firstIn',
      success(res) {
        that.setData({
          firstIn: res.data
        })
      },
      fail(err) {
        console.log(err)
      }
    })
    this.loginBySystem()
    this.refreshCartNum()

  },

  //获取首页初始化数据
  getIndexInitInfo: function () {
    let that = this
    let peopleId = -1
    if (app.globalData.userInfo != undefined) {
      peopleId = app.globalData.userInfo.peopleId
    }
    request({
      url: 'indexDataUrl',
      method: 'Get',
      data: {
        shopId: app.globalData.shopInfo.id,
        peopleId: peopleId
      },
      success: function (res) {
        //分发所有数据并保存
        that.distributeAllData(res)
        // "navigate": [],//导航
        // "bag": [],//惊喜福袋
        // "pop": []//弹出来的
        //开始调用方法渲染
        that.setData({
          shuf: that.data.allDataObj.shopshuf,
          enjoy: that.data.allDataObj.enjoy,
          kill: that.data.allDataObj.kill,
          seckill: that.data.allDataObj.seckill,
          brand: that.data.allDataObj.brand,
          pop: that.data.allDataObj.pop,
          floating: that.data.allDataObj.floating,
          community: that.data.allDataObj.community,
          goodscategory: that.data.allDataObj.goodscategory,
          titlePictures: that.data.allDataObj.titlePicture,
          textDescriptions: that.data.allDataObj.textDescription,
          promotionDisplayList: that.data.allDataObj.promotionDisplay,
          middleCategoryList: that.data.allDataObj.middleCategory,
          managerRecommend: that.data.allDataObj.managerRecommend,
          reminder: that.data.allDataObj.reminder,
          banerloading: false
        })

        //是否显示pop弹框
        if (that.data.pop && that.data.pop.length > 0) {
          that.setData({
            popModelIsShow: true
          })
        }
        //是否显示浮窗
        if (that.data.floating && that.data.floating.length > 0) {
          that.setData({
            isShowFloating: true,
            floatingImgurl: that.data.floating[0].bannerImg
          })
        }
        if (that.data.allDataObj.community && that.data.allDataObj.community.length > 0) {
          // 倒计时
          // let timeObj = {
          //   'dd': that.data.allDataObj.community[0].activityInfoDto.lastTime.lastDay,
          //   'hh': that.data.allDataObj.community[0].activityInfoDto.lastTime.split(':')[0],
          //   'mm': that.data.allDataObj.community[0].activityInfoDto.lastTime.split(':')[1],
          //   'ss': that.data.allDataObj.community[0].activityInfoDto.lastTime.split(':')[2],
          // }

          // that.setData({
          //   end_time: timeObj,
          //   endTime: timeObj.hh * 60 * 60 + timeObj.mm * 60 + timeObj.ss * 1
          // })
          var newcommunity = []
          for (let i = 0; i < that.data.community.length; i++) {
            let community = that.data.community[i]
            let timeObj = {
              'dd': community.activityInfoDto.lastDay,
              'hh': community.activityInfoDto.lastTime.split(':')[0],
              'mm': community.activityInfoDto.lastTime.split(':')[1],
              'ss': community.activityInfoDto.lastTime.split(':')[2],
            }
            community.end_time = timeObj
            community.endTime = timeObj.hh * 60 * 60 + timeObj.mm * 60 + timeObj.ss * 1
            newcommunity.push(community)
          }
          that.setData({
            community: newcommunity
          })
          // 调用倒计时函数
          that.countDown()
        }
      },
      error: function (err) {
        console.log(err);
      }
    });
  },
  //从其他页面返回当前页，刷新基础数据
  getIndexInitInfo_onShow: function () {
    let that = this
    let peopleId = -1
    if (app.globalData.userInfo != undefined) {
      peopleId = app.globalData.userInfo.peopleId
    }

    request({
      url: 'indexDataUrl',
      method: 'Get',
      data: {
        shopId: app.globalData.shopInfo.id,
        peopleId: peopleId
      },
      success: function (data) {
        //分发所有数据并保存
        that.distributeAllData(data)
        // "navigate": [],//导航
        // "bag": [],//惊喜福袋
        // "pop": []//弹出来的
        //开始调用方法渲染
        that.setData({
          shuf: that.data.allDataObj.shopshuf,
          enjoy: that.data.allDataObj.enjoy,
          kill: that.data.allDataObj.kill,
          seckill: that.data.allDataObj.seckill,
          brand: that.data.allDataObj.brand,
          pop: that.data.allDataObj.pop,
          floating: that.data.allDataObj.floating,
          community: that.data.allDataObj.community,
          goodscategory: that.data.allDataObj.goodscategory,
          goodsconpon: that.data.allDataObj.goodsconpon
        })
      },
      error: function (err) {
        console.log(err);
      }
    });
  },
  // 获取店铺所有商品
  getShopAllGoods: function () {
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
        ps: 8
      },
      success: function (res) {
        if (res.data.flag) {
          if (res.data.data.total == that.data.shopGoods.length) {
            console.log('没有更多啦~')
            wx.showToast({
              title: '没有更多啦~',
              icon: 'none'
            })
            wx.hideLoading()
            return
          }
          that.setData({
            shopGoods: that.data.shopGoods.concat(res.data.data.rows),
            pn: that.data.pn + 1
          })
          //商品卡曝光(事件expose_sku_component)
          that.observer(".trigger_sku_component_list");
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
        wx.hideLoading()
      },
      error: function (err) {
        wx.hideLoading()
        console.log(err);
      }
    });
  },
  //从后台获取最近门店信息
  getNearShopOne: function (longitude, latitude, shopId) {

    let that = this
    //获取缓存中的门店信息
    let cacheShopId = undefined
    if (app.globalData.shopInfo != null) {
      if (app.globalData.shopInfo.id == shopId || shopId == undefined) {
        that.setShopInfo(app.globalData.shopInfo)
      } else {
        that.getShopById(shopId)
      }
      that.setData({
        loading: false
      })
    }
    //0.都为空，获取附近的门店
    else {
      if (shopId != undefined) {
        that.getShopById(shopId)
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
          latitude: latitude
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
        if (app.globalData.shopInfo && app.globalData.shopInfo.id != shopId) {
          shopcartUtil.clearShopCartList()
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
   * 设置门店
   *   1.data.shopInfo赋值
   *   2.写入缓存
   */
  setShopInfo: function (shopInfo) {
    //1.data.shopInfo赋值
    this.setData({
      shopInfo: shopInfo
    })
    //2.写入缓存 选择门店组件已经 更新门店信息到缓存
    app.setShopInfo(shopInfo)
    this.getIndexInitInfo()
    this.getShopAllGoods()
  },
  //跳转到商品详情
  jumpToGoodsDetail: function (e) {
    let that = this;
    // wx.showLoading({ //开始加载loding
    //   title: '加载中'
    // })
    // if (app.globalData.userInfo == null) {
    //   wx.navigateTo({
    //     url: '../login/login',
    //     complete() {
    //       wx.hideLoading()
    //     } //关闭loding
    //   })
    //   return
    // }
    let goodsId = e.detail.goods.id
    let marketType = e.detail.goods.marketType
    let goodsPlatform = e.detail.goodsPlatform
    console.log(goodsPlatform)
    //社区购
    if (goodsPlatform == 2) {
      let activityId = e.detail.activityId
      wx.navigateTo({
        url: '../jielong/jielong?activityId=' + activityId
      })
    } else {
      if (marketType == 1) {
        //跳转社区购页面
        wx.navigateTo({
          url: '../advancegoods/advancegoods?goodsId=' + goodsId,
        })

      } else {
        wx.navigateTo({
          url: '../goods/goods?cartTypeName=' + shopcartUtil.cartType.OTO + '&goodsId=' + goodsId,
        })
      }
    }
    //商品卡触发(事件trigger_sku_component)
    that.cardClick(e.detail.goods);

  },
  //社区购 立即参团跳转
  jumpToDetail: function (e) {
    // wx.showLoading({ //开始加载loding
    //   title: '加载中'
    // })
    // if (app.globalData.userInfo == null) {
    //   wx.navigateTo({
    //     url: '../login/login',
    //     complete() {
    //       wx.hideLoading()
    //     } //关闭loding
    //   })
    //   return
    // }
    let activityId = e.currentTarget.dataset.activityid
    wx.navigateTo({
      url: '../jielong/jielong?activityId=' + activityId
    })
  },
  jumpToCategory: function (e) {
    wx.showLoading({ //开始加载loding
      title: '加载中'
    })
    if (app.globalData.userInfo == null) {
      wx.navigateTo({
        url: '../login/login',
        complete() {
          wx.hideLoading()
        } //关闭loding
      })
      return
    }
    let navigateId = e.currentTarget.dataset.navigateid
    wx.switchTab({
      url: '../category/category?categoryId=' + navigateId,
      complete() {
        wx.hideLoading()
      } //关闭loding
    })
  },
  toCategory: function (e) {
    // wx.showLoading({ //开始加载loding
    //   title: '加载中'
    // })
    // if (app.globalData.userInfo == null) {
    //   wx.navigateTo({
    //     url: '../login/login',
    //     complete() {
    //       wx.hideLoading()
    //     } //关闭loding
    //   })
    //   return
    // }
    let navigateId = e.currentTarget.dataset.navigateid
    app.globalData.headId = navigateId
    wx.switchTab({
      url: '../category/category',
      complete() {
        wx.hideLoading()
      } //关闭loding
    })
  },
  toPromotion: function (e) {
    wx.showLoading({ //开始加载loding
      title: '加载中'
    })
    if (app.globalData.userInfo == null) {
      wx.navigateTo({
        url: '../login/login',
        complete() {
          wx.hideLoading()
        } //关闭loding
      })
      return
    }
    let navigateId = e.currentTarget.dataset.navigateid
    wx.navigateTo({
      url: '../promotion/promotion?activityId=' + navigateId + '&chooseShop=1',
      complete() {
        wx.hideLoading()
      } //关闭loding
    })
  },
  toDptjPromotion: function (e) {
    wx.showLoading({ //开始加载loding
      title: '加载中'
    })
    if (app.globalData.userInfo == null) {
      wx.navigateTo({
        url: '../login/login',
        complete() {
          wx.hideLoading()
        } //关闭loding
      })
      return
    }
    let navigateId = e.currentTarget.dataset.navigateid
    wx.navigateTo({
      url: '../promotion/promotion?activityId=' + navigateId + '&chooseShop=0',
      complete() {
        wx.hideLoading()
      } //关闭loding
    })
  },
  //倒计时
  countDown: function () {
    let _this = this;
    if (_this.data.community == undefined) return
    if (_this.data.community.length > 0) {
      for (let i = 0; i < _this.data.community.length; i++) {
        let nowEndTime = _this.data.community[i].endTime - 1
        let timeObj = {
          'dd': _this.data.community[i].end_time.dd,
          'hh': _this.dateformat(nowEndTime).split(':')[0],
          'mm': _this.dateformat(nowEndTime).split(':')[1],
          'ss': _this.dateformat(nowEndTime).split(':')[2]
        }
        let community_end_time = 'community[' + i + '].end_time'
        let community_endTime = 'community[' + i + '].endTime'
        _this.setData({
          [community_end_time]: timeObj,
          [community_endTime]: nowEndTime
        })
      }
    }
    setTimeout(function () {
      _this.countDown();
    }, 1000)
  },
  // 时间格式化输出，如11:03 25:19 每1s都会调用一次
  dateformat: function (micro_second) {
    // 总秒数
    var second = Math.floor(micro_second);
    // 天数
    var day = Math.floor(second / 3600 / 24);
    // 小时
    var hr = Math.floor(second / 3600 % 24);
    var hrStr = hr.toString();
    if (hrStr.length == 1) hrStr = '0' + hrStr;

    // 分钟
    var min = Math.floor(second / 60 % 60);
    var minStr = min.toString();
    if (minStr.length == 1) minStr = '0' + minStr;

    // 秒
    var sec = Math.floor(second % 60);
    var secStr = sec.toString();
    if (secStr.length == 1) secStr = '0' + secStr;

    if (day <= 1) {
      return hrStr + ":" + minStr + ":" + secStr;
    } else {
      return day + " 天 " + hrStr + ":" + minStr + ":" + secStr;
    }
  },


  // 分发所有数据到allDataObj
  distributeAllData: function (data) {
    let that = this;
    that.setData({
      allDataObj: {}
    })
    for (var i = 0; i < data.data.length; i++) {
      // "navigate": [],//导航 "shuf": [],//轮播"enjoy": [],//优享卡"kill": [],//今日秒杀
      // "bag": [],//惊喜福袋 "brand": [],//品牌优惠"pop": [],//弹出来的
      that.data.allDataObj[data.data[i].code] = data.data[i].banners;
      if (data.data[i].code == "enjoy") {
        that.setData({
          enjoyName: data.data[i].name
        })
      }
    }
    that.setData({
      allDataObj: that.data.allDataObj
    })
  },

  //显示pop的弹框
  /**
   * 类型 
   *    1 优惠券详情 
   *    2 品牌优惠券列表 
   *    3 优享卡 
   *    4 活动 
   *    5 个人中心 
   *    6 搜索页  
   *    7 附近门店 
   *    8 扫码 
   *    9 外部URL 
   *    10 打开小程序
   */
  popIsShow: function (e) {
    // console.log(e)
    // if (app.globalData.userInfo == null) {
    //   wx.showLoading({ //开始加载loding
    //     title: '加载中',
    //     mask: true
    //   })
    //   wx.redirectTo({
    //     url: '../login/login',
    //     complete() {
    //       wx.hideLoading() //关闭loding
    //     }
    //   })
    //   return
    // }
    let poptype = "优惠券"
    let clicktype = "弹窗"
    let contentid = ''
    let popcontent = ''
    let clicktime = util.formatTime(new Date())

    if (e.currentTarget.id == "floating") {
      clicktype = "浮窗"
    }
    //上传首页点击事件
    if (app.globalData.userInfo != null) {
      wx.reportAnalytics('index_click', {
        clickregion: clicktype,
        userid: app.globalData.userInfo.peopleId,
        nickname: app.globalData.userInfo.nickName,
        clicktime: clicktime,
      })
    }
    switch (e.currentTarget.dataset.item.bannerType) {
      case 1:
        console.log('1')
        contentid = e.currentTarget.dataset.item.navigateId
        popcontent = e.currentTarget.dataset.item.navigateName
        wx.navigateTo({
          url: '../coupondetail/coupondetail?source=' + clicktype + '&id=' + e.currentTarget.dataset.item.navigateId,
          success() {
            console.log('success')
          },
          fail() {
            console.log('fail')
          },
          complete() {
            wx.hideLoading() //关闭loding
          }
        })
        break;
      case 2:
        console.log('2')
        poptype = "品牌列表"
        contentid = e.currentTarget.dataset.item.navigateId
        popcontent = e.currentTarget.dataset.item.navigateName
        wx.navigateTo({
          url: '../couponcenter/couponcenter?tagid=' + e.currentTarget.dataset.item.navigateId,
          success() {
            console.log('success')
          },
          fail() {
            console.log('fail')
          },
          complete() {
            wx.hideLoading() //关闭loding
          }
        })
        break;
      case 3:
        console.log('3')
        poptype = "优享卡"
        contentid = e.currentTarget.dataset.item.navigateId
        popcontent = e.currentTarget.dataset.item.navigateName
        wx.navigateTo({
          url: '../paycard/paycard?id=' + e.currentTarget.dataset.item.navigateId,
          success() {
            console.log('success')
          },
          fail() {
            console.log('fail')
          },
          complete() {
            wx.hideLoading() //关闭loding
          }
        })
        break;
      case 4:
        console.log('4')

        //红包雨
        if (e.currentTarget.dataset.item.activity.activeType == 2) {
          let activeInfo = JSON.stringify(e.currentTarget.dataset.item.activity);
          poptype = "红包雨"
          contentid = e.currentTarget.dataset.item.navigateId
          popcontent = e.currentTarget.dataset.item.navigateName
          wx.navigateTo({
            url: '../packetRain/index?activeId=' + activeInfo.id,
            //url: '../packetRain/index?activeId=32',
            //url: '../packetRain/index',
            success() {
              console.log('success')
            },
            fail() {
              console.log('fail')
            },
            complete() {
              wx.hideLoading() //关闭loding
            }
          })
        }
        //一键领券
        else if (e.currentTarget.dataset.item.activity.activeType == 1) {
          poptype = "券包"
          contentid = e.currentTarget.dataset.item.activity.id
          popcontent = e.currentTarget.dataset.item.navigateName
          wx.navigateTo({
            //url: '../packetRain/index?activeInfo=' + activeInfo,
            url: '../couponmany/couponmany?source=' + clicktype + '&id=' + e.currentTarget.dataset.item.activity.id,
            success() {
              console.log('success')
            },
            fail() {
              console.log('fail')
            },
            complete() {
              wx.hideLoading() //关闭loding
            }
          })
        }
        break;
      case 9:
        console.log('9')
        poptype = "外链"
        contentid = e.currentTarget.dataset.item.navigateName
        popcontent = e.currentTarget.dataset.item.navigateUrl
        wx.navigateTo({
          url: '../webView/webView?path=' + e.currentTarget.dataset.item.navigateUrl,
          success() {
            console.log('success')
          },
          fail() {
            console.log('fail')
          },
          complete() {
            wx.hideLoading() //关闭loding
          }
        })
        break;
        //跳转小程序
      case 10:
        let _appId = e.currentTarget.dataset.item.navigateName;
        let _path = e.currentTarget.dataset.item.navigateUrl;
        poptype = "小程序跳转"
        contentid = e.currentTarget.dataset.item.navigateName
        popcontent = e.currentTarget.dataset.item.navigateUrl
        wx.navigateToMiniProgram({
          appId: _appId,
          path: _path,
          success(res) {
            console.info("navigateToMiniProgram-->sucess")
            console.info(res);
          },
          fail(res) {
            console.info("navigateToMiniProgram-->fail")
            console.info(res);
          },
          complete() {
            wx.hideLoading() //关闭loding
          }
        })
        break
      case 12:
        poptype = "小程序跳转"
        popcontent = e.currentTarget.dataset.item.navigateUrl
        if (popcontent.indexOf("category/category") != -1) {
          wx.switchTab({
            url: popcontent,
            complete() {
              wx.hideLoading() //关闭loding
            },
            fail(res) {
              console.info(res)
            }
          })
        } else {
          wx.navigateTo({
            url: popcontent,
            complete() {
              wx.hideLoading() //关闭loding
            }
          })
        }

        break
        //供应商活动
      case 13:
        //品牌优惠图片点击事件          
        poptype = "供应商活动"
        wx.navigateTo({
          url: '../jielong/jielong?activityId=' + e.currentTarget.dataset.item.navigateId,
          complete() {
            wx.hideLoading() //关闭loding
          }
        })
        break;
        //领取优惠券
      case 16:
        let couponId = e.currentTarget.dataset.item.navigateId
        this.receiveCoupon(couponId)
        break;
        //领取多张优惠券
      case 17:
        let activityId = e.currentTarget.dataset.item.navigateId
        this.getActivityCoupons(activityId)
        break;
    }
    //关闭弹窗
    this.setData({
      popModelIsShow: false
    })
    //上报分析
    wx.reportAnalytics('pop_click', {
      poptype: poptype,
      popcontent: clicktype,
      contentid: contentid,
      userid: app.globalData.userInfo.peopleId,
      nickname: app.globalData.userInfo.nickName,
      clicktime: clicktime,
      clicktype: clicktype,
    });

  },
  popCloseBtn: function () {
    this.setData({
      popModelIsShow: false
    })
  },

  /**
   * 领取优惠券
   */
  receiveCoupon: function (couponId) {
    if (app.globalData.userInfo == null) {
      wx.redirectTo({
        url: '../login/login',
        complete() {
          wx.hideLoading() //关闭loding
        }
      })
      return
    }

    let _this = this;
    let _user = app.globalData.userInfo
    let pageKey = this.pageKeyFunc(couponId)

    let _params = {
      pageKey: pageKey,
      amount: 0,
      merchantId: 1,
      payType: 2,
      peopleId: _user.peopleId,
      orderItems: [{
        number: 1,
        couponId: couponId
      }]
    };
    //关闭弹窗
    this.setData({
      popModelIsShow: false
    })
    wx.showLoading({
      title: '领取优惠券中...',
      mask: true
    })

    request({
      url: 'submitConponUrl',
      method: 'post',
      data: _params,
      //错误
      error: function (error) {
        wx.hideLoading();
        console.log(error);
        //消息提示
        wx.showToast({
          title: error.errMsg || '领取失败',
          mask: true,
          icon: 'none'
        })
      },
      final: function () {},
      success: function (data) {
        wx.hideLoading();
        if (data.statusCode == 200 && data.data) {
          let _data = data.data;
          if (_data.flag) {
            wx.showModal({
              content: "领取成功，点击确定查看我的优惠券！",
              confirmText: '确定',
              cancelText: '取消',
              success: function (res) {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/mycoupon/mycoupon',
                  })
                }
              }
            })
          } else {
            //领取失败
            let _msg = _data.message;
            //消息提示
            wx.showToast({
              title: _msg,
              mask: true,
              icon: 'none'
            })
          }
        }
      }
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
  /**
   * 领取多张优惠券
   */
  receiveActivity: function (activityId, activityCoupons) {
    if (app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }

    //优惠券数据
    let orderItems = []
    activityCoupons.forEach(function (value, i) {
      let coupon = {
        number: 1,
        couponId: value.id
      }
      orderItems.push(coupon)
    })

    //组织参数
    let _params = {
      pageKey: this.pageKeyFunc(activityId),
      activityId: activityId,
      amount: 0,
      merchantId: 1,
      payType: 2,
      peopleId: app.globalData.userInfo.peopleId,
      orderItems: orderItems
    }

    wx.showLoading({
      title: '正在领取优惠券...',
      mask: true
    })

    request({
      url: 'submitCouponManyUrl',
      method: 'post',
      data: _params,
      error: function (err) {
        wx.hideLoading();
        wx.showToast({
          title: "网络状态异常",
          mask: true,
          icon: 'none'
        })
      },

      success: function (res) {
        wx.hideLoading();
        if (res.statusCode != 200) {
          wx.showToast({
            title: "网络状态异常",
            mask: true,
            icon: 'none'
          })
        }

        if (!res.data) {
          wx.showToast({
            title: "服务器返回数据异常",
            mask: true,
            icon: 'none'
          })
        }

        let result = res.data;
        if (!result.flag) {
          wx.showToast({
            title: result.message || "领取优惠券失败",
            mask: true,
            icon: 'none'
          })
        }

        wx.showModal({
          content: "领取成功，点击确定查看我的优惠券！",
          confirmText: '确定',
          cancelText: '取消',
          success: function (res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '/pages/mycoupon/mycoupon',
              })
            }
          }
        })
      }
    })
  },

  //获取活动优惠券数据
  getActivityCoupons: function (activityId) {
    let _this = this;
    request({
      url: 'activityCouponsUrl',
      method: 'Get',
      data: {
        activityId: activityId,
        pn: _this.data.pn
      },
      success: function (res) {
        if (res.data.rows != undefined) {
          console.info(res.data.rows)
          let newActivityCoupons = _this.data.activityCoupons.concat(res.data.rows);
          //领券
          _this.receiveActivity(activityId, newActivityCoupons)
        } else {
          wx.showToast({
            title: '领取优惠券出错！',
            mask: true,
            icon: 'none'
          });
        }
      },
      fail: function (err) {
        console.info(err)
      }
    })
  },

  //初始方法 -- key生成
  pageKeyFunc: function (id) {
    if (app.globalData.userInfo == undefined) return
    let _date = new Date().getTime(),
      _peopleId = app.globalData.userInfo.peopleId,
      _id = id;
    let _str = _peopleId + '' + _date + '' + _id;
    if (_peopleId || _peopleId == 0) {
      return _str
    } else {
      console.log('用户不存在');
    }
  },

  addnum: function (e) {
    //判断登录
    if (app.globalData.userInfo == null) {
      wx.navigateTo({
        url: '../login/login',
      })
      return
    }
    let goods = e.detail.goods
    let buyCount = 0
    if (goods.buyCount) {
      buyCount = goods.buyCount
    }
    goods = shopcartUtil.addShopCart(goods, shopcartUtil.cartType.OTO)
    if (goods.buyCount > buyCount) {
      wx.showToast({
        title: '添加购车成功',
        icon: 'none'
      })
    }
    this.refreshCartNum()

    this.addToCart(goods, "append_to_cart")
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.myAddress = this.selectComponent('#myAddress')
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
   * 生命周期函数--监听页面显示
   */
  onShow: function (opt) {
    app.watch(this.watchBack)
    if (app.globalData.userInfo != undefined && !this.data.isfirstLoad && this.data.shopInfo.id != app.globalData.shopInfo.id) {
      this.setData({
        shopInfo: app.globalData.shopInfo
      })
      this.setData({
        shuf: [],
        enjoy: [],
        kill: [],
        brand: [],
        pop: [],
        floating: [],
        community: [],
        goodscategory: [],
        banerloading: false,
        pn: 0,
        shopGoods: []
      })
      this.getIndexInitInfo_onShow()
      this.getShopAllGoods()

    }
    this.refreshCartNum()
    this.setData({
      isfirstLoad: false
    })
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
    if (this.data.pn > 0) {
      this.getShopAllGoods()
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let shopId = app.globalData.shopInfo.id
    let url = '/pages/index/index?shopId=' + shopId

    if (app.globalData.userInfo) {
      url += '&parentId=' + app.globalData.userInfo.peopleId
    }

    this.shareAppMessage()

    return {
      path: url,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }

  },

  getScancode: function () {
    var that = this;
    // 允许从相机和相册扫码
    wx.scanCode({
      success: (res) => {
        var result = res.result;
        that.setData({
          result: result
        })
        //如果是微信码，跳转页面
        if (res.scanType == "WX_CODE") {
          console.info(res.path)

        }
        //二维码，暂时不处理
        else if (res.scanType == "QR_CODE") {
          wx.showToast({
            title: "请扫描小程序二维码！",
            mask: true,
            icon: 'none',
            duration: 2000
          })
        }
        //一维码
        else {
          //TODO: res.result 返回的条码值，可通过后台查询对应优惠券，后台接口尚未开发
          that.getGoodsByProductsn(res.result)
        }
      },
      fail: (res) => {
        console.info(result)
      }
    })
  },

  getGoodsByProductsn(productsn) {
    wx.showLoading({
      title: '加载中...'
    })
    //访问数据
    wx.request({
      url: goodsByProductsnUrl,
      data: {
        productsn: productsn,
        shopId: this.data.shopInfo.id
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          let url = "../goods/goods"
          if (res.data.data.marketType == 1) {
            url = "../advancegoods/advancegoods"
          }
          url += '?goodsId=' + res.data.data.id
          wx.navigateTo({
            url: url,
            complete() {} //关闭loding
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
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

  //有数--商品卡曝光
  observer(classId) {
    let that = this;
    if (that._observer) {
      that._observer.disconnect();
    }
    that._observer = wx.createIntersectionObserver(that, {
      observeAll: true
    })
    that._observer.relativeToViewport({
        bottom: -50
      })
      .observe(classId, (res) => {
        const {
          index
        } = res.dataset;
        let resultData = res.dataset.item;
        app.TXYouShu.track('expose_sku_component', {
          "sku": {
            "sku_id": resultData.goodssn,
            "sku_name": resultData.title
          },
          "spu": {
            "spu_id": resultData.goodssn,
            "spu_name": resultData.title
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
      })
  },

  //有数--商品卡触发
  cardClick(goodsInfo) {
    app.TXYouShu.track('trigger_sku_component', {
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

  //有数--商品加购（事件add_to_cart）
  addToCart(goodsInfo, actionType) {
    app.TXYouShu.track('add_to_cart', {
      "action_type": actionType,
      "sku": {
        "sku_id": goodsInfo.goodssn + "",
        "sku_name": goodsInfo.title
      },
      "spu": {
        "spu_id": goodsInfo.goodssn + "",
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

  //有数--页面分享(事件page_share_app_message)
  shareAppMessage() {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '首页',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  // 第一次图片点击
  firstInClick: function () {
    wx.setStorageSync('firstIn', false)
    this.setData({
      firstIn: false
    })
  },
  gotoShoppingCart: function () {
    wx.switchTab({
      url: '/pages/shoppingCar/shoppingCar',
    })
  },
  loginBySystem: function () {
    if(app.globalData.userInfo != null){
      return
    }
    wx.showLoading({//开始加载loding
      title: '加载中',
      mask: true
    })
    var that = this
    let bankToken = app.globalData.bankToken
    wx.login({
      success: res => {
        wx.request({
          url: loginUrl,
          data: {
            code: res.code,
            bankToken : bankToken
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            if(!!res.data.data.phone) {
              res.data.data.phone = Math.round(div(res.data.data.phone, res.data.data.peopleId));
            }
            if (res.data.code == 2) {
              that.setData({
                userInfo: res.data.data,
                hasUserInfo: true,
              });
              // that.data.userInfo.icon = that.data.userData.avatarUrl
              app.setUserInfo(that.data.userInfo)
            }
          }
        })                
        wx.hideLoading()//关闭loding
      }
    })
  },
})