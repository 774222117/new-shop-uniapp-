const app = getApp()
const sharePeopleInfo = require('../../utils/config.js').httpConfig.sharePeopleInfo
const getCommunityCarriersUrl = require('../../utils/config.js').httpConfig.getCommunityCarriersUrl
const applyCarrierUrl = require('../../utils/config.js').httpConfig.applyCarrierUrl
const updateIsBusinessUrl = require('../../utils/config.js').httpConfig.updateIsBusinessUrl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    status: true,
    selectOpen: ["营业", "休息"],
    userInfoIconUrl: '',
    userInfoName: '',
    shareInfo: null,
    modalName: '',
    carriers: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    if (app.globalData.userInfo) {
      this.setData({
        userInfoIconUrl: app.globalData.userInfo.icon,
        userInfoName: app.globalData.userInfo.nickName
      })
    }
    wx.showLoading({
      title: '加载中...'
    })
    let that = this
    //获取团长中心数据
    wx.request({
      url: sharePeopleInfo,
      data: {
        peopleId: app.globalData.userInfo.peopleId,
      },
      fail: function (err) {
        console.log(err)
        wx.hideLoading()
        wx.showToast({
          title: res.data.message,
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            shareInfo: res.data.data,
            status: res.data.data.isBusiness==1?true:false
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
        }
      }
    })

    that.browseWxappPage();
  },
  //切换营业休息状态
  switchChange() {
    let that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    wx.request({
      url: updateIsBusinessUrl,
      data: {
        peopleId: app.globalData.userInfo.peopleId,
        isBusiness: that.data.status?'0':'1'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            status: !that.data.status
          })
        } else {}
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      }
    })
  },
  //获取社群自提点
  getCommunityCarriers: function () {
    let that = this
    wx.showLoading({
      title: '加载中...'
    })
    //访问数据
    wx.request({
      url: getCommunityCarriersUrl,
      data: {
        shopId: app.globalData.shopInfo.id
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            carriers: res.data.data,
            modalName: 'RadioModal'
          })
        } else {
          console.log("获取最近门店出错！");
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      }
    })
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
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '团购中心',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })

  },
  toNavicata: function (e) {
    let that = this
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url+'?carrierId='+that.data.shareInfo.carrierId,
    })
  },
  tabApplyCarrier: function () {
    this.getCommunityCarriers()
  },
  hideRadioModal: function () {
    this.setData({
      modalName: null
    })
  },
  radiotap: function (e) {
    let carrier = e.currentTarget.dataset.value
    let that = this
    wx.showLoading({
      title: '加载中...'
    })
    //访问数据
    wx.request({
      url: applyCarrierUrl,
      data: {
        shopId: app.globalData.shopInfo.id,
        peopleId: app.globalData.userInfo.peopleId,
        carrierId: carrier.id,
        address: carrier.address
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            modalName: ''
          })
          wx.showToast({
            title: '申请成功',
            icon: 'none'
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
          console.log("申请收费自提点失败");
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      }
    })
  },

  //有数--页面浏览
  browseWxappPage() {
    app.TXYouShu.track('browse_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面离开
  leaveWxappPage() {
    app.TXYouShu.track('leave_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

})
