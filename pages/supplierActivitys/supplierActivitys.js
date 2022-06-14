const findShopActivityInfourl = require('../../utils/config.js').httpConfig.findShopActivityInfourl
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    activityList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getActivitData()
  },
  /**
     * 获取供应商活动数据
     */
  getActivitData: function () {
    let that = this
    wx.showLoading({
      title: '加载中...'
    })
    //访问数据
    wx.request({
      url: findShopActivityInfourl,
      data: {
        shopId: app.globalData.shopInfo.id
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            activityList: res.data.data
          })
        }
        else {
          console.log("获取供应商活动列表出错");
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取供应商活动列表网络异常！',
          icon: 'none'
        });
      }
    })
  },
  navcatToactivity:function(e){
    let activitid = e.currentTarget.dataset.activitid
    wx.navigateTo({
      url: '../jielong/jielong?activityId=' + activitid
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
    this.shareAppMessage();
  },
  //有数--页面分享(事件page_share_app_message)
  shareAppMessage(){
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '供应商活动页',
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