const app = getApp()
let request = require('../../utils/request.js');
const immediateSeizure = require('../../utils/config.js').httpConfig.immediateSeizure;
Page({
  data: {
    title: '加载中',
    visible: false,
    time: 10,
    readyTime: 1,
    min: 1,
    max: 5,
    activeId:1,
    _activeInfo : {
     
    }
  },
  onLoad: function(options) {
    this.init()
    let activeId = options.activeId
    //获取详细数据
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    this.setData({ activeId: activeId})
    let that = this
    request({
      url: 'activityInfoUrl',
      method: 'Get',
      data: {
        activityId: activeId
      },
      success: function (res){
        if (res.statusCode == 200 && res.data) {
          let _data = res.data.data
          that.setData({ _activeInfo:_data})    
          console.log(that.data._activeInfo.imgUrl)      
        }
      },
      error: function (err){
        console.log(err)
        wx.hideLoading()
      },
      final: function (res){
        wx.hideLoading()
      },
    })
    
    // if (options.activeInfo != undefined){
    //   let _activeInfo = JSON.parse(options.activeInfo);
    //   this.setData({ activityInfo: _activeInfo });
    // }       
    // this.init()
  },
  // 初始化红包雨
  init() {
    this.setData({
      visible: false,
      createSpeed: 5, // 速度
      time: 10, // 游戏时间
      readyTime: 1, // 准备时间
      min: 1, // 金币最小是0
      max: 50 // 金币最大是10
    })
    // this.setData({
    //   time: 10, // 游戏时间
    //   readyTime:3, // 准备时间
    //   min: 1, // 金额最小是1
    //   max: 50 // 金额最大是5
    // })
  },
  // 结束
  doFinish() {
    this.setData({
      visible: false //  隐藏界面
    })
  },
  // 结束
  success() {
    console.log('bind:finish')
    this.setData({
      visible: false //  隐藏界面
    })
  },
  playBtnClick: function () {
    var that = this;
    wx.showLoading({//开始加载loding
      title: that.data.title,
      mask: true
    })
    let activityId = that.data._activeInfo.id
    request({
      url: 'immediateSeizure',
      method: 'post',
      data: { "peopleId": app.globalData.userInfo.peopleId, "activityId": activityId },//目前写死为1
      success: function (data) {
        if (data.data.flag){
          wx.hideLoading()//关闭loding
          that.setData({
            visible: true //  隐藏界面
          })
          console.log('开始红包雨游戏')
          // that.initRain()  _this.showRain()
          // that.selectComponent("#packetrain").play()
          // that.selectComponent("#packetrain").showRain()
          that.selectComponent("#packetrain").cultdown()
        }else{
          that.setData({
            title: data.data.message
          })
          wx.hideLoading()//关闭loding
          
          wx.showToast({
            title: that.data.title,
            mask: true,
            icon: 'none',
            duration: 2000
          })
        }
      },
      error: function (err) {
        wx.hideLoading()//关闭loding
        console.log(err);
      }
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    this.shareAppMessage()
  },
  //有数--页面分享(事件page_share_app_message)
  shareAppMessage(){
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '红包雨',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  }
})
