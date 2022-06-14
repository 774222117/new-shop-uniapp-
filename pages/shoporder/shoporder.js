/**
 * 订单列表
 */
const app = getApp()
//订单明细查询
const peopleOrderInfoUrl = require('../../utils/config.js').httpConfig.peopleOrderInfoUrl
//取消订单
const cancelOrderUrl = require('../../utils/config.js').httpConfig.cancelOrderUrl;
//确认订单
const finishOrderUrl = require('../../utils/config.js').httpConfig.finishOrderUrl;
//订单送券urql
const getCouponSetInfoUrl = require('../../utils/config.js').httpConfig.getCouponSetInfoUrl;
const imgUrl = require('../../utils/config.js').httpConfig.imgUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: imgUrl,
    pn : 0,
    //记录状态切换
    oldStatus : -1,
    //订单列表
    orderList : [],
    //订单总条数
    orderTotal : 0,
    //当前列表
    currentTab : 2,
    bottomIsShow:false,
    //订单送券Id
    couponSetId : 0,
    //订单送券详细信息
    couponSetInfo:{},
    //是否显示浮窗
    popModelIsShow : false,
    tabsList: [
      {
        title: '全部订单'
      },
      {
        title: '待支付'
      },
      {
        title: '待提货'
      },
      {
        title: '待退款'
      }
    ],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options',options)
    if (options.tab){
      this.setData({ currentTab: options.tab})
    }
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
    this.setData({
      pn: 0,
      //订单列表
      orderList: [],
      //订单总条数
      orderTotal: 0,
    })
    //订单送券Id
    //app.setCouponSetId(24)
    if (app.globalData.couponSetId > -1){
      this.getCouponSetInfo(app.globalData.couponSetId);
    }
    this.getPeopleOrderInfo(this.data.currentTab)

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
    this.orderBtmFun()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '门店订单',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  orderBtmFun : function(){
    if (this.data.orderList.length >= this.data.orderTotal){
      wx.showToast({
        title: '订单已查询完毕！',
        icon: 'none'
      });
      return
    }
    let that = this;
    let pns = that.data.pn;
    pns++
    that.setData({ pn: pns })
    that.getPeopleOrderInfo(this.data.currentTab)
  },

  /******************************* 自定义方法 ************************************** */
  /**
   * 获取订单
   *   orderStatus : 0 所有 1 待支付 2 待取货 3 待退款
   *   返回status说明：
   *      0 待支付，显示支付按钮
   *      1 待取货
   *      2 已完成
   *      4 待退款
   */
  getPeopleOrderInfo : function(orderStatus){
    if (app.globalData.userInfo == null) return
    //切换过状态,页码设为零
    if (this.data.oldStatus != orderStatus){
      this.data.orderList = []
      this.setData({
        pn:0,
        orderTotal : 0
      })
    }
    let data = {
      pn : this.data.pn,
      peopleId: app.globalData.userInfo.peopleId
    }
    orderStatus = parseInt(orderStatus)
    switch (orderStatus){
      //待支付
      case 1 :
        data.status = 0
      break
      //待取货
      case 2:
        data.status = 1
      break
      //待退款
      case 3:
        data.refundState = 0
      break
    }

    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    console.log('orderStatus', orderStatus)
    console.log('data',data)
    wx.request({
      url: peopleOrderInfoUrl,
      data : data,
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },

      success: function (res) {
        wx.hideLoading();
        if (!res.data.rows) {
          wx.showToast({
            title: res.data.message || '查询订单出错！',
            icon: 'none'
          });
          return
        }
        if (res.data.rows.lenght == 0) {
          that.setData({ bottomIsShow: true })
        } else {
          that.setData({ bottomIsShow: false })
          let orderList = that.data.orderList.concat(res.data.rows)
          //页面加+1
          that.setData({
            bottomIsShow: false,
            oldStatus: orderStatus,
            //订单数据
            orderList: orderList,
            //订单条数
            orderTotal : res.data.total
          })
        }
        console.info(that.data.orderList)
      }
    })
  },

  /**
   * 更新状态
   */
  updateOrderStatus : function(order){
    let orderList = this.data.orderList
    orderList.forEach((item) => {
      if(order.id == item.id){
        item.status = 1
        return
      }
    })
    this.setData({ orderList: orderList })
  },

  /*********************************************** 事件 ********************************** */
  /**
   * 支付事件
   */
  toPay : function(e){
    let order = e.currentTarget.dataset.order
    //this.updateOrderStatus(order)
    this.payOrder(order)
  },
  /**
   * 取消订单
   */
  cancelOrder:function(e){
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定取消订单？',
      success (res) {
        if (res.confirm) {
          let orderId = e.currentTarget.dataset.id;
          let shopId = e.currentTarget.dataset.shopid
          wx.request({
            url: cancelOrderUrl,
            data: {
              shopId: shopId,
              orderId: orderId
            },
            method: 'GET',
            success: function(res) {
              that.setData({
                pn:0,
                orderTotal : 0,
                orderList:[]
              })
              that.getPeopleOrderInfo(that.data.currentTab)
            },
            fail: function(res) {},
            complete: function(res) {},
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

    /**
   * 确认收货
   */
  confirmGoods:function(e){
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定收货？',
      success (res) {
        if (res.confirm) {
          let orderId = e.currentTarget.dataset.id;
          let shopId = e.currentTarget.dataset.shopid
          wx.request({
            url: finishOrderUrl,
            data: {
              shopId: shopId,
              orderId: orderId
            },
            method: 'GET',
            success: function(res) {
              that.setData({
                pn:0,
                orderTotal : 0,
                orderList:[]
              })
              that.getPeopleOrderInfo(that.data.currentTab)
            },
            fail: function(res) {},
            complete: function(res) {},
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 跳转订单详情事件
   * pages/shoporderinfo/shoporderinfo
   * shopId=1720&orderId=12003
   */
  toOrderInfo : function(e){
    console.log(e)
    let orderId = e.currentTarget.dataset.id;
    let shopId = e.currentTarget.dataset.shopid
    wx.navigateTo({
      url: '/pages/shoporderinfo/shoporderinfo?shopId=' + shopId + '&orderId=' + orderId
    })
  },

  changeTab : function(e){

    this.setData({
      currentTab: e.currentTarget.dataset.index,
      pn: 0,
      //订单列表
      orderList: [],
      //订单总条数
      orderTotal: 0,
    })
    this.getPeopleOrderInfo(this.data.currentTab)
  },

  /**
   * 获取订单送券详细信息
   * @param {} couponSetId
   */
  getCouponSetInfo(couponSetId){
    this.setData({
      couponSetId : couponSetId,
      orderId : app.globalData.orderId
    })
    app.setCouponSetId(-1)
    app.setOrderId(-1)
    let that = this
    wx.request({
      url: getCouponSetInfoUrl,
      data : {
        couponSetId : couponSetId
      },
      fail: function (err) {
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },

      success: function (res) {
        if (!res.data.flag) {
          wx.showToast({
            title: '获取订单券信息出错！',
            icon: 'none'
          });
        }
        //赋值 couponSetInfo.displayImg 展示图
        if(res.data.data){
          that.setData({
            couponSetInfo : res.data.data,
            popModelIsShow : true
          })
        }
      }
    })
  },

  /**
   *  弹窗点击事件
   */
  toCouponSet(){
    let couponSetInfo = this.data.couponSetInfo;
    let orderId = this.data.orderId
    this.setData({popModelIsShow : false})
    //售卡，跳转卡界面
    if(couponSetInfo.giveType == 2){
      wx.navigateTo({
        url: '../mycardbag/mycardbag?ids=' + couponSetInfo.giveCoupons,
      })
    }
    //老虎机抽奖
    else if(couponSetInfo.giveType == 3){
      wx.navigateTo({
        url: '../machine/index?activeId=' + couponSetInfo.giveCoupons + '&orderId=' + orderId,
      })
    }
    //跳转优惠券列表
    else{
      wx.switchTab({
        url: '../myIndex/myIndex'
      })
    }

  },
  //关闭弹窗
  popCloseBtn(){
    this.setData({popModelIsShow : false})
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
