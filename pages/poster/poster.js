import Poster from '../../miniprogram_dist/poster/poster';
const posterUrl = require('../../utils/config.js').httpConfig.posterUrl;
let app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    posterConfig: {},
    posterImg : '',
    id : 0,
    shopId : 0,
    pagePath : '',
    supplierActivityId : 0,
    // 1 : 预售 2 商品页面 3 社区团购
    posterType : 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
 
    //预售商品
    if (options.pageType == 1){
      this.setData({
        id : options.goodsId,
        shopId : options.shopId,
        posterType : 1,
        pagePath : "pages/advancegoods/advancegoods"
      })      
    } 
    //商品页面
    else if (options.pageType == 2){
      this.setData({
        id : options.goodsId,
        shopId : options.shopId,
        posterType : 1,
        pagePath : "pages/goods/goods"
      })      
      //活动Id
      if(options.supplierActivityId){
        this.setData({supplierActivityId : options.supplierActivityId})
      }
    } 
    // 社区购
    else if(options.pageType == 3){ 
      this.setData({
        id : options.supplierActivityId,
        supplierActivityId: options.supplierActivityId,
        shopId : options.shopId,
        posterType : 2,
        pagePath : "pages/jielong/jielong"
      })
      //团购
    }else if(options.pageType == 6){ 
      this.setData({
        id : options.goodsId,
        shopId : options.shopId,
        posterType : 6,
        bannerId: options.bannerId,
        pagePath : "pages/groupbuy/groupbuy",
        carrierId: options.carrierId,
      })      
    }
    //二级页
    else{ 
      this.setData({
        id : options.bannerId,
        bannerId: options.bannerId,
        shopId : options.shopId,
        posterType : 3,
        pagePath : "pages/secondpage/secondpage"
      })      
    }
    this.getPosterData()
  },

  //获取数据
  getPosterData:function(){
    wx.showLoading({
      title: '海报绘制中...',
      mask: true
    })
    let that = this
    wx.request({
      url: posterUrl,
      method: 'post',
      data: {
        shopId: that.data.shopId,
        id: that.data.id,
        peopleId: app.globalData.userInfo.peopleId,
        posterType: that.data.posterType,
        supplierActivityId: that.data.supplierActivityId,
        minPath: that.data.pagePath,
        bannerId:this.data.bannerId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取海报数据网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        if (!res.data.flag) {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message || '获取海报数据出错！',
            icon: 'none'
          });
          return
        }
        //写入缓存
        let posterConfig = JSON.parse(res.data.data.configure)
        console.info(posterConfig)
        wx.hideLoading();
        that.setData({ posterConfig: posterConfig},()=>{          
          Poster.create(true);
        })
      }
    })
  },
  onPosterSuccess(e) {
    const { detail } = e;
    console.info(detail)
    this.setData({ posterImg:detail})
  },
  onPosterFail(err) {
    console.info(err);
  },

  /**
   * 保存手机相册
   */
  saveToPhotos : function(){
    wx.saveImageToPhotosAlbum({
      filePath: this.data.posterImg,
      success(res){
        wx.showToast({
          title: '保存成功',
          icon:'none'
        })
      },
      fail(res){
        console.info(res)
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
      "share_title": '商品海报页',
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
        "open_id": _app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面离开
  leaveWxappPage(){
    app.TXYouShu.track('leave_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d", 
        "open_id": _app.globalData.userInfo.wxMinOpenId
      }
    })
  },
})