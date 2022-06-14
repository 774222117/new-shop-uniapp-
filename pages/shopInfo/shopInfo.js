const app=getApp();
const shopBusinessInfoUrl = require('../../utils/config.js').httpConfig.shopBusinessInfoUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopInfo:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let id=options.id
    wx.showLoading({
      title: '加载中...'
    })
    let that = this
    //访问数据
    wx.request({
      url: shopBusinessInfoUrl,
      data: {
        shopId:id
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            shopInfo: res.data.data
          })
        }
        else {
          console.log("获取店铺营业信息出错");
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取店铺营业信息网络异常！',
          icon: 'none'
        });
      }
    })
  },
  showpreview:function(e){
    let that = this
    let currentUrl = e.currentTarget.dataset.url
    wx.previewImage({
      current: currentUrl, // 当前显示图片的http链接
      urls: that.data.shopInfo.pictures // 需要预览的图片http链接列表
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
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '门店信息',
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
