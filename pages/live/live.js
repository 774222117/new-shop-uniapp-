const getLiveListUrl = require('../../utils/config.js').httpConfig.getLiveListUrl
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabIdx: 0,
    tabList: [
      { id: 0, name: '预告' },
      { id: 1, name: '回看' }
    ],
    liveingList:[],
    liveOverList:[],
    //roomStatus = 1 未开始与直播中的  2 已结束的
    roomStatus:1,
    pn:0,
    ps:10,
    total:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getLiveData()
  },
  /**
     * tab切换
     */
  tabSwitch: function (t) {
    let idx = t.currentTarget.dataset.idx
    let roomStatus = idx == 0 ? 1 : 2;
    if (idx != this.data.tabIdx) {
      this.setData({
        tabIdx: idx,
        roomStatus: roomStatus
      }, function () {
        this.getLiveData();
      })
    }
  },
  /**
   * 获取直播数据
   */
  getLiveData:function()
  {
    let that= this
    wx.showLoading({
      title: '加载中...'
    })
    let pn = 0
    if(that.data.roomStatus==2){
      pn=that.data.pn
    }
    //访问数据
    wx.request({
      url: getLiveListUrl,
      data: {
        roomStatus: that.data.roomStatus,
        pn: pn,
        ps: that.data.ps
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          let liveList = res.data.data.rows
          if(that.data.roomStatus==1){
            that.setData({
              liveingList: liveList
            })
          }else{
            let total = res.data.data.total
            that.setData({
              liveOverList: that.data.liveOverList.concat(liveList),
              total: total
            })
          }
        }
        else {
          console.log("获取直播列表出错");
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取直播列表网络异常！',
          icon: 'none'
        });
      }
    })
  },
  //跳转到回看
  navcatToReview:function(e){
    let videoId = e.currentTarget.dataset.videoid
    wx.navigateTo({
      url: '../liveReview/liveReview?videoId=' + videoId,
    })
  },
  navcatToLive: function (e) {
    let roomId = e.currentTarget.dataset.roomid
    wx.navigateTo({
      url: 'plugin-private://wx2b03c6e691cd7370/pages/live-player-plugin?room_id=' + roomId,
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
    this.browseWxappPage()
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
    let that = this
    if (that.data.roomStatus == 2 && that.data.total > that.data.liveOverList.length) {
      let pn = that.data.pn + 1
      that.setData({
        pn: pn
      })
      that.getLiveData()
    }
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
      "share_title": '直播页',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d", 
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  }

})