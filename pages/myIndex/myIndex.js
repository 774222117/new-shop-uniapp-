/**
 * 登录页面
 */
const app = getApp()
const util = require('../../utils/util.js')
const barcode = require('../../utils/index.js')
const isSharePeopleUrl = require('../../utils/config.js').httpConfig.isSharePeopleUrl
const peopleOrderCountUrl = require('../../utils/config.js').httpConfig.peopleOrderCountUrl
const getPeopleCouponUnusedCountUrl = require('../../utils/config.js').httpConfig.getPeopleCouponUnusedCountUrl
const updatePeopleInfo = require('../../utils/config.js').httpConfig.updatePeopleInfo

let shopcartUtil = require('../../utils/shopcart')
let request = require('../../utils/request.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfoIconUrl:"",
    userInfoName:"",
    userInfoPhone:"",
    cartNum: 0,
    //是否分销人员
    isSharePeople:false,
    daizhifuCount:0,
    daiquhuoCount:0,
    //是否显示华润通会员号条码
    isShowBarCode:true,
    //华润通会员号
    suguoMemberNo:'',
    popModelIsShow: false,
    couponCount: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      suguoMemberNo: app.globalData.userInfo!=null?app.globalData.userInfo.suguoMemberNo : ''
    })
    wx.hideTabBar()
  },
  /**
   * 刷新底部菜单购物车数量
   */
  refreshCartNum: function () {
    let totalBuyCount = shopcartUtil.getTotalBuyCount()
    this.setData({
      cartNum: totalBuyCount
    })
  },
  /**
     * 跳转到我的订单
     */
  jumpToOrder: function (e) {
    if (app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    let tab = e.currentTarget.dataset.tab
    console.log(tab)
    wx.navigateTo({
      url: '../shoporder/shoporder?tab=' + tab,
    })
  },
  toNavicata:function(e){
    let url = e.currentTarget.dataset.url;
    if(app.globalData.userInfo == null&&url.indexOf("login/login") == -1){
      url = '../login/login'
    }
    wx.navigateTo({
      url: url,
    })
  },
  //跳转我的悠享卡
  goToCardBag:function(){
    if (app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    request({
      url: 'indexMyPrivilegeCardUrl',
      method: 'Get',
      data: { peopleId: app.globalData.userInfo.peopleId },
      success: function (data) {
      let idListString = data.data.join(',')
      wx.navigateTo({
      url: '../mycardbag/mycardbag?ids=' + idListString
      })
      wx.hideLoading()//关闭loding
    },
    error: function (err) {
      wx.hideLoading()//关闭loding
      console.log(err);
    }
  })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.userInfo == null) {
      // 没有登陆跳转login
      // wx.navigateTo({
      //   url: '../login/login'
      // })
      this.setData({
        userInfoIconUrl: app.globalData.userInfo.icon,
        userInfoName: '未注册'
      })
      return
    }
    this.refreshCartNum()
    if (app.globalData.userInfo) {
      this.setData({
        userInfoIconUrl: app.globalData.userInfo.icon,
        userInfoName: app.globalData.userInfo.nickName,
        userInfoPhone: app.globalData.userInfo.phone,
      })
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    //获取待支付订单总数
    wx.request({
      url: peopleOrderCountUrl,
      data: {
        peopleId: app.globalData.userInfo.peopleId,
        status: 0
      },
      success: function (res) {
        that.setData({
          daizhifuCount: res.data.data
        })
      }
    })
    //获取待取货订单总数
    wx.request({
      url: peopleOrderCountUrl,
      data: {
        peopleId: app.globalData.userInfo.peopleId,
        status: 1
      },
      success: function (res) {
        that.setData({
          daiquhuoCount: res.data.data
        })
      }
    })
    //获取是否分销人员
    wx.request({
      url: isSharePeopleUrl,
      data: {
        peopleId: app.globalData.userInfo.peopleId,
        icon: that.data.userInfoIconUrl
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
        that.setData({
          isSharePeople: res.data.flag
        })
      }
    })
    //获取待使用优惠券总数
    wx.request({
      url: getPeopleCouponUnusedCountUrl,
      data: {
        peopleId: app.globalData.userInfo.peopleId
      },
      success: function (res) {
        that.setData({
          couponCount: res.data.data
        })
      }
    })

    that.browseWxappPage();
  },

  toUser : function(){
    wx.navigateTo({
      url: '../people/index'
    })
  } ,
  showCode:function(){
    let that = this
    var cxt = wx.createCanvasContext('barcode');
    cxt.clearRect(0, 0, 285, 70);
    barcode.barcode('barcode', that.data.suguoMemberNo, 570, 140);
    this.setData({
      isShowBarCode:false
    })
  },
  hideBarCode:function(){
    this.setData({
      isShowBarCode: true
    })
  },
  /**
     * 生命周期函数--监听页面初次渲染完成
     */
  onReady: function () {

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
      "share_title": '我的',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  /**
   * 跳转兑换码
   */
  toActivityCode:function(){
    if (app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    this.setData({ popModelIsShow: true })
  },

  /**
   * 兑换码--取消按钮
   */
  cancel : function(){
    this.setData({ popModelIsShow: false, activityCode:'' })
  },

  /**
   * 将输入的兑换码的值setData
   */
  changeActivityCode: function(e){
    let activityCode = e.detail.value
    this.setData({ activityCode: activityCode})
  },

  /**
   * 提交兑换码
   */
  submitActivityCode:function(){
    let peopleId = app.globalData.userInfo.peopleId;
    let pageKey =  this.pageKeyFunc(peopleId);
    let activityCode = this.data.activityCode;
    if(activityCode == "" || activityCode == null || activityCode == undefined){
      wx.showToast({
        title: '兑换码不能为空',
        icon: 'none',
        duration: 2000//持续的时间
      });
    }else{
      let that = this
      request({
        url: 'activityCodeUrl',
        method: 'Get',
        data: { peopleId: peopleId, pageKey: pageKey, code: activityCode},
        success: function (data) {
          if(data.data.flag){
            that.setData({
              popModelIsShow: false,
              activityCode: ''
            })
            wx.navigateTo({
              url: '../mycoupon/mycoupon'
            })
            wx.hideLoading()//关闭loding
          }else{
            that.setData({
              activityCode: ''
            })
            wx.showModal({
              title: '提示',
              content: data.data.message
            });
          }
      },
    error: function (err) {
      wx.hideLoading()//关闭loding
      console.log(err);
    },
      fail:function(){
        wx.hideLoading()//关闭loding
        wx.showToast({
          title: '网络异常',
          icon: 'none',
          duration: 2000//持续的时间
        });
      }
    })
    }
  },

  //初始方法 -- key生成
  pageKeyFunc:function(id){
    if (app.globalData.userInfo == undefined) return
    let _date = new Date().getTime(),
      _peopleId = app.globalData.userInfo.peopleId,
      _id = id;
      let _str = _peopleId +''+ _date +''+ _id;
    if (_peopleId || _peopleId == 0){
      return _str
    }else{
      console.log('用户不存在');
    }
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
  oneKeyClick(){
    var nickName,avatarUrl;
    // app.globalData.userInfo.peopleId
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        nickName = res.userInfo.nickName;
        avatarUrl = res.userInfo.avatarUrl;
        //发送请求
        wx.request({
          url: updatePeopleInfo,
          method:"POST",
          data: {
            peopleId: app.globalData.userInfo.peopleId,
            nickName:nickName,
            avatarUrl:avatarUrl
          },
          success: function (res) {
            console.log(res);
          }
        })
        
      }
    })
    
  }

})
