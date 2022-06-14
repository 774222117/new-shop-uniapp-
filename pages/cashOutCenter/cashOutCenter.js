const app = getApp()
const sharePeopleInfo = require('../../utils/config.js').httpConfig.sharePeopleInfo
const applyCashOutMoneyUrl = require('../../utils/config.js').httpConfig.applyCashOutMoneyUrl
const applyCashOutRecordsUrl = require('../../utils/config.js').httpConfig.applyCashOutRecordsUrl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //显示成功提示
    hiddenSuccess:true,
    canCashOutMoney:0,
    realName:'',
    applyCashOutMoney:'',
    applyRecords:[],
    pn: 0,//pn 页码
    bottomIsShow:false,
    total:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getCashOutMoney()
    this.getCashOutRecords()
  },
  getCashOutMoney:function(){
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
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            canCashOutMoney: res.data.data.isOutMoney
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
        }
      }
    })
  },
  changeCashOutMoney:function(e){
    let money = e.detail.value
    this.setData({ applyCashOutMoney: money })
  },
  changeRealName: function (e) {
    let realName = e.detail.value
    this.setData({ realName: realName })
  },
  cashAll:function(){
    if (this.data.canCashOutMoney<=0)return
    this.setData({
      applyCashOutMoney: this.data.canCashOutMoney
    })
  },
  //申请提现
  toCashOut: function (e) {
    let that = this
    if (that.data.applyCashOutMoney =='') {
      wx.showToast({
        title: '请输入提现金额',
        icon: 'none'
      })
      return
    }
    if (that.data.realName == '') {
      wx.showToast({
        title: '请输入真实姓名',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '加载中...'
    })
    //获取是否分销人员
    wx.request({
      url: applyCashOutMoneyUrl,
      data: {
        peopleId: app.globalData.userInfo.peopleId,
        applyPay: that.data.applyCashOutMoney,
        realName: that.data.realName
      },
      fail: function (err) {
        console.log(err)
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          let canCashOutMoney = that.data.canCashOutMoney-that.data.applyCashOutMoney
          that.setData({
            canCashOutMoney: canCashOutMoney,
            applyCashOutMoney:'',
            hiddenSuccess: false
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
  },
  //查询提现申请记录
  getCashOutRecords:function(){
    wx.showLoading({
      title: '加载中...'
    })
    let that = this
    wx.request({
      url: applyCashOutRecordsUrl,
      data: {
        peopleId: app.globalData.userInfo.peopleId,
        pn: that.data.pn
      },
      fail: function (err) {
        console.log(err)
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        that.setData({
          total:res.data.total,
          applyRecords: that.data.applyRecords.concat(res.data.rows)
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
    console.log(this.data.total)
    if (this.data.applyRecords.length >= this.data.total) {
      this.setData({
        bottomIsShow: true
      })
      return
    }
    let that = this;
    let pns = that.data.pn;
    pns++
    this.setData({ pn: pns })
    this.getCashOutRecords()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '佣金申请',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  /**
   * 提现按钮事件
   */

  //影藏提现成功提示
  successClick:function(){
    this.setData({
      hiddenSuccess:true
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
