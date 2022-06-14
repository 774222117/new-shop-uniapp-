// pages/paymentSuccess/paymentSuccess.js
const app = getApp()
//订单送券urql
const getCouponSetInfoUrl = require('../../utils/config.js').httpConfig.getCouponSetInfoUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowShare : 0,
    //赠送优惠券活动ID
    couponSetId: 0,
    //订单号
    orderId: 0,
    couponSetInfo:null,
    popModelIsShow:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.isShowShare){
      if(options.isShowShare == 1){
        this.setData({ modalName: 'paymentSuccess' })
      }
      this.setData({isShowShare : options.isShowShare})
    }
    if (options.couponSetId && options.couponSetId > 0) {
      this.setData({
        couponSetId: options.couponSetId
      })
    }
    if (options.orderId != undefined) {
      this.setData({
        orderId: options.orderId
      })
    }
    if(this.data.couponSetId>0&&this.data.orderId>0){
      this.getCouponSetInfo()
    }
  },
  // 完成按钮
  successBtn(){
    let url = '../myIndex/myIndex'
    app.globalData.toOrder = 2
    wx.switchTab({
      url: url,
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.leaveWxappPage();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    this.leaveWxappPage();
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
  onShareAppMessage: function (options) {
    if(options.from == "menu"){
      return
    }
    if(this.data.isShowShare == 0){
      return
    }
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2]
    let title = ''
    let shopId = app.globalData.shopInfo.id
    let parentId = app.globalData.userInfo.peopleId
    let urlPath = ''
    if (prevPage.data.activityInfo == undefined){
      prevPage = pages[pages.length - 3]
    }
    let activityInfo = prevPage.data.activityInfo
    title = activityInfo.title
    urlPath = '/pages/jielong/jielong?shopId=' + shopId +
      '&activityId=' + activityInfo.id + '&parentId=' + parentId + '&isShowReceiveCoupon=1'
    
    let imgUrl = 'https://source.ckldzsw.com/coupon/share/coupon.png'

    this.shareAppMessage();

    return {
      title: title,
      path: urlPath,
      imageUrl: imgUrl,
      complete: (res) => {
        wx.redirectTo({
          url: '../shoporder/shoporder?tab=2',
        })
　　　 }
    }
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  /**
   * 获取订单送券详细信息
   * @param {} couponSetId 
   */
  getCouponSetInfo() {
    this.setData({
      couponSetId: this.data.couponSetId,
      orderId: this.data.orderId
    })

    let that = this
    wx.request({
      url: getCouponSetInfoUrl,
      data: {
        couponSetId: this.data.couponSetId,
        orderId: this.data.orderId,
        peopleId:app.globalData.userInfo.peopleId
      },
      fail: function(err) {
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },

      success: function(res) {
        if (!res.data.flag) {
          // wx.showToast({
          //   title: '获取订单券信息出错！',
          //   icon: 'none'
          // });
          return
        }
        //赋值 couponSetInfo.displayImg 展示图
        if (res.data.data) {
          that.setData({
            couponSetInfo: res.data.data,
            popModelIsShow: true
          })
        }
      }
    })
  },
  /**
   *  弹窗点击事件
   */
  toCouponSet() {
    let couponSetInfo = this.data.couponSetInfo;
    let orderId = this.data.orderId
    this.setData({
      popModelIsShow: false
    })
    //售卡，跳转卡界面
    if (couponSetInfo.giveType == 2) {
      wx.redirectTo({
        url: '../mycardbag/mycardbag?ids=' + couponSetInfo.giveCoupons,
      })
    }
    //老虎机抽奖
    else if (couponSetInfo.giveType == 3) {
      wx.redirectTo({
        url: '../machine/index?activeId=' + couponSetInfo.giveCoupons + '&orderId=' + orderId,
      })
    }
    //跳转优惠券列表
    else {
      wx.redirectTo({
        url: '../mycoupon/mycoupon'
      })
    }

  },
  //关闭弹窗
  popCloseBtn() {
    this.setData({
      popModelIsShow: false
    })
  },

  //有数--页面分享(事件page_share_app_message)
  shareAppMessage(){
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '订单送券',
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
  }

})