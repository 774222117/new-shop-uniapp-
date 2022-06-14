//根据Id获取门店信息
const app = getApp()
const getOrderExpressInfoUrl = require('../../utils/config.js').httpConfig.getOrderExpressInfoUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    ordersn:'',
    expressNo:'',
    expName: '',
    expList:[],
    expListTemp:[],
    flag:true,
    deliStatus:{"0":"快递收件(揽件)","1":"在途中","2":"正在派件","3":"已签收","4":"派送失败","5":"疑难件","6":"退件签收"},
    expStatus:'',
    sendTime:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.ordersn == undefined){
      wx.showToast({
        title: '订单号异常',
        icon: 'none'
      })
    }
    if (options.expressNo == undefined) {
      wx.showToast({
        title: '快递单号异常',
        icon: 'none'
      })
    }
    if (options.sendTime == undefined) {
      wx.showToast({
        title: '发货时间异常',
        icon: 'none'
      })
    }
    this.setData({
      ordersn: options.ordersn,
      expressNo: options.expressNo,
      sendTime:options.sendTime,
    })
    this.getExpressInfo(options.expressNo)
  },
  getExpressInfo: function (expressNo) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: getOrderExpressInfoUrl,
      data: {
        expressNo: expressNo
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取快递信息出错',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取门店数据出错',
            icon: 'none'
          });
          return
        }
        console.log(res)
        let expName = res.data.data.result.expName
        let list = res.data.data.result.list
        let status = res.data.data.result.deliverystatus
        that.setData({
          expName: expName,
          expList: list,
          expListTemp:list,
          expStatus:status
        })
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
      "share_title": '快递信息',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  /**
   * 展开收起物流信息
   */
  changeFlag() {

    if (this.data.flag == true) {
      this.setData({
        expListTemp: [this.data.expList[0]]
      })
      console.log(1)
    } else {
      this.setData({
        expListTemp: this.data.expList
      })
      console.log(2)
    }
    this.setData({
      flag: !this.data.flag,
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
  copyOrdersn:function(){
    let that = this
    wx.setClipboardData({
      data: that.data.expressNo,
      success (res) {
        
      }
    })
  },

})
