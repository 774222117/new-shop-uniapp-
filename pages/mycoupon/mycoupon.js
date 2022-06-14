const app= getApp()
const imgUrl = require('../../utils/config.js').httpConfig.imgUrl;
let request = require('../../utils/request.js')
const barcode = require('../../utils/index.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 0,
    searchOriginList: [],//搜索前存储的list
    searchNowList: [],//搜索后的list
    tabsList: [
      {
        title: '待使用'
      },
      {
        title: '已使用'
      },
      {
        title: '已过期'
      }
    ],
    isImmediateUsePopup:true,//弹出层控制 true为显示
    cardDetailsData: { isWeChat:false},//点击查看详情传递弹出层数据
    imgUrl: imgUrl,
  },
  /**
     * 去详情页
     */
  goToCouponDetail(e) {
    let id = e.currentTarget.dataset.infodata.couponId
    wx.navigateTo({
      url: '../coupondetail/coupondetail?id='+id+'&superiorPage=myIndex',
    })
  },
  // 请求数据方法
  getMyCouponList(that, url) {
    wx.showLoading({//开始加载loding
      title: '加载中',
      mask: true
    })
    request({
      url: url,
      data: { peopleId: app.globalData.userInfo.peopleId },
      method: 'Get',
      success: function (res) {
        if (res.data.data.myCouponDtos) {
          let getParameterIds = res.data.data.couponIds.join(',');
          that.setData({
            currentData: res.data.data.myCouponDtos,  //数据
            couponIds: res.data.data.couponIds.length,  //多少张卡
            parameterIds: getParameterIds  //传给我的卡包参数设置
          })
          if (that.data.currentTab == 0) {
            that.setData({
              searchOriginList: res.data.data.myCouponDtos  //保存搜索前的数据
            })
          }
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
  getCurrentData(currentTab) {
    if (app.globalData.userInfo != null) {
      // 点击tab先清空数据在赋值
      this.setData({
        currentData: []
      })
      switch (currentTab) {
        case 0:
          this.getMyCouponList(this, "myIndexUrl")
          break;
        case 1:
          this.getMyCouponList(this, "myUsedCouponListUrl")
          break;
        case 2:
          this.getMyCouponList(this, "myInvalidCouponListUrl")
          break;
      }
    }
  },
  // 立即使用
  immediateUse: function (e) {
    //如果使用平台为社群购直接跳转社群购页面 2019-12-20 wyx append it
    if (e.target.dataset.infodata.usePlatform === 2) {
      wx.switchTab({
        url: '/pages/category/category',
      })
      return
    }
    //如果是微信支付，直接打开支付码
    // if (e.target.dataset.infodata.isWeChat) {
    //   this.wechatPayment()
    //   return
    // }
    this.setData({
      cardDetailsData: e.target.dataset.infodata
    })

    this.setData({ isImmediateUsePopup: false })
    if (!e.target.dataset.infodata.isWeChat) {
      var cxt = wx.createCanvasContext('barcode');
      cxt.clearRect(0, 0, 285, 70);
      barcode.barcode('barcode', this.data.cardDetailsData.couponCode, 570, 140);
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo != null) {
      this.getMyCouponList(this, "myIndexUrl");
    }
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
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '我的优惠券',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  changeTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.index
    })
    this.getCurrentData(e.currentTarget.dataset.index)
  },

  //有数--页面浏览
  browseWxappPage(){
    _app.TXYouShu.track('browse_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": _app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面离开
  leaveWxappPage(){
    _app.TXYouShu.track('leave_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": _app.globalData.userInfo.wxMinOpenId
      }
    })
  },

})
