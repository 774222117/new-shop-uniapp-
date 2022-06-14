const app = getApp()
const sharePeopleOrderInfoUrl = require('../../utils/config.js').httpConfig.sharePeopleOrderInfoUrl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab:0,
    tabsList: [
      {
        title: '全部订单'
      },
      // {
      //   title: '可提现'
      // }
    ],
    orderList: [],
    pn:0,
    bottomIsShow:false,
    orderTotal:0,
    oldIsOut:-1,
    id:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id
    })
  },
  changeTab: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.index,
      pn: 0,
      //订单列表
      orderList: [],
      //订单总条数
      orderTotal: 0,
    })
    this.getSharePeopleOrders(this.data.currentTab)
  },
  getSharePeopleOrders: function (isOut) {
    if (app.globalData.userInfo == null) return
    //切换过状态,页码设为零
    if (this.data.oldIsOut != isOut) {
      this.data.orderList = []
      this.setData({
        pn: 0,
        orderTotal: 0
      })
    }
    let data = {
      pn: this.data.pn,
      groupBuyActivityId:this.data.id,
      peopleId: app.globalData.userInfo.peopleId
    }
    isOut = isOut == 1 ? 1 : ""
    data.isOut = isOut
    wx.showLoading({
      title: '加载中...'
    })
    let that = this
    wx.request({
      url: sharePeopleOrderInfoUrl,
      data: data,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },

      success: function (res) {
        wx.hideLoading();
        if (!res.data.rows) {
          wx.showToast({
            title: res.data.message || '查询订单出错！',
            icon: 'none'
          });
          return
        }
        if (res.data.rows.lenght == 0) {
          that.setData({ bottomIsShow: true })
        } else {
          that.setData({ bottomIsShow: false })
          let orderList = that.data.orderList.concat(res.data.rows)
          //页面加+1
          that.setData({
            bottomIsShow: false,
            oldIsOut: isOut,
            //订单数据
            orderList: orderList,
            //订单条数
            orderTotal: res.data.total
          })
        }
        console.info(that.data.orderList)
      }
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
    this.setData({
      pn: 0,
      //订单列表
      orderList: [],
      //订单总条数
      orderTotal: 0,
    })
    this.getSharePeopleOrders()

    this.browseWxappPage()
  },
  orderBtmFun: function () {
    if (this.data.orderList.length >= this.data.orderTotal) {
      this.setData({
        bottomIsShow:true
      })
      return
    }
    let that = this;
    let pns = that.data.pn;
    pns++
    that.setData({ pn: pns })
    that.getSharePeopleOrders(this.data.currentTab)
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
    this.orderBtmFun()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '团长订单',
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
  },

})
