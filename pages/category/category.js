/**
 * 店铺主页
 */
const app = getApp()
//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
//附近的门店，门店搜索URL
const nearbyShopUrl = require('../../utils/config.js').httpConfig.nearbyShopUrl;
//店铺首页数据(暂时只有轮播)
const shopIndexUrl = require('../../utils/config.js').httpConfig.shopIndexUrl;
//店铺商品数据
const shopGoodsUrl = require('../../utils/config.js').httpConfig.shopGoodsUrl;
//商品分类
const categoryInfoUrl = require('../../utils/config.js').httpConfig.categoryInfoUrl;
//分类下的商品数据
const goodsCategoryInfoUrl = require('../../utils/config.js').httpConfig.goodsCategoryInfoUrl;
//单个商品数据
//商品详细信息
const goodsInfoUrl = require('../../utils/config.js').httpConfig.goodsInfoUrl;

//html解析模块
let htmlParse = require('../../component/wxParse/wxParse.js');
//获取大类URl
const findHeadCategoryUrl = require('../../utils/config.js').httpConfig.findHeadCategoryUrl
//获取小类类数据
const findMinCategoryUrl = require('../../utils/config.js').httpConfig.findMinCategoryUrl
//获取类别商品
const getShopCategoryGoodsUrl = require('../../utils/config.js').httpConfig.getShopCategoryGoodsUrl
let shopcartUtil = require('../../utils/shopcart')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    //推广人id
    parentId: -1,
    //门店列表,界面根据这个渲染
    shops: [],
    //类别商品数据
    categoryGoodsList: [],
    //商品大类数据
    categoryHeadList: [],
    categoryHeadFoot:[],
    categoryHeadFive:[],
    curHeadCategoryIndex: 0,
    //类别数据
    categoryList: [],
    //当前类别
    curCategoryIndex: 0,
    //轮播
    carousels: [],
    //购物车
    shopCart: [],
    //是否到底
    bottomIsShow: false,

    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    list: [],
    load: true,
    modalName: '',
    shopCarInfoData: {},
    // 商品分享高度值
    commoditySharingHeight: '636rpx',
    swiperHeight: 0,
    //商品列表
    goodsInfoList: [],
    //
    categoryTotal: 0,
    //页码
    pn: 0,
    //配送方式：0 全部 1 门店自提 2 配送到家，这个界面下单只是1，不会有其他  2020-03-16 append it
    deliveryWay: 0,
    shopInfo: {},
    cartShopTotal: {},
    cartNum: 0, //购物车商品数量
    roomId: 0,
    //传进来的headId参数
    optionHeadId:'',
    categoryId:'',
    showMoreGory:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.hideTabBar()
    //直播间Id
    if (options.roomId) {
      this.setData({
        roomId: options.roomId
      })
      app.setRoomId(options.roomId)
    }

    if (options.parentId != undefined) {
      app.setParentId(options.parentId)
    }

    // //判断登录
    // if (app.globalData.userInfo == null) {
    //   //app.data.path = '/category/categroy'
    //   wx.navigateTo({
    //     url: '../login/login'
    //   })
    //   return
    // }
    this.initShopCart();

    let that = this
    if (options.shopId != undefined) {
      //获取门店信息
      this.getShopById(options.shopId)
    } else {
      let shopId = app.globalData.shopInfo.id
      //获取门店信息
      this.getShopInfo(shopId)
    }


    wx.createSelectorQuery().select("#swiperBoxGoods").boundingClientRect(function (rect) {
      if (rect != null) {
        that.setData({
          swiperHeight: rect.height,
          commoditySharingHeight: rect.height + 'PX'
        })
      }
    }).exec()
    if (options.headId != undefined) {
      that.setData({
        optionHeadId: options.headId,
        
      })
    }
    if (options.categoryId != undefined) {
      that.setData({
        categoryId:options.categoryId
      })
      // that.categoryList.forEach(function (category, index) {
      //   if (category.id == options.categoryId) {
      //     that.setData({
      //       curCategoryIndex: index,
      //       MainCur: index,
      //       VerticalNavTop: (index - 1) * 50
      //     })
      //     this.getCategoryGoodsInfo(2)
      //     return
      //   }
      // })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.browseWxappPage();

    this.refreshCartNum();
    if (this.data.shopInfo.id != app.globalData.shopInfo.id) {
      let shopId = app.globalData.shopInfo.id
      //获取门店信息
      this.getShopInfo(shopId)
      return
    }
    if(app.globalData.headId!=null){
      let that = this
      that.setData({
        optionHeadId:app.globalData.headId
      })
      app.globalData.headId = null
      if(that.data.optionHeadId!=''){
        that.data.categoryHeadList.forEach(function (category, index) {
          if(category.middleId==that.data.optionHeadId){
            that.setData({
              curHeadCategoryIndex: index,
              scrollIntoItem:"scrollIntoViewId" + index,
            })
          }
        })
      }
      //获取二级分类
      that.getMixCategory(that.data.categoryHeadList[that.data.curHeadCategoryIndex])
    }

    let shopCart = shopcartUtil.getShopCart(this.data.cartTypeName)
    //item.buyCount = goods.buyCount
    let goodsInfoList = this.data.goodsInfoList
    let goodsLength = goodsInfoList.length
    let shopCartLength = shopCart.length
    for (let i = 0; i < goodsLength; i++) {
      let isExists = false
      for (let c = 0; c < shopCartLength; c++) {
        if (goodsInfoList[i].id == shopCart[c].goodsId) {
          goodsInfoList[i].buyCount = shopCart[c].total
          isExists = true
          break
        }
      }
      if (!isExists) {
        goodsInfoList[i].buyCount = 0
      }
    }

    this.setData({
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopCart,
      goodsInfoList: goodsInfoList
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
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
  onShareAppMessage: function (res) {
    let title = app.globalData.shopInfo.name;
    let shopId = this.data.shopInfo.id
    let url = '/pages/category/category?shopId=' + shopId
    if (app.globalData.userInfo) {
      url += '&parentId=' + app.globalData.userInfo.peopleId
    }
    let imageUrl = '';
    // if (this.data.shopCarInfoData.id) {
    //   url += "&goodsId=" + this.data.shopCarInfoData.id
    //   title = this.data.shopCarInfoData.title + '★售价:' + this.data.shopCarInfoData.marketPrice
    //   imageUrl = this.data.shopCarInfoData.thumb;
    // }

    this.shareAppMessage();
    
    return {
      title: title,
      path: url,
      imageUrl: imageUrl,
      success: (res) => {
        console.log("转发成功", res);
      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }
  },

  /******************************************** 自定义方法 ***************************************************** */

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
        //清除购物车
        if (app.globalData.shopInfo && app.globalData.shopInfo.id != shopId) {
          shopcartUtil.clearShopCartList()
        }
        app.setShopInfo(res.data.data)
        that.setShopInfo(res.data.data)
      }
    })
  },

  /**
   * 获取店铺信息
   *   获取缓存中的店铺信息（cacheShopId），
   *   获取参数中的店铺Id(shopId)
   * 逻辑，下面只会有一条生效：
   *   0.参数都为空，获取附近的门店
   *   1.参数为空缓存有数据，直接取缓存的数据
   *   2.参数不为空缓存为空，根据参数(shopId)获取店铺信息
   *   3.参数与缓存都不为空，比较两者是否相等
   *     3.1.如果相等获取缓存数据
   *     3.2.如果不等获取查询附近的门店
   */
  getShopInfo: function () {
    this.setShopInfo(app.globalData.shopInfo)
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
      curCategoryIndex: 0,
      categoryList: [],
      pn: 0,
      goodsInfoList: []
    })
    //获取类别
    //this.getCategoryInfo();
    this.getHeadCategory();
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
    this.setData({
      cartTypeName: cartTypeName
    })
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
  /**
   * 跳转详情页
   */
  jumpToDetail: function (e) {
    let that = this;
    let goodsId = e.currentTarget.dataset.goodsinfo.id
    let url = '../goods/goods?cartTypeName=' + this.data.cartTypeName + '&goodsId=' + goodsId
    if (e.currentTarget.dataset.goodsinfo.marketType == 1) {
      url = '../advancegoods/advancegoods?goodsId=' + goodsId
    }
    let cateogryInfo = this.data.categoryList[this.data.curCategoryIndex]

    wx.navigateTo({
      url: url,
    })

   //商品卡触发(事件trigger_sku_component)
    that.cardClick(e.currentTarget.dataset.goodsinfo);
  },

  /******************************************** 事件 ***************************************************** */

  carModifyEvent: function (e) {
    if (e.detail.type == 'clear') { //请购购车
      this.data.goodsInfoList.forEach((item) => {
        item.buyCount = 0
      })
      this.setData({
        goodsInfoList: this.data.goodsInfoList,
        cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName)
      })
    } else { //增加减少购物车内数量
      let goods = e.detail.goods
      let goodsInfoList = shopcartUtil.modifyGoodsList(this.data.goodsInfoList, goods)
      this.setData({
        goodsInfoList: goodsInfoList,
        cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName)
      })
    }
    this.refreshCartNum()
  },

  //input的输入值事件
  changeSearch(e) {
    console.log(e.detail.value)
    if (e.detail.value === "") return
    if (e.detail.value === "0") return
    let goods = e.currentTarget.dataset.goodsinfo
    let total = parseInt(e.detail.value);
    let pos = e.detail.cursor
    total = this.setShopCart(goods, total)
    return {
      value: total,
      cursor: pos
    }
  },

  /**
   * 加入购物车
   *   getShopGoodsInfo方法获得到的categoryGoodsList列表将商品信息（goodsInfo）绑定到控件上
   */
  addCart: function (e) {
    //判断登录
    if (app.globalData.userInfo == null) {
      wx.redirectTo({
        url: '../login/login'
      })
      return
    }
    let goods = e.currentTarget.dataset.goodsinfo
    goods = shopcartUtil.addShopCart(goods, this.data.cartTypeName)
    let goodsList = shopcartUtil.modifyGoodsList(this.data.goodsInfoList, goods);
    // 在商品详情中重新设置下数据
    this.setData({
      shopCarInfoData: goods,
      goodsInfoList: goodsList,
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
    })
    this.refreshCartNum()
    this.addToCart(goods,"append_to_cart");
  },

  /**
   * 减少购物车
   *   getShopGoodsInfo方法获得到的categoryGoodsList列表将商品信息（goodsInfo）绑定到控件上
   */
  delCart: function (e) {
    //判断登录
    if (app.globalData.userInfo == null) {
      wx.redirectTo({
        url: '../login/login'
      })
      return
    }
    let goods = e.currentTarget.dataset.goodsinfo
    goods = shopcartUtil.delShopCart(goods, this.data.cartTypeName)
    let goodsList = shopcartUtil.modifyGoodsList(this.data.goodsInfoList, goods);
    // 在商品详情中重新设置下数据
    this.setData({
      shopCarInfoData: goods,
      goodsInfoList: goodsList,
      cartShopTotal: shopcartUtil.getShopCartTotal(this.data.cartTypeName),
      shopCart: shopcartUtil.getShopCart(this.data.cartTypeName)
    })
    this.refreshCartNum()
    this.addToCart(goods,"remove_from_cart");
  },

  /**
   * 跳转到预售详情页
   */
  toAdvancePage: function (e) {
    let shopId = this.data.shopInfo.id
    let goodsId = e.currentTarget.dataset.goodsinfo.id
    let parentId = this.data.parentId
    //记录下这个商品
    this.setData({
      clickGoodsInfo: e.currentTarget.dataset.goodsinfo
    })

    let cateogryInfo = this.data.categoryList[this.data.curCategoryIndex]
    wx.navigateTo({
      url: '../shopadvance/shopadvance?shopId=' + shopId + '&goodsId=' + goodsId + '&parentId=' + parentId + '&isShopPage=1'
    })
  },

  /**
   * 促销分类点击选择
   */
  tabHeadSelect(e) {
    let curHeadIndex = e.currentTarget.dataset.id
    // console.log(curHeadIndex)
    this.setData({
      curHeadCategoryIndex: curHeadIndex,
      scrollIntoItem:"scrollIntoViewId" + curHeadIndex,
      pn: 0,
      categoryId:0,
      goodsInfoList:[],
      // showMoreGory:!this.data.showMoreGory
    })
    this.getMixCategory(this.data.categoryHeadList[this.data.curHeadCategoryIndex])
  },
  tabHeadSelect2(e) {
    let curHeadIndex = e.currentTarget.dataset.id
    this.setData({
      curHeadCategoryIndex: curHeadIndex,
      scrollIntoItem:"scrollIntoViewId" + curHeadIndex,
      pn: 0,
      categoryId:0,
      goodsInfoList:[],
      showMoreGory:!this.data.showMoreGory
    })
    this.getMixCategory(this.data.categoryHeadList[this.data.curHeadCategoryIndex])
  },
  // 点击展示更多选项
  showModal(){
    this.setData({showMoreGory:!this.data.showMoreGory})
  },
  /**
   * 商品列表滚动点击
   */
  tabSelect(e) {
    this.setData({
      curCategoryIndex: e.currentTarget.dataset.id,
      MainCur: e.currentTarget.dataset.id,
      VerticalNavTop: (e.currentTarget.dataset.id - 1) * 50,
      pn: 0,
      categoryTotal:0,
      bottomIsShow:false,
      goodsInfoList:[]
    })
    this.getCategoryGoodsData(this.data.categoryList[this.data.curCategoryIndex])
  },

  VerticalMain(e) {
    let that = this;
    let list = this.data.categoryGoodsList;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < list.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + i);
        view.fields({
          size: true
        }, data => {
          list[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          list[i].bottom = tabHeight;
        }).exec();
      }
      that.setData({
        load: false,
        list: list
      })
    }
    let scrollTop = e.detail.scrollTop + 20;
    for (let i = 0; i < list.length; i++) {
      if (scrollTop > list[i].top && scrollTop < list[i].bottom) {
        that.setData({
          VerticalNavTop: (i - 1) * 50,
          TabCur: i
        })
        return false
      }
    }
  },
  // 滚动到顶部事件
  upper() {
    this.getCategoryGoodsInfo(1)
    console.log('滚动到顶部事件')
  },
  // 滚动到底部事件
  lower() {
    if(this.data.bottomIsShow)return
    this.getCategoryGoodsData(this.data.categoryList[this.data.curCategoryIndex])
    console.log('滚动到底部事件')
  },



  /*****************************************************商品分页加载****************************************************** */
  /**
   * 获取商品分类
   * isChange:是否切换品类
   * !!!!!!!!!!!!!!!废弃
   */
  getCategoryInfo() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this

    let shopId = this.data.shopInfo.id

    //2.加载商品分类与商品详细数据
    wx.request({
      url: categoryInfoUrl,
      data: {
        shopId: shopId
      },

      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取商品分类数据网络异常！',
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
          that.setData({
            buyCount: 0,
            sumPrice: 0,
            sumProductPrice: 0,
            categoryList: [],
            curCategoryIndex: 0,
            pn: 0
          })
          return
        }

        let data = res.data.data
        if (!data) return
        if (data.size == 0) return

        that.setData({
          categoryList: res.data.data,
          curCategoryIndex: 0
        })
        //获取商品
        that.getCategoryGoodsInfo(0)
      }
    })
  },

  /**
   * 获取商品大类数据
   */
  getHeadCategory() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this

    let shopId = this.data.shopInfo.id

    //2.加载商品分类与商品详细数据
    wx.request({
      url: findHeadCategoryUrl,
      data: {
        shopId: shopId
      },

      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取商品大类数据网络异常！',
          icon: 'none'
        });
      },

      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取大类数据出错！',
            icon: 'none'
          });
          that.setData({
            buyCount: 0,
            sumPrice: 0,
            sumProductPrice: 0,
            categoryHeadList: [],
            curHeadCategoryIndex: {},
            categoryList: [],
            curCategoryIndex: 0,
            pn: 0
          })
          return
        }

        let data = res.data.data
        if (!data) return
        if (data.size == 0) return


        that.setData({
          categoryHeadList: res.data.data,
          curHeadCategoryIndex: 0,
          categoryHeadFive:res.data.data.slice(0,5),
          categoryHeadFoot:res.data.data.slice(5,res.data.data.length),
        })
        if(that.optionHeadId!=''){
          that.data.categoryHeadList.forEach(function (category, index) {
            if(category.middleId==that.data.optionHeadId){
              that.setData({
                curHeadCategoryIndex: index,
                scrollIntoItem:"scrollIntoViewId" + index,
              })
            }
          })
        }
        //获取二级分类
        that.getMixCategory(that.data.categoryHeadList[that.data.curHeadCategoryIndex])
      }
    })
  },

  /**
   * 获取商品二级分类
   * @param {*} categoryInfo 
   */
  getMixCategory(categoryInfo) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this

    let shopId = this.data.shopInfo.id

    let headId= categoryInfo.headId
    if(categoryInfo.type==1){
      headId = categoryInfo.middleId
    }
    //2.加载商品分类与商品详细数据
    wx.request({
      url: findMinCategoryUrl,
      data: {
        shopId: shopId,
        type: categoryInfo.type,
        headId: headId
      },

      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取商品二级分类数据网络异常！',
          icon: 'none'
        });
      },

      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取二级分类数据出错！',
            icon: 'none'
          });
          that.setData({
            buyCount: 0,
            sumPrice: 0,
            sumProductPrice: 0,
            categoryList: [],
            curCategoryIndex: 0,
            pn: 0
          })
          return
        }

        let data = res.data.data
        if (!data) return
        if (data.size == 0) return

        that.setData({
          categoryList: res.data.data,
          curCategoryIndex: 0
        })
        if(that.data.categoryId!=''){
          that.data.categoryList.forEach(function (category, index) {
            if(category.middleId==that.data.categoryId){
              that.setData({
                curCategoryIndex: index,
                MainCur:"main-" + index,
              })
            }
          })
        }
        that.getCategoryGoodsData(that.data.categoryList[that.data.curCategoryIndex])
      }
    })
  },


  /**
   * 获取类别下商品数据
   * @param {*} categoryInfo 
   */
  getCategoryGoodsData(categoryInfo) {
    if(categoryInfo == undefined){
      return
    }
    if (this.data.isLoadGoods) return

    this.setData({
      isLoadGoods: true
    })
    let that = this
    let shopId = this.data.shopInfo.id
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let peopleId = -1;
    if (app.globalData.userInfo != null) {
      peopleId = app.globalData.userInfo.peopleId
    }
    let shopCategory = categoryInfo.headId
    if(categoryInfo.type==1){
      shopCategory = categoryInfo.middleId
    }
    wx.request({
      url: getShopCategoryGoodsUrl,
      data: {
        peopleId: peopleId,
        shopId: shopId,
        shopCategory: shopCategory,
        type: categoryInfo.type,
        pn: that.data.pn
      },

      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取商品数据网络异常！',
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

        let goodsInfoList = that.data.goodsInfoList
        res.data.data.rows.forEach((item) => {
          goodsInfoList.push(item)
        })
        that.setData({
          bottomIsShow: false
        })
        if (res.data.data.rows.length == 0 && that.data.categoryTotal > goodsInfoList.length) {
          that.setData({            
            categoryTotal: goodsInfoList.length,
            bottomIsShow: true,
            isLoadGoods: false
          })
          if(res.data.data.total == 0){
            that.setData({            
              goodsInfoList:[]
            })
          }
          return
        }

        that.setData({
          goodsInfoList: goodsInfoList,
          pn: that.data.pn + 1,
          //类别商品数据
          categoryTotal: res.data.data.total
        })
        //写入已购数据  
        that.initShopCart();
        that.setData({
          isLoadGoods: false
        })
        if (that.data.goodsInfoList.length >= res.data.data.total) {
          that.setData({
            bottomIsShow: true
          })
        }
        if (res.data.data.total < 5) {
          that.setData({
            bottomIsShow: true
          })
        }

        //商品卡曝光(事件expose_sku_component)
        that.observer();
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
   * 获取商品数据
   * loadType : 0 下拉 1 上拉 2 点击
   */
  getCategoryGoodsInfo(loadType) {
    if (this.data.isLoadGoods) return

    this.setData({
      isLoadGoods: true
    })
    let that = this
    let shopId = this.data.shopInfo.id

    //判断是否切换类别
    if (loadType == 0) {
      if (this.data.categoryTotal > 0 && this.data.goodsInfoList.length >= this.data.categoryTotal) {
        //判断是否到最底部
        if (this.data.curCategoryIndex == this.data.categoryList.length - 1) {
          that.setData({
            isLoadGoods: false
          })
          return
        }
        this.setData({
          pn: 0,
          goodsInfoList: [],
          curCategoryIndex: this.data.curCategoryIndex + 1
        })
      }
    } else if (loadType == 1) {
      if (this.data.curCategoryIndex == 0) {
        that.setData({
          isLoadGoods: false
        })
        return
      }
      this.setData({
        pn: 0,
        goodsInfoList: [],
        curCategoryIndex: this.data.curCategoryIndex - 1
      })
    } else {
      this.setData({
        pn: 0,
        goodsInfoList: []
      })
    }
    let cateogryInfo = this.data.categoryList[this.data.curCategoryIndex]
    this.setData({
      bottomIsShow: false
    })

    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let peopleId = -1;
    if (app.globalData.userInfo != null) {
      peopleId = app.globalData.userInfo.peopleId
    }
    wx.request({
      url: goodsCategoryInfoUrl,
      data: {
        peopleId: peopleId,
        shopId: shopId,
        categoryId: cateogryInfo.middleId,
        categoryType: cateogryInfo.type,
        pn: that.data.pn
      },

      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取商品数据网络异常！',
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

        let goodsInfoList = that.data.goodsInfoList
        res.data.data.rows.forEach((item) => {
          goodsInfoList.push(item)
        })

        if (res.data.data.rows.length == 0 && that.data.categoryTotal > goodsInfoList.length) {
          that.setData({
            categoryTotal: goodsInfoList.length,
            bottomIsShow: true,
            isLoadGoods: false
          })
          return
        }
        that.setData({
          goodsInfoList: goodsInfoList,
          pn: that.data.pn + 1,
          //类别商品数据
          categoryTotal: res.data.data.total
        })

        //写入已购数据  
        that.initShopCart();
        that.setData({
          isLoadGoods: false
        })
        if (that.data.goodsInfoList.length >= res.data.data.total && that.data.goodsInfoList.length > 4) {
          that.setData({
            bottomIsShow: true
          })
        }
        if (res.data.data.total < 5) {
          that.setData({
            bottomIsShow: true
          })
        }

      }
    })
  },
  toShopOrder: function () {
    wx.hideLoading()
    wx.switchTab({
      url: '../shoporder/shoporder',
      fail: function (e) {
      },
      success: function (e) {
      }
    })
  },
  loadNextCategoryGoods: function () {
    if (this.data.categoryList.length <= this.data.curCategoryIndex) return
    let nextIndex = this.data.curCategoryIndex + 1
    this.setData({
      curCategoryIndex: nextIndex,
      MainCur: nextIndex,
      VerticalNavTop: (nextIndex - 1) * 50,
      pn: 0,
      goodsInfoList:[]
    })
    this.getCategoryGoodsData(this.data.categoryList[nextIndex])
  },

  //有数--商品卡曝光
  observer(){
    let that = this;
    if (that._observer){
      that._observer.disconnect();
    }
    that._observer = wx.createIntersectionObserver(that, {observeAll: true })
    that._observer.relativeToViewport({bottom: -115,top: -87 })
    .observe('.topTitle', (res) => {
      const { index } = res.dataset;
      let resultData = res.dataset.goodsinfo;
      app.TXYouShu.track('expose_sku_component',{
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
  addToCart(goodsInfo,actionType) {
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
      "sku_num" : 1,
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
      "share_title": '店铺分类页',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d", 
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
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