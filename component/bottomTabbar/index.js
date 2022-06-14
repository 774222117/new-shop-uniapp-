// component/bottomTabbar/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentIdx: {
      type: Number,
      value: 0,
      observer: function (t) {
        if (t) {
          let tabbar = this.data.tabbar;
          for (let i in tabbar.list) {
            tabbar.list[i].selected = false;
            (i == t) && (tabbar.list[i].selected = true);
          }
          this.setData({ tabbar })
        }
      }
    },
    cartNum: {
      type: Number,
      value: 0
    },
    tabbarRefresh: {
      type: Boolean,
      value: false,
      observer: function (t) {
        if (t) this.getTabbar();
      }
    }
  },

  attached() {
    let model = wx.getSystemInfoSync().model;
    let isIpx = model.indexOf("iPhone X") > -1 || model.indexOf("unknown<iPhone") > -1 || model.indexOf("iPhone Max") > -1 || model.indexOf("iPhone 11") > -1|| model.indexOf("iPhone 12") > -1;
    isIpx && this.setData({ isIpx: true });    
  },

  /**
   * 组件的初始数据
   */
  data: {
    isIpx: false,
    tabbar: {
      "backgroundColor": "#fff",
      "color": "#707070",
      "selectedColor": "#ff5344",
      "list": [
        {
          "pagePath": "/pages/index/index",
          "text": "首页",
          "iconPath": "https://sourced.sgsugou.com/new-shop/image/indexIconDefault.png",
          "selectedIconPath": "https://sourced.sgsugou.com/new-shop/image/indexIconSelect.png",
          "selected": true
        },
        {
          "pagePath": "/pages/category/category",
          "text": "分类",
          "iconPath": "https://sourced.sgsugou.com/new-shop/image/categoryDefault.png",
          "selectedIconPath": "https://sourced.sgsugou.com/new-shop/image/categorySelect.png",
          "selected": false
        },
        {
          "pagePath": "/pages/shoppingCar/shoppingCar",
          "text": "购物车",
          "iconPath": "https://sourced.sgsugou.com/new-shop/image/shopDefault.png",
          "selectedIconPath": "https://sourced.sgsugou.com/new-shop/image/shopSelect.png",
          "selected": false
        },
        // {
        //   "pagePath": "/pages/groupbuy/groupbuy",
        //   "text": "小区go",
        //   "iconPath": "https://sourced.sgsugou.com/new-shop/image/xiaoqugodefault.png",
        //   "selectedIconPath": "https://sourced.sgsugou.com/new-shop/image/xiaoqugoActivity.png",
        //   "selected": false
        // },
        {
          "pagePath": "/pages/live/live",
          "text": "直播",
          "iconPath": "/image/liveDefault.png",
          "selectedIconPath": "/image/liveSelect.png",
          "selected": false
        },
        {
          "pagePath": "/pages/myIndex/myIndex",
          "text": "我的",
          "iconPath": "https://sourced.sgsugou.com/new-shop/image/myIconDefault.png",
          "selectedIconPath": "https://sourced.sgsugou.com/new-shop/image/myIconSelect.png",
          "selected": false
        }
      ]
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    goWeapp: function (e) {
      // 跳转小程序
      let url = e.currentTarget.dataset.url
      if (url.indexOf('pages/groupbuy/groupbuy') != -1) {
        wx.navigateTo({ url })
      } else{
        wx.switchTab({ url })
      }
    }
  }
})
