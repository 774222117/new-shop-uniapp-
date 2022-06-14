/**
 * 优享卡售卖
 */
let request = require('../../utils/request');
//app对象
let _app = getApp();
let htmlParse = require('../../component/wxParse/wxParse.js');
const imgUrl = require('../../utils/config.js').httpConfig.imgUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl:imgUrl,
    //主图
    indexImage: '',
    //权益1
    equity1: '',
    //权益2
    equity2: '',
    //权益1优惠券张数
    couponCount: '',
    //权益1文案
    couponText: '',
    //领取开关
    isGetKey: true,
    //优惠券Id
    couponId: '',
    //pageKey
    pageKey: '',
    //params
    amount: '0',
    merchantId: '',
    number: 1,
    payType: 2,
    peopleId: '',
    btnText : '立即领取',
    //用户是否已经领取
    isPeopleReceive : false,
    //根据系统调整高度
    windowHeightKey: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let _id = options.id;
    //根据系统调整高度
    _this.setWindowHeight();
    if (options.scene) {
      _id = options.scene;
    }
    //url传参
    _this.setData({
      couponId: _id
    });
    //pagekey
    _this.pageKeyFunc();
    //获取优享卡信息
    //显示loading
    wx.showLoading({
      title: '加载中...',
      mask: true
    })

    let peopleId = -1;
    if(_app.globalData.userInfo != null){
      peopleId = _app.globalData.userInfo.peopleId
    }
    request({
      url: 'couponDetailsUrl',
      method: 'get',
      data: {
        couponId: _this.data.couponId,
        peopleId: peopleId
      },
      success: function (data) {
        if (data.statusCode == 200 && data.data) {
          let _data = data.data.data;
          if (_data) {
            let {
              pictures, intro, useCount, buyMoney, merchantId, ruleInfo, isPeopleReceive
            } = _data;
            //数据绑定
            _this.setData({
              indexImage: pictures[0].url,
              equity1: pictures[1].url,
              equity2: pictures[2].url,
              couponCount: useCount,
              couponText: intro,
              amount: buyMoney,
              merchantId: merchantId,
              isPeopleReceive: isPeopleReceive
            });
            //判断用户是否已经领取
            if (!isPeopleReceive){
              _this.setData({ btnText: '立即使用' })
              _app.navigateTo(1, "../mycardbag/mycardbag", "?ids=" + _this.data.couponId)
            }else{
              if (buyMoney > 0) {
                _this.setData({ btnText: buyMoney + '元立抢' })
              } else {
                _this.setData({ btnText: '立即领取' })
              }
            }

            htmlParse.wxParse('ruleInfoHtml', 'html', _data.ruleInfo, _this, 5);
          }
        }
      },
      error: function (err) {
        console.log(err);
      },
      final: function () {
        //隐藏loading
        wx.hideLoading();
      }
    });
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
  /**主图点击事件 */
  indexImgClick: function () {
    console.log('主图点击...');
    if (_app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    //领取优惠券
    if (this.data.isPeopleReceive){
      this.getCoupon();
    }
    //如果已领，跳转优享卡
    else{
      _app.navigateTo(1, "../mycardbag/mycardbag", "?ids=" + this.data.couponId)
    }

  },
  //领取优惠券
  getCoupon: function () {
    let _this = this;
    let _id = this.data.couponId;//券id
    let _user = _app.globalData.userInfo;
    //开关
    if (!this.data.isGetKey) {
      return;
    } else {
      _this.setData({
        isGetKey: false
      });
    }
    //params
    let _params = {
      pageKey: _this.data.pageKey,
      amount: _this.data.amount,
      merchantId: _this.data.merchantId,
      payType: _this.data.payType,
      peopleId: _user.peopleId,
      orderItems: [{
        number: _this.data.number,
        couponId: _this.data.couponId
      }]
    };
    if (_id || _id == 0 && _user) {
      //show loading
      wx.showLoading({
        title: '领取优享卡中...',
        mask: true
      })
      request({
        url: 'submitConponUrl',
        method: 'post',
        data: _params,
        success: function (data) {
          //hidde loading
          wx.hideLoading();
          console.log(data);
          if (data.statusCode == 200 && data.data) {
            let _data = data.data;
            if (_data.flag) {
              let _code = _data.code;
              if (_code == 2) {
                //支付
                let { nonceStr, package1, paySign, prepayId,
                  signType, timeStamp, orderId} = _data.data;
                console.log('ord', orderId);
                wx.requestPayment({
                  timeStamp: timeStamp,
                  nonceStr: nonceStr,
                  package: package1,
                  signType: signType,
                  paySign: paySign,
                  success: function (res) {
                    //支付loading
                    wx.showLoading({
                      title: '支付确认中',
                      mask: true
                    })
                    //订单回传
                    request({
                      url: 'payCallBack',
                      method: 'get',
                      data: {
                        orderId: orderId
                      },
                      success: function (data) {
                        //隐藏yingc支付loading
                        wx.hideLoading();
                        console.log(data);
                        //跳转我的优惠券列表
                        // wx.switchTab({
                        //   url: '/pages/myIndex/myIndex',
                        // });
                        _app.navigateTo(1, "../mycardbag/mycardbag", "?ids=" + _this.data.couponId)
                      },
                      error: function (err) {
                        //隐藏yingc支付loading
                        wx.hideLoading();
                        console.log(err);
                      },
                      final: function () {

                      }
                    });
                  },
                  fail: function (err) {
                    //失败消息提示
                    wx.showToast({
                      title: err.errMsg || '领取失败',
                      mask: true,
                      icon: 'none'
                    })
                  },
                  complete: function () { }
                })
              } else {
                //领取成功
                wx.showToast({
                  title: '领取成功',
                  mask: true,
                  icon: 'none',
                  complete: function () {
                    //跳转我的优惠券列表
                    // wx.switchTab({
                    //   url: '/pages/myIndex/myIndex',
                    // });
                    _app.navigateTo(1, "../mycardbag/mycardbag", "?ids=" + _this.data.couponId)
                  }
                });
              }
            } else {
              //领取失败
              let _msg = _data.message;
              //消息提示
              wx.showToast({
                title: _msg,
                mask: true,
                icon: 'none'
              })
            }
          }
        },
        error: function (error) {
          //hidde loading
          wx.hideLoading();
          console.log(error);
          //消息提示
          wx.showToast({
            title: error.errMsg || '领取失败',
            mask: true,
            icon: 'none'
          })
        },
        final: function () {
          //可以继续点击
          _this.setData({
            isGetKey: true
          });
          //pageKey
          _this.pageKeyFunc();
        }
      });
    }
  },
  //初始方法 -- key生成
  pageKeyFunc: function () {
    if (_app.globalData.userInfo == undefined) return
    let _date = new Date().getTime(),
      _peopleId = _app.globalData.userInfo.peopleId,
      _id = this.data.couponId;
    let _str = _peopleId + '' + _date + '' + _id;
    if (_peopleId || _peopleId == 0) {
      this.setData({
        pageKey: _str
      });
    } else {
      console.log('用户不存在');
    }
  },
  /**扫码 */
  toScanCode: function () {
    wx.scanCode({
      success: function (data) {
        console.log(data);
      },
      fail: function (err) {
        console.log(err);
      }
    })
  },
  // 首页
  toIndexPage: function () {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },
  //根据系统调整高度
  setWindowHeight: function () {
    try {
      const res = wx.getSystemInfoSync();
      let _system = res.system, _key = false;
      if (_system) {
        let _index = res.system.search(/ios/i);
        _key = _index >= 0 ? true : false;
      } else {
        _key = false;
      }
      //根据系统调整高度
      this.setData({
        windowHeightKey: _key
      });
    } catch (e) {

    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '卡支付页',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面浏览
  browseWxappPage(){
    _app.TXYouShu.track('browse_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": _app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面离开
  leaveWxappPage(){
    _app.TXYouShu.track('leave_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": _app.globalData.userInfo.wxMinOpenId
      }
    })
  },

})
