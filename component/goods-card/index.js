let shopcartUtil = require('../../utils/shopcart')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsinfo: Object,
    /*是否显示佣金*/
    showRate:{
      type: Boolean,
      value:false
    },
    deliveryWay : {
      type : Number,
      value : 1
    },
    isDelivery:{
      type: Number,
      value: 0
    },
    cartTypeName : {
      type:String,
      value :"OTO"
    },
    //供应商活动id
    activityId:{
      type:String,
      value:-1
    },
    //分销人id
    parentId:{
      type:Number,
      value:-1
    },
    shopId:{
      type:Number,
      value:-1
    },
    //是否社区购商品，社区购商品无需判断marketingtype，全都选是加减数量
    isCommunity:{
      type:Boolean,
      value:false
    },
    //支付成功页是否显示 分享弹框
    isShowShare:{
      type:Number,
      value:0
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    addCart: function (e) {
      let goods = e.currentTarget.dataset.goodsinfo
      goods = shopcartUtil.addShopCart(goods, this.data.cartTypeName)
      var myEventDetail = { 'type': 'add', 'goods': goods } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('edit', myEventDetail, myEventOption)
      // 在商品中重新设置下数据
      this.setData({
        goodsinfo: goods,
      })
    },

    /**
     * 减少购物车
     *   getShopGoodsInfo方法获得到的categoryGoodsList列表将商品信息（goodsInfo）绑定到控件上
     */
    delCart: function (e) {
      let goods = e.currentTarget.dataset.goodsinfo
      goods = shopcartUtil.delShopCart(goods, this.data.cartTypeName)
      // 在商品详情中重新设置下数据
      this.setData({
        goodsinfo: goods,
      })
      var myEventDetail = { 'type': 'del', 'goods': goods } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('edit', myEventDetail, myEventOption)
    },
    jumpToDetail: function (e) {
      console.log(e);
      let goodsId = e.currentTarget.dataset.goodsinfo.id
      let navUrl = '../goods/goods?cartTypeName=' + this.data.cartTypeName + '&goodsId=' + goodsId + 
         "&deliveryWay=" + this.data.deliveryWay + 
         '&isDelivery=' + this.data.isDelivery + 
         '&supplierActivityId=' + this.data.activityId + 
         '&parentId=' + this.data.parentId + 
         '&shopId=' + this.data.shopId + '&isShowShare=' + this.data.isShowShare
      // && this.data.activityId == -1
      if (e.currentTarget.dataset.goodsinfo.marketType == 1) {
        navUrl = '../advancegoods/advancegoods?goodsId=' + goodsId + '&isShowShare=' + this.data.isShowShare
      }
      wx.navigateTo({
        url: navUrl
      })
    }
  }
})
