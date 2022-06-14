const app= getApp()
let request = require('../../utils/request.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentData: ""
  },
  /**
     * 去详情页
     */
  goToCouponDetail(e) {
    return
  },
  // 请求数据方法
  getCouponLists(that, url, shopId) {
    wx.showLoading({//开始加载loding
      title: '加载中',
      mask: true
    })
    request({
      url: url,
      data: { shopId: shopId},
      method: 'Get',
      success: function (res) {
        if (res.data.data) {
          that.setData({
            currentData: res.data.data //数据
          })
          wx.hideLoading()//关闭loding
        } else {
          console.log("数据为空")
          wx.hideLoading()//关闭loding
        }
      },
      fail: function (err) {
        console.log(err);
        wx.hideLoading()//关闭loding
      }
    })
  },

  //去领取
  immediateGet: function (e) {
    if (app.globalData.userInfo == null) {
      wx.navigateTo({
        url: '../login/login',
        complete() { wx.hideLoading() }//关闭loding
      })
      return
    }else{
      let id = e.target.dataset.infodata.id;//优惠券的ID，（marketing_coupons表的id）
      wx.navigateTo({
        url: '../coupondetail/coupondetail?id='+id,
        complete() { wx.hideLoading() }//关闭loding
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo == null) {
      wx.navigateTo({
        url: '../login/login',
        complete() { wx.hideLoading() }//关闭loding
      })
      return
    }else{
      let shopId = -1;
      if (app.globalData.shopInfo != undefined) {
        shopId = app.globalData.shopInfo.id
      }else{
        wx.navigateBack({
          delta: 0,
        })
      }
      this.getCouponLists(this, "couponListsUrl", shopId);
    }
  },

  complete: function () {
    wx.hideToast(); //隐藏Toast
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
  onShareAppMessage: function () {
    this.shareAppMessage()
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

  //有数--页面分享(事件page_share_app_message)
  shareAppMessage(){
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '优惠券列表',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d", 
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  }
  


})