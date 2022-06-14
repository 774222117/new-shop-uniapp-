const app = getApp()
//附近的门店，门店搜索URL
const nearbyShopUrl = require('../../utils/config.js').httpConfig.nearbyShopUrl;
//根据Id获取门店信息
const shopInfoUrl = require('../../utils/config.js').httpConfig.shopInfoUrl;
let shopcartUtil = require('../../utils/shopcart')
// component/bottomAction/index.js
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    cartTypeName : {
      type : String,
      value : ''
    },
    buyCount:{
      type: Number,
      value:0
    },
    item: Object,
    sumPrice:{
      type: Number,
      value: 0
    },
    sumProductPrice: {
      type: Number,
      value: 0
    },
    //购物车    
    shopCart :{
      type:Array,
      value : []
    },
    //商品列表
    goodsInfoList :{
      type:Array,
      value : []
    },
    //推荐人
    parentId : {
      type: Number,
      value: -1
    },
    //配送方式
    deliveryWay : {
      type: Number,
      value: 1
    },
    isDelivery:{
      type: Number,
      value: 0
    },
    supplierActivityId : {
      type : Number,
      value: 0
    },
    groupBuyActivityId:{
      type : Number,
      value: 0
    },
    saleActivityId : {
      type : Number,
      value: 0
    },
    //直播间Id
    roomId :{
      type : Number,
      value: 0
    },
    //离底部距离
    bottomVal: {
      type: String,
      value: "bt120"
    },
    //去结算是否显示门店选择 0 否  1是
    chooseShop:{
      type: Number,
      value: 0
    },    
    //经纬度
    longitude: {
      type: Number,
      value: 0
    },
    latitude: {
      type: Number,
      value: 0
    },
    shoppn: {
      type: Number,
      value: 0
    },
    shops: {
      type: Array,
      value: []
    },
    shopInfo: Object,
    //可使用门店，查询可选门店需要用到
    useShopCategory:{
      type: Number,
      value: -1
    },
    //支付成功页是否显示 分享弹框
    isShowShare: {
      type: Number,
      value: 0
    },
    //团长自提点id
    carrierId: {
      type: Number,
      value: 0
    }   
  },


  /**
   * 组件的初始数据
   */
  data: {
    modalName: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    showModal:function(e){
      if(this.data.modalName!=null){
        this.setData({
          modalName: null
        })
      }else{
        this.setData({
          modalName: e.currentTarget.dataset.target
        })
      }      
    },
    hideModal:function() {
      this.setData({
        modalName: null
      })
    },
    showShopModal:function(e){
      this.showShopList()
      this.setData({
        modalName: 'addressModal'
      })
    },
    /**
   * 根据id查找商品
   */
    getShopGoods :function(goodsId){
      let goodsInfo;
      this.data.goodsInfoList.forEach((item)=>{
        if (item.id == goodsId) {
          goodsInfo = item;
          return goodsInfo
        }
      })       
      return goodsInfo
    },

    /**
     * 修改购物车内商品数
     */
    modifyShopCartList : function(cart){
      this.data.shopCart.forEach((item)=>{
        if(item.goodsId == cart.goodsId){
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
   * 更新缓存
   * @param {购物车} shopCart 
   */
    updateShopCartCatch(shopCart) {
      shopcartUtil.setShopCart(shopCart,this.data.cartTypeName)
      shopcartUtil.caulTotal(this.data.cartTypeName)
      let cartTotal = shopcartUtil.getShopCartTotal(this.data.cartTypeName)
      this.setData({
        shopCart: shopCart,
        buyCount: cartTotal.buyCount,
        sumPrice: cartTotal.sumPrice,
        sumProductPrice: cartTotal.sumProductPrice
      })
    },
    /**
     * 购物车增加商品
     * @param {*} e 
     */
    cartAdd(e){
      let shopCart = this.data.shopCart
      //获取购物车商品
      let cart = e.currentTarget.dataset.cart
      if (cart.isGift) {
        wx.showToast({
          title: '赠品不能修改',
          icon: 'none'
        })
        return
      }
      //获取商品
      let goods = this.getShopGoods(cart.goodsId)
      if(goods == undefined) goods = cart
      let addTotal = goods.minBuyCount;
      if(addTotal == undefined || addTotal == null) addTotal = 1;
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
      if(goods)
        goods.buyCount = cart.total
      // //金额
      // cart.realPrice = cart.total * cart.price
      // cart.realPrice = parseFloat(cart.realPrice.toFixed(2));
      //原价金额
      // cart.realProductPrice = cart.total * cart.productPrice
      // cart.realProductPrice = parseFloat(cart.realProductPrice.toFixed(2));
      let index = shopcartUtil.shopCartIndex(cart.goodsId,shopCart)
      shopCart[index] = cart;
      if(goods)
        cart = shopcartUtil.caulCartRealPrice(goods,cart,shopCart)
      else
        cart = shopcartUtil.caulCartRealPrice(cart,cart,shopCart)
      
     

      this.modifyShopCartList(cart)            
      
            
      //更新缓存
      this.updateShopCartCatch(shopCart)
      var myEventDetail = { 'type': 'add','goods': goods } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('cartmodyfiy', myEventDetail, myEventOption)

      this.addToCart(cart,"append_to_cart");
    },

    /**
     * 购物车内减少商品
     */
    cartDel :function(e){
      let cart = e.currentTarget.dataset.cart
      if (cart.isGift){
        wx.showToast({
          title: '赠品不能修改',
          icon: 'none'
        })
        return
      }
      //获取商品
      let goods = this.getShopGoods(cart.goodsId)
      if(goods == undefined) goods = cart
      let shopCart = this.data.shopCart
      let addTotal = goods.minBuyCount;
      if(addTotal == undefined || addTotal == null) addTotal = 1;
      if(cart.total - addTotal < 1){
        let index = shopcartUtil.shopCartIndex(cart.goodsId,shopCart)                
        if(goods)
          goods.buyCount = 0
        shopCart.splice(index,1)
        shopcartUtil.caulCartRealPrice(goods,cart,shopCart)
      }else{
        //减少数量
        cart.total -= addTotal;
        if(cart.total < goods.minBuyCount){
          cart.total = addTotal
        }
        if(goods)
          goods.buyCount = cart.total
        // //金额
        // cart.realPrice = cart.total * cart.price
        // cart.realPrice = parseFloat(cart.realPrice.toFixed(2));
        //原价金额
        let index = shopcartUtil.shopCartIndex(cart.goodsId,shopCart)
        shopCart[index] = cart;
        if(goods)
          cart = shopcartUtil.caulCartRealPrice(goods,cart,shopCart)
        else
          cart = shopcartUtil.caulCartRealPrice(cart,cart,shopCart)
       
        this.modifyShopCartList(cart)
        
      }
      
      //更新缓存
      this.updateShopCartCatch(shopCart)
      var myEventDetail = { 'type':'del','goods': goods } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('cartmodyfiy', myEventDetail, myEventOption)

      this.addToCart(cart,"remove_from_cart");
    },

    /**
     * 清空购物车
     */
    clearShopCart: function () {
      this.setData({
        shopCart:[]
      })
      this.updateShopCartCatch([])
      console.log('res', this.data.shopCart)
      var myEventDetail = { 'type': 'clear', 'shopCart': this.data.shopCart } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('cartmodyfiy', myEventDetail, myEventOption)
    },
    toPayPageBefore :function(e){
      //判断是否有数据
      let shopCarts = shopcartUtil.getShopCart(this.data.cartTypeName)
      if (shopCarts.length == 0) {
        return
      }
      if(this.data.chooseShop==1){
        this.showShopModal()
      }else{
        this.toPayPage()
      }
    },
    /**
     * 跳转支付页面
     * @param {*} e 
     */
    toPayPage : function(e){
      //判断是否有数据
      let shopCarts = shopcartUtil.getShopCart(this.data.cartTypeName)
      if (shopCarts.length == 0) {
        return
      }
      // let value = JSON.stringify(this.data.shopCart);      
      //跳转到支付
      wx.navigateTo({
        url: '../shoppay/shoppay?cartTypeName=' + this.data.cartTypeName + '&source=1&deliveryWay=' + this.data.deliveryWay + 
             '&isDelivery=' + this.data.isDelivery +
             '&supplierActivityId=' + this.data.supplierActivityId + 
             '&saleActivityId=' + this.data.saleActivityId + 
             '&roomId=' + this.data.roomId + 
             '&isShowShare=' + this.data.isShowShare +
             '&groupBuyActivityId=' + this.data.groupBuyActivityId +
             '&carrierId=' + this.data.carrierId
      })
    },
    /**
  * 门店地址搜索
  * 
  */
    searchAddress(e) {
      this.setData({
        shoppn: 0,
        shops: []
      })
      this.getNearbyShop(this.data.longitude, this.data.latitude, e.detail.value)
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
          fail : function(res){
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
            modalName: 'addressModal'
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
     * 关闭地址选择
     * 关闭商品详情
     */
    selectShop(e) {
      this.setData({
        modalName: null
      })
      //是否选择门店
      let choose = false
      //点击地址选择
      if (e.currentTarget.dataset.target == 'addressModal') {
        this.setData({
          shops: [],
          shoppn: 0
        })
        //判断是关闭了地址选择还是选中了门店
        if (e.currentTarget.dataset.id) {
          let shopId = e.currentTarget.dataset.id
          this.getShopInfo(shopId)
          choose = true
          this.toPayPage()
        }
      }
      var myEventDetail = { 'shopInfo': this.data.shopInfo, choose: choose } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('chooseEvent', myEventDetail, myEventOption)
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
      console.log('组件', shopInfo)
      //2.写入缓存
      app.setShopInfo(shopInfo)
      app.globalData.data = { shopInfo: shopInfo }
    },
    // 地址滚动到底部触发
    addressBtmFun() {
      this.showShopList()
    },

     //有数--商品加购（事件add_to_cart）
    addToCart(goodsInfo,actionType) {
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
        "sku_num" : 1,
        "wx_user": {
          "app_id": "wxd45dffdd4692d69d", 
          "open_id": app.globalData.userInfo.wxMinOpenId
        }   
      })
    }

  }
})
