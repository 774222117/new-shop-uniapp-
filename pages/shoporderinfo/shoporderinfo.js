// pages/shoporderinfo/shoporderinfo.js
const app = getApp()
//查询订单Url
const searchOrderInfoUrl = require('../../utils/config.js').httpConfig.searchOrderInfoUrl
//申请退款
const applyRefundUrl = require('../../utils/config.js').httpConfig.applyRefundUrl
//支付
const payOrderUrl = require('../../utils/config.js').httpConfig.payOrderUrl;
//支付失败
const payFaildOrderUrl = require('../../utils/config.js').httpConfig.payFaildOrderUrl;
//支付回调
const payCallbackUrl = require('../../utils/config.js').httpConfig.payCallbackUrl;
//退货原因
const findRefundReasonUrl = require('../../utils/config.js').httpConfig.findRefundReasonUrl;
//取消订单
const cancelOrderUrl = require('../../utils/config.js').httpConfig.cancelOrderUrl;
// 一維碼
let qrcode = require('../../utils/index.js');
const barcode = require('../../utils/index.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId : 0,
    shopId : 0,
    orderInfo : {},
    //退款原因
    reason : '',
    //弹框显示
    modelIsShow: true,
    //配送方式：0 全部 1 门店自提 2 配送到家 wyx 2020-03-16 append it
    deliveryWay : 1,
    resonList : []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ 
      orderId: options.orderId,
      shopId: options.shopId
    })
    this.searchOrderInfo()
    this.findRefundReason()
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

  /****************************************** 自定义方法 ************************************** */
  findRefundReason : function(){
    let that = this
    wx.request({
      url: findRefundReasonUrl,      
      fail: function (err) {        
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {        
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取退货原因出错！',
            icon: 'none'
          });
          return
        }
        let resons = res.data.data
        that.setData({resonList:resons})  
        console.info(that.resonList)         
      }
    })
  },


  searchOrderInfo : function(){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: searchOrderInfoUrl,
      data : {
        shopId: this.data.shopId,
        orderId : this.data.orderId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '查询订单出错！',
            icon: 'none'
          });
          return
        }
        if (res.data.data){
          let status = res.data.data.status
          if(status==0) {
            res.data.data.imgsrc ="../../image/status-0.png"
          }
          else if (status <= 2) {
            res.data.data.imgsrc = "../../image/status-1.png"
          } else if (status >= 4) {
            res.data.data.imgsrc = "../../image/status-4.png"
          }else{
            res.data.data.imgsrc = "../../image/status-2.png"
          }
          //是否显示提货码
          res.data.data.showCode = false
          res.data.data.showRefund = false;
          res.data.data.showPay = false;
          if (status > 0 && status < 4 && res.data.data.afterStatus == 'NO'){
            res.data.data.showCode = true;
            res.data.data.showRefund = true;              
          }  
          //如果订单已完成，但没有同步中台，已完成订单不能退款
          if(status == 3 && !res.data.data.isToCenter){
            res.data.data.showRefund = false
          }
          //如果订单已完成，并且完成时间超过7天不显示退款  暂时前端不控制 退款按钮影藏
          // if(status == 3 && res.data.data.finishTime && that.getDays(res.data.data.finishTime)>7){
          //   res.data.data.showRefund = false
          // }
          res.data.data.showPay = status == 0;        
        }
        that.setData({ orderInfo : res.data.data})
        
        //2020-03-16 append it 加入配送方式
        if(res.data.data.dispatchType){
          that.setData({ deliveryWay : res.data.data.dispatchType})
        }
        console.info(that.data.orderInfo)
        barcode.qrcode('barcode', that.data.orderInfo.verifycode, 300, 300);
        //提货码 条码        
        var cxt = wx.createCanvasContext('barcode2');
        cxt.clearRect(0, 0, 285, 70);
        barcode.barcode('barcode2', that.data.orderInfo.verifycode, 570, 140);
      }
    })
  },
  getDays: function  (finisTime){
    let  startDate = Date.parse(finisTime)
    let  endDate = new Date()
    let days=(endDate - startDate)/(1*24*60*60*1000)
    return days
  },
  /**
   * 付款
   * 传入order集合
   */
  payOrder: function () {
    if (this.data.isPay) return
    this.setData({ isPay: true })
    //提交数据
    wx.showLoading({
      title: '加载中，请稍后...',
      mask: true
    })

    let that = this
    wx.request({
      url: payOrderUrl,
      data: {
        shopId: this.data.orderInfo.shopId,
        orderId: this.data.orderInfo.id,
        peopleId: this.data.orderInfo.peopleId
      },
      fail: function (err) {
        this.setData({ isPay: false })
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        that.setData({ isPay: false })
        //判断是否有错
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '支付订单单异常！',
            icon: 'none'
          });
          return
        }
        //发起支付
        that.callWxPay(res.data.data)
      }
    })
  },


  /**
   * 调用微信支付
   */
  callWxPay: function (weChatInfo) {
    let that = this
    wx.requestPayment({
      timeStamp: weChatInfo.timeStamp,
      nonceStr: weChatInfo.nonceStr,
      package: weChatInfo.package1,
      signType: weChatInfo.signType,
      paySign: weChatInfo.paySign,
      //用户放弃支付，只给提示
      fail: function (err) {
        console.log(err);
        let _msg = err.message
        if (_msg == undefined) {
          _msg = "支付失败!"
        }
        wx.showToast({
          title: _msg,
          icon: 'none'
        });

        wx.request({
          url: payFaildOrderUrl,
          data: {
            shopId: that.data.orderInfo.shopId,
            orderId: that.data.orderInfo.id,
          },
          method: 'GET',
          success: function (res) {
          },
          fail: function (res) { },
          complete: function (res) { },
        })
      },
      //支付成功
      success: function (res) {
        //修改界面状态为已付款
        //通知支付完成
        wx.request({
          url: payCallbackUrl,
          data: {
            shopId: that.data.orderInfo.shopId,
            orderId: that.data.orderInfo.id,
          },
          method: 'GET',
          success: function (res) {
            wx.switchTab({
              url: '../shoporder/shoporder?tab=2',
            })    
          },
          fail: function (res) { },
          complete: function (res) { },
        })
      }
    })
  },

  /**
   * 申请退款
   */
  applyRefund : function(){
    wx.showLoading({
      title: '申请退款中...',
      mask: true
    })

    let that = this
    wx.request({
      url: applyRefundUrl,
      data: {
        shopId: this.data.orderInfo.shopId,
        orderId: this.data.orderInfo.id,
        reason: this.data.reason
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '网络异常！',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading()
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '查询订单出错！',
            icon: 'none'
          });
          return
        }       
        wx.showToast({
          title: '申请成功，请耐心等待！',
          icon: 'none'
        });
        //TODO：重新获取一下订单
      }
    })
  },

  showResoneModal : function(){
    this.setData({modalName : "resoneModal"})
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },

  confirmRefund : function(e){
    this.hideModal()
    let reason = e.currentTarget.dataset.value
    this.setData({reason : reason})
    console.info(e)
    this.applyRefund()
  },

  refundOrder : function(){        
    let that = this
    //完成状态的订单，需要申请售后
    if(this.data.orderInfo.status == 3){
      //门店商品订单 售后 直接调 取消订单
      if(this.data.orderInfo.orderType == 1){
        wx.showModal({
          title: '退款',
          content: '点击“确定”选择退款原因',
          confirmText: '确定',
          cancelText: '取消',
          success: function (res) {
            if (res.confirm) {
              //that.applyRefund()
              that.showResoneModal()
            }
          }
        })
      }
      else{
        if(this.data.orderInfo.afterStatus == 'NO'){
          wx.navigateTo({
            url: '../afterorder/afterorder?orderId=' + this.data.orderInfo.id + '&shopId=' + this.data.orderInfo.shopId
          })
        }
        else{
          wx.showToast({
            title: '订单已经申请退款',
            icon : 'none'
          })
        }
      }
    }
    else{
      wx.showModal({
        title: '退款',
        content: '点击“确定”选择退款原因',
        confirmText: '确定',
        cancelText: '取消',
        success: function (res) {
          if (res.confirm) {
            //that.applyRefund()
            that.showResoneModal()
          }
        }
      })
    }    
  },

  /**
   * 拨打电话
   */
  callPhone : function(){
    wx.makePhoneCall({
      phoneNumber: this.data.orderInfo.carrierMobile,
    })
  },

  /**
   * 拨打门店电话
   */
  callShopPhone : function(){
    wx.makePhoneCall({
      phoneNumber: this.data.orderInfo.shopPhone,
    })
  },

  callRiderPhone:function(){
    wx.makePhoneCall({
      phoneNumber: this.data.orderInfo.carrierDriverPhone,
    })
  },

  /**
   * 显示提货码
   */
  showCode : function(){
    if( this.data.orderInfo.status=='3'){
      wx.showToast({
        title: '您已提货',
        icon:'none'
      })
      return
    }
    let takeTime = this.data.orderInfo.takeTime
    if(takeTime != undefined){
      var date = new Date(takeTime.replace(/-/g,'/'))  
      if((date - new Date())>0){
        wx.showToast({
          title: '未到提货时间，无法查看提货码！',
          icon:'none'
        })
        return
      } 
    }
    this.setData({ modelIsShow : false})
  },
  closeModel:function(){
    this.setData({ modelIsShow: true })
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
              wx.navigateBack({
                delta: 1
              })
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
   * 快递单号箭头按钮跳转至express物流信息页面
   */
  jumpExpressPage :function(){
    let that = this;
    let expressNumber = that.data.orderInfo.expressNumber;//快递单号
    let expressCompany = that.data.orderInfo.expressCompany;//快递公司
    let ordersn = that.data.orderInfo.ordersn;//订单编号
    let sendTime = that.data.orderInfo.sendTime;
    wx.navigateTo({
      url: '../express/express?expressNo=' + expressNumber + '&expName=' + expressCompany + '&ordersn=' + ordersn + '&sendTime=' + sendTime
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
    wx.setClipboardData({
      data: this.data.orderInfo.ordersn,
      success (res) {
        
      }
    })
  }

})