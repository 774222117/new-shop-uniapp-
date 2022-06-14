// pages/groupActivityManage/groupActivityManage.js
const app = getApp()
const groupManageUrl = require('../../utils/config.js').httpConfig.groupManageUrl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    carrierId: '',
    tabFlag: '0',
    pn: 0,
    pn2: 0,
    listData: [],
    listData2: [],
    listTotal: '',
    listTotal2: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      carrierId: options.carrierId
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getData(this.data.tabFlag)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
    let that = this
    if (that.data.tabFlag == 0) {
      if (that.data.listTotal == that.data.listData.length) {
        wx.showToast({
          title: '没有更多啦~',
          icon: 'none'
        })
        wx.hideLoading()
        return
      }
      that.setData({
        pn: that.data.pn + 1
      })
      that.getData(that.data.tabFlag)
    } else {
      if (that.data.listTotal2 == that.data.listData2.length) {
        wx.showToast({
          title: '没有更多啦~',
          icon: 'none'
        })
        return
      }
      that.setData({
        pn2: that.data.pn2 + 1
      })
      that.getData(that.data.tabFlag)
    }

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '团购活动管理',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  /******************************************** 自定义方法 ***************************************************** */
  /**
   *切换顶部tabs标签
   */
  changeTabs(e) {
    this.setData({
      tabFlag: e.currentTarget.dataset.index
    })
    this.setData({
      pn: 0,
      pn2: 0,
      listData: [],
      listData2: []
    })
    this.getData(this.data.tabFlag)
  },
  /**
   * 获取初始数据
   */
  getData(status) {
    let that = this
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let peopleId = -1;
    if (app.globalData.userInfo != null) {
      peopleId = app.globalData.userInfo.peopleId
    }
    wx.request({
      url: groupManageUrl,
      data: {
        status: status,
        peopleId: peopleId,
        ps: 8,
        pn: that.data.tabFlag == 0 ? that.data.pn : that.data.pn2
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取商品数据网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取商品数据出错！',
            icon: 'none'
          });
        } else {
          if (that.data.tabFlag == 0) {
            that.setData({
              listTotal: res.data.data.total,
              listData: that.data.listData.concat(res.data.data.rows),
            })
          } else {
            that.setData({
              listTotal2: res.data.data.total,
              listData2: that.data.listData2.concat(res.data.data.rows),
            })
          }
        }
      }
    })
  },
  /**
   * 查看订单
   */
  toNavicata: function (e) {
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url + '?id=' + e.currentTarget.dataset.id,
    })
  },
  /**
   * 去分享
   */
  toNavicataShare: function (e) {
    let that = this
    let url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url + '?bannerId=' + e.currentTarget.dataset.id + '&carrierId=' + that.data.carrierId,
    })
  },
})
