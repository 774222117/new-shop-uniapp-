/**
 * 预售商品页面，只会在OTO页面调用
 */
const app = getApp()
//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
//商品详细信息
const goodsInfoUrl = require('../../utils/config.js').httpConfig.goodsInfoUrl;
//html解析模块
let htmlParse = require('../../component/wxParse/wxParse.js');
//购物车工具
let shopcartUtil = require('../../utils/shopcart')
//附近的门店，门店搜索URL
const nearbyShopUrl = require('../../utils/config.js').httpConfig.nearbyShopUrl;
const findPeopleGoods = require('../../utils/config.js').httpConfig.findPeopleGoods;
let request = require('../../utils/request.js');
//获取可领取优惠券列表
const getGoodsCanReceivedCouponByIdUrl = require('../../utils/config.js').httpConfig.getGoodsCanReceivedCouponByIdUrl;
const PosterParam = require('../../utils/config.js').httpConfig.PosterParam;
const GetSceneParam = require('../../utils/util.js').GetSceneParam;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //推广人id
    parentId: -1,
    //来源 1 首页 2 门店推广
    orderSource: 1,
    //门店id    
    shopId : -1,
    //商品id
    goodsId : -1,
    //父级商品Id
    parentGoodsId : -1,
    //商品数据
    goodsInfo : {},
    //购物车
    shopCart: [],
    //本次购买数
    buyCount : 0,
    //总金额
    sumPrice : 0,
    //门店名称
    shopName : '',
    // 倒计时渲染
    end_time:{'dd':'00','hh':'00','mm':'00','ss':'00'},
    //倒计时总秒数
    endTime:'',
    //配送方式：0 全部 1 门店自提 2 配送到家 wyx 2020-03-16 append it
    deliveryWay : 1,
    //是否选择门店 0 否  1 是
    chooseShop : 0 ,
    //经纬度
    longitude : 0,
    latitude : 0,
    shops: [],
    shoppn:0,
    //社区购活动Id
    supplierActivityId : 0,
    //汇总数据
    advanceCartTotal : {
      sumPrice : 0,
      sumProductPrice : 0,
      buyCount : 0
    },
    roomId:0,
    // 接龙团
    activityOrdersList: [],
    orderNumber: 0,
    //接龙数据列表当前页码
    pn: 0,
    hasMore: false,
    //领取开关
    isGetKey:true,
    //pageKey
    pageKey:'',
    //可领取优惠券
    couponList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    //获取二维码参数
    GetSceneParam(PosterParam, options,function(res){
      options = res
      if(options.parentId != undefined){
        app.setParentId(options.parentId)
      }
      //直播间Id
      if(options.roomId){
        that.setData({roomId:options.roomId})
        app.setRoomId(options.roomId)
      }
      //判断登录
      // if (app.globalData.userInfo == null) {
      //   wx.redirectTo({
      //     url: '../login/login'
      //   })
      //   return
      // }
      //清空购物车
      shopcartUtil.clearShopCart(shopcartUtil.cartType.Advance)
      shopcartUtil.caulTotal(shopcartUtil.cartType.Advance)
      //设置汇总数据
      app.setAdvanceCartTotal(that.data.advanceCartTotal)
  
      console.info(options)
      let goodId = options.goodsId     
      that.setData({            
        goodsId: options.goodsId
      })
  
      if(options.supplierActivityId){
        that.setData({supplierActivityId : options.supplierActivityId})
      }
      //是否选择门店 0 否  1 是
      if(options.chooseShop){
        that.setData({
          chooseShop : options.chooseShop,
          parentGoodsId : goodId
        })
      }
      let shopId = options.shopId
      if (shopId){
        that.setData({ shopId: shopId})
        if (app.globalData.shopInfo == null || shopId != app.globalData.shopInfo.id){
          that.getShopById(shopId)
        } else {
          that.setData({
            shopId: app.globalData.shopInfo.id,
            shopName: app.globalData.shopInfo.name
          })
        }
      }
      else{
        //缓存中不存在获取店铺信息
        if (app.globalData.shopInfo == null) {
          if(shopId)
          that.getShopById(shopId)
        }
        else {
          that.setData({
            shopId: app.globalData.shopInfo.id,
            shopName: app.globalData.shopInfo.name
          })
        }
      }
  
      //上级ID
      if (options.parentId) {
        that.setData({ parentId: options.parentId })
        that.setData({ orderSource: 2 })
      }    
      //获取商品数据
      that.getGoodsInfo(goodId)
      // 获取接龙团数据
      that.getSupplierActivityInfo()
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
    this.getSupplierActivityInfo();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let goodsInfo = this.data.goodsInfo;
    let title = goodsInfo.title + '(规格:' + goodsInfo.spec + ')★售价:' + goodsInfo.marketPrice
    let shopId = this.data.shopId
    let goodsId = goodsInfo.id
    let parentId = app.globalData.userInfo.peopleId
    let urlPath = '/pages/advancegoods/advancegoods?shopId=' + shopId +
      '&goodsId=' + goodsId + '&parentId=' + parentId
      
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
  refreshCars : function(goods){
    let shopCart = shopcartUtil.getShopCart(shopcartUtil.cartType.Advance)
    let advanceCartTotal = shopcartUtil.getShopCartTotal(shopcartUtil.cartType.Advance)
    this.setData({ 
      goodsInfo : goods,
      advanceCartTotal: advanceCartTotal,
      shopCart: shopCart
    })
  },
  /**
   * 根据Id获取门店信息
   */
  getShopById: function (shopId,goodsId,isClearCar) {
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
        if (app.globalData.shopInfo && app.globalData.shopInfo.id != shopId && isClearCar){
          shopcartUtil.clearShopCartList()
        }
        app.setShopInfo(res.data.data)
        that.setData({ 
          shopId:app.globalData.shopInfo.id,
          shopName: app.globalData.shopInfo.name 
        })
        
        //查询商品
        if(goodsId){
          //清除提货点
          wx.removeStorageSync('carrierInfo')
          //如果是预售，不用重查商品，总部促销需要重新查询
          if(that.data.goodsInfo && that.data.goodsInfo.marketType == 2){
            that.getGoodsInfo(goodsId,app.globalData.shopInfo.id)
          }else{
            that.setData({modalName:'immediatePurchase'})
          }          
        }
      }
    })
  },

  /**
   * 获取商品详细信息
   */
  getGoodsInfo: function (goodsId,shopId){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    if(!shopId){
      shopId = -1
    }
    let that = this
    wx.request({
      url: goodsInfoUrl,
      data: {
        goodsId: goodsId,
        peopleId: app.globalData.userInfo!=null?app.globalData.userInfo.peopleId : -1,
        shopId : app.globalData.shopInfo.id
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
       
        that.setData({           
          goodsInfo: res.data.data,
          goodsId : res.data.data.id
        })
        
        //记录配送方式 wyx 2020-03-16 append it
        if(res.data.data.deliveryWay != null && res.data.data.deliveryWay != undefined){
          that.setData({deliveryWay : res.data.data.deliveryWay})
        }

        console.info(that.data.goodsInfo)
        // 模板渲染
        let ruleInfo = that.data.goodsInfo.content;
        console.info("ruleInfo--->" + ruleInfo)
        if (ruleInfo){
          htmlParse.wxParse('commodityDetails', 'html', ruleInfo, that, 5);
        }        
        // 倒计时
        let timeObj = {
          'dd': that.data.goodsInfo.lastDay,
          'hh': that.data.goodsInfo.lastTime.split(':')[0],
          'mm': that.data.goodsInfo.lastTime.split(':')[1],
          'ss': that.data.goodsInfo.lastTime.split(':')[2],
        }
        that.setData({
          end_time: timeObj, 
          endTime: timeObj.hh*60*60 + timeObj.mm*60 + timeObj.ss*1
        })
        
                // 调用倒计时函数
        that.countDown(that.data.endTime)     
        //添加一个商品
        // let goods = that.data.goodsInfo
        // goods = shopcartUtil.addShopCart(goods,shopcartUtil.cartType.Advance)
        // // 在商品详情中重新设置下数据
        // that.refreshCars(goods)

      }
    })
  },

/******************************************** 事件 ***************************************************** */
  /**
   * 添加购物车事件
   */
  addCart : function(e){
    let goods = this.data.goodsInfo
    goods = shopcartUtil.addShopCart(goods,shopcartUtil.cartType.Advance)
    // 在商品详情中重新设置下数据
    this.refreshCars(goods)
  },

  /**
   * 减少购物车
   * @param {*} e 
   */
  delCart : function(e){
    let goods = this.data.goodsInfo
    goods = shopcartUtil.delShopCart(goods,shopcartUtil.cartType.Advance)
    // 在商品详情中重新设置下数据
    this.refreshCars(goods)
  },

  /**
   * 设置库存
   * @param {} e 
   */
  changeBuyCount : function(e){
    if(e.detail.value === "") return
    //if(e.detail.value === "0") return    
    let goods = e.currentTarget.dataset.goodsinfo
    let total = parseInt(e.detail.value); 
    let pos = e.detail.cursor
    goods = shopcartUtil.setShopCartNum(goods,total,shopcartUtil.cartType.Advance)
     // 在商品详情中重新设置下数据
    this.refreshCars(goods)
    return{
      value: goods.buyCount,
      cursor: pos
    }
  },

  btnPayTap(e){    
    //如果需要选择门店，弹出门店选择框,不是总部商品，不支持
    if(this.data.chooseShop == 1){
      this.showShopList()
    }
    else{
      this.showModal(e)
    }
  },

  //倒计时
  countDown: function (that) {
    let _this = this;
    that = that - 1;
    // 倒计时
    let timeObj = {
      'dd': _this.data.end_time.dd,
      'hh': _this.dateformat(that).split(':')[0],
      'mm': _this.dateformat(that).split(':')[1],
      'ss': _this.dateformat(that).split(':')[2]
    }
    _this.setData({
      end_time: timeObj,
      endTime: that
    })
    setTimeout(function() {
      _this.countDown(that);
    }, 1000)
  },
  // 时间格式化输出，如11:03 25:19 每1s都会调用一次
  dateformat: function(micro_second) {
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

  showModal(e) {
    if (app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    this.setData({
      modalName: e.currentTarget.dataset.target
    })    
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  /**
   * 生成海报
   */
  toPoster:function(){   
    wx.navigateTo({
      url: '../poster/poster?shopId=' + this.data.shopId + '&goodsId=' + this.data.goodsInfo.id + '&pageType=1'
    })
  },

  /**
   * 去支付
   */
  toPay : function(){
    let cart = shopcartUtil.getShopCart(shopcartUtil.cartType.Advance)
    if(cart.length == 0){
      wx.showToast({
        title: '请输入商品数量！',
        icon:'none'
      })
      return
    }
    wx.navigateTo({
      url: '../shoppay/shoppay?cartTypeName=' + shopcartUtil.cartType.Advance + '&source=1&deliveryWay=' + this.data.goodsInfo.deliveryWay + '&roomId=' + this.data.roomId + '&isDelivery=' + this.data.goodsInfo.isDelivery
    })
  },

  //地址下滑
  addressBtmFun(e){
    this.showShopList()
  },

  //地址搜索js
  searchAddress(e){
    this.setData({ 
      shoppn : 0,
      shops: []
    })
    this.getNearbyShop(this.data.longitude, this.data.latitude, e.detail.value)
  },

  showShopList: function (e) {
  let that = this
  if (this.data.longitude == 0) {
    wx.getLocation({
      success: function (res) {
        that.getNearbyShop(res.longitude, res.latitude)
      },
      fail: function (e) {
        that.getNearbyShop(0, 0)
      }
    })
  } else {
    this.getNearbyShop(this.data.longitude, this.data.latitude)
  }
  },

  /**
   * 获取附近的门店
   * 根据名称查询门店
   */
  getNearbyShop: function (longitude, latitude,shopName) {
    //存储一下
    this.setData({
      longitude: longitude,
      latitude: latitude
    })
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    let that = this
    let goodsId = this.data.parentGoodsId
    let pn = that.data.shoppn    
    if (shopName == undefined){
      shopName = ''
    }
    //访问数据
    wx.request({
      url: nearbyShopUrl,
      data: {
        longitude: longitude,
        latitude: latitude,
        goodsId : goodsId,
        shopName: shopName,
        pn: pn
      },
      success: function (res) {
        wx.hideLoading();

        pn += 1
        let shops = that.data.shops.concat(res.data.data)
        that.setData({
          shoppn: pn,
          shops: shops,
          modalName: 'bottomModal'
        })
        console.info(that.data.shops)
        
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
  // 获取接龙团数据
  getSupplierActivityInfo() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: findPeopleGoods,
      data: {
        goodsId: that.data.goodsId,
        pn: that.data.pn,
        ps: 5
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
        console.log(res)
        // TODO 获取出错了
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取商品数据出错！',
            icon: 'none'
          });
        }
        //活动数据 
        if (res.data.data.total == that.data.activityOrdersList.length) {
          that.setData({
            hasMore: true
          })
        }

        let pnNext = that.data.pn + 1
        if(res.data.data.rows!=undefined){
          that.setData({
            orderNumber: res.data.data.total,
            pn: pnNext,
            activityOrdersList: that.data.activityOrdersList.concat(res.data.data.rows)
          })
        }
      }
    })
  },
  /**
   *  parentId: -1,
    //来源 1 首页 2 门店推广
    orderSource: 1
   */
  toShop : function(){
    let pages = getCurrentPages();
    console.info(pages.length)
    if (pages.length == 1){
      wx.switchTab({
        url: '../index/index'
      })      
    }else{
      wx.navigateBack({
        
      });
    }
    
  },
  selectShop(e){
    this.setData({
      shops: [],
      shoppn:0
    })
    //判断是关闭了地址选择还是选中了门店
    if (e.currentTarget.dataset.id){
      let shopId = e.currentTarget.dataset.id
      this.getShopById(shopId,this.data.parentGoodsId,false)
    }
    this.hideModal()
  },

  //有数--页面分享(事件page_share_app_message)
  shareAppMessage(){
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '预售商品页面',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d", 
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  getGoodsCanReceivedCouponById: function (){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: getGoodsCanReceivedCouponByIdUrl,
      data: {
        goodsId: that.data.goodsId,
        peopleId: app.globalData.userInfo.peopleId,
        shopId : that.data.shopId,
        pid : that.data.parentGoodsId
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
          couponList:couponList
        })
      }
    })
  },
  showlingquan:function(){
    this.getGoodsCanReceivedCouponById()
    this.setData({modalName:'couponModal'})
  },
  //领取优惠券
  getCoupon:function(e){
    if (app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    let _this = this;
    let _id = e.currentTarget.dataset.id;//券id
    let index = e.currentTarget.dataset.index
    let _user = app.globalData.userInfo;
    //开关
    if (!this.data.isGetKey){    
      return;  
    }else{
      _this.setData({
        isGetKey:false
      });
    }
    //params
    let _params = {
      pageKey: _this.data.pageKey,
      amount: '0',
      merchantId: '',
      payType: 2,
      peopleId: _user.peopleId,
      orderItems:[{
        number: 1,
        couponId: _id
      }]
    };
    if (_id || _id == 0 && _user){
      //show loading
      wx.showLoading({
        title: '领取优惠券中...',
        mask:true
      })
      request({
        url:'submitConponUrl',
        method:'post',
        data:_params,
        success:function(data){
          //hidde loading
          wx.hideLoading();
          console.log(data);
          if(data.statusCode == 200 && data.data){
            let _data = data.data;
            if (_data.flag){
              let _code = _data.code;
              if(_code == 2){
                //支付
              }else{
                wx.showToast({
                  title: '领券成功！',
                  icon: 'none'
                })
                let couponReceived = 'couponList['+index+'].received'
                _this.setData({
                  [couponReceived]: 1
                })
              }
            }else{
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

        error:function(error){
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

        final:function(){
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
  pageKeyFunc:function(){
    if (app.globalData.userInfo == undefined) return
    let _date = new Date().getTime(),
      _peopleId = app.globalData.userInfo.peopleId,
      _id = this.data.couponId;
      let _str = _peopleId +''+ _date +''+ _id;
    if (_peopleId || _peopleId == 0){
      this.setData({
        pageKey : _str
      });
    }else{
      console.log('用户不存在');
    }
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
  }
  
})