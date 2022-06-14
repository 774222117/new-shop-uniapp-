const app = getApp()
const applySharePeople = require('../../utils/config.js').httpConfig.applySharePeople
const sendApplyMsgCodeUrl = require('../../utils/config.js').httpConfig.sendApplyMsgCodeUrl
const getGoodsCarriersUrl = require('../../utils/config.js').httpConfig.getGoodsCarriersUrl
Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopCode:'',
    //苏果工号
    employeeNo:'',
    phone:'',
    realName:'',
    msgCode: '',
    sendCodeText:'发送验证码',
    sending:false,
    //自提点列表
    pickAddrList: [{ address: '12321321', description: '232131111111' }, { address: '12321321', description: '232131111111' }],
    modalName:null,
    selectPickAddr:{address:'请选择提货点'}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let userInfo = app.globalData.userInfo
    this.setData({
      phone:userInfo.phone
    })
  },
  changeShopCode: function (e) {
    let shopCode = e.detail.value
    this.setData({ shopCode: shopCode })
  },
  changeMobile: function (e) {
    let phone = e.detail.value
    this.setData({ phone: phone })
  },
  changeRealName: function (e) {
    let realName = e.detail.value
    this.setData({ realName: realName })
  },
  changeMsgCode: function (e) {
    let msgCode = e.detail.value
    this.setData({ msgCode: msgCode })
  },
  changeemployeeNo:function (e) {
    let employeeNo = e.detail.value
    this.setData({ employeeNo: employeeNo })
  },
  showRadioModal: function () {
    if(this.data.shopCode == ''){
      wx.showToast({
        title: '请输入门店编号',
        icon: 'none'
      })
      return
    }
    let that = this
    //访问数据
    wx.request({
      url: getGoodsCarriersUrl,
      data: {
        shopCode: that.data.shopCode
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.flag) {
          that.setData({
            pickAddrList: res.data.data,
            modalName: "RadioModal"
          })
        }
        else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          });
        }
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取自提点信息网络异常！',
          icon: 'none'
        });
      }
    })
  },
  hideRadioModal: function () {
    this.setData({ modalName: null })
  },
  radiotap:function(e){
    let item = e.currentTarget.dataset.item
    this.setData({ selectPickAddr: item })
    this.hideRadioModal()
  },
  //申请团长
  apply: function(e){
    if(this.data.shopCode==''){
      wx.showToast({
        title: '请输入门店编号',
        icon: 'none'
      })
      return
    }
    if (this.data.employeeNo == '') {
      wx.showToast({
        title: '请输入苏果工号',
        icon: 'none'
      })
      return
    }
    if (this.data.phone == '') {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none'
      })
      return
    }
    if (this.data.realName == '') {
      wx.showToast({
        title: '请输入真实姓名',
        icon: 'none'
      })
      return
    }
    if (this.data.msgCode == '') {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '加载中...'
    })
    //获取是否分销人员
    wx.request({
      url: applySharePeople,
      data: {
        peopleId: app.globalData.userInfo.peopleId,
        openId: app.globalData.userInfo.wxMinOpenId,
        shopCode: this.data.shopCode,
        employeeNo: this.data.employeeNo,
        phone: this.data.phone,
        realName: this.data.realName,
        msgCode: this.data.msgCode
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
        if(res.data.flag){
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
          wx.navigateBack({
            delta: 1
          })
        }else
        {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
  },
  //发送验证码
  sendCode:function(){
    if(this.data.phone == ''){
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '发送中...',
    })
    let that = this
    let time = 60
    wx.request({
      url: sendApplyMsgCodeUrl,
      data: {
        peopleId: app.globalData.userInfo.peopleId,
        phone: this.data.phone
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
        wx.showToast({
          title: '发送成功！',
          icon: 'none'
        });
        let timer = setInterval(function () {
          time--
          if (time <= 0) {
            that.setData({
              sending: false,
              sendCodeText: '重新发送'
            })
            clearInterval(timer)
            return
          }
          let text = '重新发送(' + time + ')'
          that.setData({
            sending: true,
            sendCodeText: text
          })
        }, 1000)
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
      "share_title": '申请团长',
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
