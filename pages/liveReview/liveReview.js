const app = getApp()
const getLiveVideoDetailInfoUrl = require('../../utils/config.js').httpConfig.getLiveVideoDetailInfoUrl
const getLiveVideoGoodsListInfoUrl = require('../../utils/config.js').httpConfig.getLiveVideoGoodsListInfoUrl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    roomId:null,
    videList: null,
    src:'',
    goodsList:[],
    //当前播放的视频
    index:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let videoId = options.videoId
    let that = this
    this.setData({
      id: videoId
    })
  },
  showModal(e) {
    //商品列表
    if (e.currentTarget.dataset.target == 'bottomModal') {
      this.showGoodsList()
    }
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },

  /**
   * 关闭地址选择
   * 关闭商品详情
   */
  hideModal(e) {
    this.setData({
      modalName: null
    })
    //是否选择门店
    let choose = false
    //点击地址选择
    if (e.currentTarget.dataset.target == 'bottomModal') {
      //判断是关闭了地址选择还是选中了门店
      if (e.currentTarget.dataset.id) {

      }
    }
  },
  /**
 * 显示商品列表
 */
  showGoodsList: function (e) {
    let roomId = this.data.roomId
    let that = this
    wx.showLoading({
      title: '加载中...'
    })
    //访问数据
    wx.request({
      url: getLiveVideoGoodsListInfoUrl,
      data: {
        roomId: roomId
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            goodsList: res.data.data
          })
        }
        else {
          console.log("获取商品列表出错");
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取商品列表网络异常！',
          icon: 'none'
        });
      }
    })
  },
  goGoodsPage:function(e){
    let url = e.currentTarget.dataset.url
    console.log(url)
    wx.navigateTo({
      url: "/"+url,
    })
  },
  switchVideo:function(e){
    console.log(e)
    let url = ""
    let index=0
    //如果 播放到最后一个，跳转到第一个视频
    if (this.data.index >= (this.data.videList.length - 1)){
      url=this.data.videList[0].mediaUrl
      index=0
    }
    else{
      index = this.data.index + 1
      url = this.data.videList[index].mediaUrl
    }
    console.log("index",this.data.index)
    console.log("indexurl", url)
    this.videoContext = wx.createVideoContext('myVideo');
    this.setData({
      src: url,
      index:index
    })
    this.videoContext.play()
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    wx.showLoading({
      title: '加载中...'
    })
    //访问数据
    wx.request({
      url: getLiveVideoDetailInfoUrl,
      data: {
        id: that.data.id
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            videList: res.data.data,
            roomId: res.data.data[0].roomId,
            src: res.data.data[0].mediaUrl
          })
          that.videoContext = wx.createVideoContext('myVideo')//视频管理组件
        }
        else {
          console.log("获取直播回看出错");
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取直播回看网络异常！',
          icon: 'none'
        });
      }
    })
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '直播回看',
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
