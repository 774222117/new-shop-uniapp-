// component/index-goods-card/index.js
const app=getApp()
let shopcartUtil = require('../../utils/shopcart')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    goodsinfo: Object,
    //1 社群购 2 社区购
    goodsPlatform : String,
    //社区购ID
    activityId : String
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
    addnum:function(e){
      var myEventDetail = { 'goods': e.currentTarget.dataset.goodsinfo } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('click', myEventDetail, myEventOption)
    },
    jumpToDetail:function(e){
      var myEventDetail = { 'goods': e.currentTarget.dataset.goodsinfo, 'goodsPlatform': this.data.goodsPlatform, 'activityId': this.data.activityId } // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('jump', myEventDetail, myEventOption)
    }
  }
})
