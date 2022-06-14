// components/navbar/index.js
const App = getApp();

Component({
  options: {
    addGlobalClass: true,
  },
  /**
   * 组件的属性列表
   */
  properties: {
    pageName: String,
    bgColor:String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },
  lifetimes: {
    attached: function () {
      this.setData({
        navH: App.globalData.navHeight,
        navTop: App.globalData.navTop,
        navHeight: App.globalData.navHeight
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    gotoSearch:function(){
      wx.navigateTo({
        url: '/pages/searchpage/searchpage',
      })
    },
    sancode:function(){
      var myEventDetail = { 'type': 'sanup'} // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('sanup', myEventDetail, myEventOption)
    }
  }
})