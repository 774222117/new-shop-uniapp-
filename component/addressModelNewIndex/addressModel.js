const app = getApp()
//附近的门店，门店搜索URL
const nearbyShopUrl = require('../../utils/config.js').httpConfig.nearbyShopUrl;
//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
let shopcartUtil = require('../../utils/shopcart')
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    bgColor:{
      type:String,
      value: "#E72E24"
    },
    bgImg:{
      type:String,
      value:""
    },
    fontColor: {
      type: String,
      value: "#fff"
    },
    iconColor: {
      type: String,
      value: "#fff"
    },
    modalName:String,
    //经纬度
    longitude: {
      type:Number,
      value:0
    },
    latitude: {
      type: Number,
      value: 0
    },
    shoppn: {
      type: Number,
      value: 0
    },
    shops:{
      type: Array,
      value:[] 
    },
    shopInfo: Object,
    isIndex:{
      type: Boolean,
      value: true
    }, 
    //可使用门店，查询可选门店需要用到
    useShopCategory: {
      type: Number,
      value: -1
    },
    //去结算是否显示门店选择 0 否  1是
    chooseShop: {
      type: Number,
      value: 0
    }, 
    
  },
  
  /**
   * 组件的初始数据
   */
  data: {
    currentTab:0,//默认地址选中全部
    searchShopName : '',
    tabsList: [
      {
        title: '全部',
        value : 0
      },
      {
        title: '大卖场',
        value : 1
      },
      {
        title: '标超',
        value : 21
      },
      {
        title: '便利',
        value : 51
      }
    ], 
    defaultBgImg:'https://sourced.sgsugou.com/new-shop/image/indextitlebg.png'
  },
  lifetimes: {
    attached: function () {
      this.setData({
        navH: app.globalData.navHeight,
        navTop: app.globalData.navTop,
        navHeight: app.globalData.navHeight
      })
    }
  },
  attached: function(){
    this.setData({
      shopInfo: app.globalData.shopInfo
    })
  },
  /**
   * 组件的方法列表
   */
  methods: {
    
    showShopListModal: function(){
      this.showShopList()
      this.setData({
        modalName: 'bottomModal'
      })
    },

    /**
   * 门店选择
   * 购物车
   */
    showModal(e) {
      //地址列表
      if (e.currentTarget.dataset.target == 'bottomModal') {
        this.showShopList()
      }
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    },

    /**
     * 关闭地址选择
     * 关闭商品详情
     */
    hideModal(e) {
      this.setData({
        modalName: null
      })
      //是否选择门店
      let choose = false
      //点击地址选择
      if (e.currentTarget.dataset.target == 'bottomModal') {
        this.setData({
          shops: [],
          shoppn: 0
        })
        //判断是关闭了地址选择还是选中了门店
        if (e.currentTarget.dataset.id) {
          let shopId = e.currentTarget.dataset.id
          this.getShopInfo(shopId)
          choose = true
          //如果选择的店铺和原来的店铺不一样，则清空购物车
          if(shopId!=app.globalData.shopInfo.id){
            shopcartUtil.clearShopCartList()            
          }
        }
      }
      var myEventDetail = { 'shopInfo': this.data.shopInfo, choose: choose} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('chooseEvent', myEventDetail, myEventOption)
    },
    /**
   * 显示门店列表
   *   点击上方门店时触发，获取shops列表
   */
    showShopList: function (e) {
      let that = this
      if (this.data.longitude == 0) {
        wx.getLocation({
          success: function (res) {
            that.getNearbyShop(res.longitude, res.latitude)
          },
          fail:function(res){
            that.getNearbyShop(118, 31)
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
    getNearbyShop: function (longitude, latitude, shopName) {
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
      longitude = longitude
      latitude = latitude
      let pn = that.data.shoppn
      if (shopName == undefined) {
        shopName = ''
      }
      
      //访问数据
      wx.request({
        url: nearbyShopUrl,
        data: {
          longitude: longitude,
          latitude: latitude,
          shopName: shopName,
          shopFormId : this.data.currentTab,
          classId: that.data.useShopCategory,
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
   * 门店地址搜索
   * 
   */
    searchAddress(e) {
      this.setData({
        shoppn: 0,
        shops: [],
        searchShopName : e.detail.value
      })
      this.getNearbyShop(this.data.longitude, this.data.latitude, e.detail.value)
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
    getShopInfo: function (shopId) {
      let that = this
      //获取缓存中的门店信息
      let cacheShopId = undefined
      if (app.globalData.shopInfo != null)
        cacheShopId = app.globalData.shopInfo.id
      //0.都为空，获取附近的门店
      if (!shopId && !cacheShopId) {
        if (this.data.longitude == 0) {
          wx.getLocation({
            success: function (res) {
              that.getNearbyShop(res.longitude, res.latitude)
            },
          })
        } else {
          that.getNearbyShop(this.data.longitude, this.data.latitude)
        }
      }
      //1.参数为空缓存有数据，直接取缓存的数据
      else if (!shopId && cacheShopId) {
        this.setShopInfo(app.globalData.shopInfo)
      }
      //2.参数不为空缓存为空，根据参数(shopId)获取店铺信息
      else if (shopId) {
        //如果参数等于缓存，直接去缓存
        if (shopId == cacheShopId) {
          this.setShopInfo(app.globalData.shopInfo)
        } else {
          this.getShopById(shopId)
        }

      }
      //3.2.如果不等获取查询附近的门店
      else {
        if (this.data.longitude == 0) {
          wx.getLocation({
            success: function (res) {
              that.getNearbyShop(res.longitude, res.latitude)
            },
          })
        } else {
          that.getNearbyShop(this.data.longitude, this.data.latitude)
        }
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
          that.setShopInfo(res.data.data)
          let eventInfo = {
            "shop_ID": shopId,
            "shop_name": res.data.data.name
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
      this.setData({ shopInfo: shopInfo })
      console.log('组件',shopInfo)
      //2.写入缓存
      // app.setShopInfo(shopInfo)
      app.globalData.data = { shopInfo: shopInfo}
    },
    // 地址滚动到底部触发
    addressBtmFun() {
      this.showShopList()
    },
    toBusinessInfoPage:function(){
      wx.navigateTo({
        url: '../shopInfo/shopInfo?id='+app.globalData.shopInfo.id,
      })
    },
    //标签点击事 0 全部    1 大卖场   21 标超   51 便利
    changeTab(e){
      this.setData({
        shoppn : 0,
        shops: [],
        currentTab: e.currentTarget.dataset.item.value
      })

      let that = this
      if (this.data.longitude == 0) {
        wx.getLocation({
          success: function (res) {
            that.getNearbyShop(res.longitude, res.latitude,this.data.searchShopName)
          },
          fail:function(res){
            that.getNearbyShop(118, 31,undefined)
          }
        })
      } else {
        this.getNearbyShop(this.data.longitude, this.data.latitude,this.data.searchShopName)
      }
    }
  }
})
