const app = getApp()
const getWaitPickupOrdersUrl = require('../../utils/config.js').httpConfig.getWaitPickupOrdersUrl
const finishSendUrl = require('../../utils/config.js').httpConfig.finishSendUrl
const checkPickCodeUrl = require('../../utils/config.js').httpConfig.checkPickCodeUrl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    pn: 0,
    bottomIsShow: false,
    orderTotal: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      pn: 0,
      //订单列表
      orderList: [],
      //订单总条数
      orderTotal: 0,
    })
    this.getWaitPickupOrders()
  },
  getWaitPickupOrders: function () {
    if (app.globalData.userInfo == null) return
    let data = {
      pn: this.data.pn,
      peopleId: app.globalData.userInfo.peopleId
    }
    wx.showLoading({
      title: '加载中...'
    })
    let that = this
    wx.request({
      url: getWaitPickupOrdersUrl,
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
  quhuo:function(e){
    console.log(e)
    let item = e.currentTarget.dataset.item
    let that = this
    wx.request({
      url: finishSendUrl,
      data: { orderId: item.id, shopId: item.shopId, userId: app.globalData.userInfo.peopleId, userName: app.globalData.userInfo.name},
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if(res.data.flag){
          wx.showToast({
            title: '取货成功',
            icon: 'none'
          });
          that.getWaitPickupOrders()
        }else{
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
        }
      }
    })
  },
  saoyisao:function(){
    wx.scanCode({
      success(res) {
        code = res.result
        let that = this
        wx.request({
          url: checkPickCodeUrl,
          data: { pickupCode: code,  userId: app.globalData.userInfo.peopleId, userName: app.globalData.userInfo.name },
          fail: function (err) {
            wx.hideLoading()
            wx.showToast({
              title: '网络异常！',
              icon: 'none'
            });
          },
          success: function (res) {
            wx.hideLoading();
            if (res.data.flag) {
              wx.showToast({
                title: '取货成功',
                icon: 'none'
              });
              that.getWaitPickupOrders()
            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'none'
              });
            }
          }
        })
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
    this.browseWxappPage();
  },
  orderBtmFun: function () {
    if (this.data.orderList.length >= this.data.orderTotal) {
      this.setData({
        bottomIsShow: true
      })
      return
    }
    let that = this;
    let pns = that.data.pn;
    pns++
    that.setData({ pn: pns })
    that.getWaitPickupOrders()
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
      "share_title": '团长捡货',
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
