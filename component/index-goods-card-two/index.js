//购物车工具
let shopcartUtil = require('../../utils/shopcart')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsinfo: Object,
    isSingle: Boolean,
    //始终显示家加购物车，不判断商品预售
    isAlwaysShowAdd: {
      type: Boolean,
      value: false
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
    addnum: function (e) {
      var myEventDetail = { 'goods': e.currentTarget.dataset.goodsinfo } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('click', myEventDetail, myEventOption)
    },
    jumpToDetail: function (e) {
      var myEventDetail = { 'goods': e.currentTarget.dataset.goodsinfo, 'goodsPlatform': this.data.goodsPlatform } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('jump', myEventDetail, myEventOption)
    }
  }
})
