/**
 * 优惠券详情
 */
//请求模块
let util = require('../../utils/util.js')

let request = require('../../utils/request.js');
//日期转换模块
let dateParse = require('../../utils/dateParse.js');
//html解析模块
let htmlParse = require('../../component/wxParse/wxParse.js');
//app对象
let _app = getApp();
const imgUrl = require('../../utils/config.js').httpConfig.imgUrl;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl : imgUrl,
    //优惠券钱
    buyMoneyNum:'',
    //优惠券ID
    couponId: '',
    //轮播
    bannerList:[],
    //标题
    indexTitle:'',
    //优惠券内容
    couponContent:{
      productByMoney:'0',
      useType:'',
      intro:'',
      merchantIcon: imgUrl + 'supermarket.png'
    },
    //适用范围
    canUseArea:[
      {
        content: '',
        name: '可用门店: ',
        type:1
      },
      {
        content: '',
        name: '使用时间: ',
        isHide:true
      },
      {
        content: '',
        name: '适用商品: ',
        type:2
      }
    ],
    //适用商品
    canUseProd:[],
    //使用方法
    useMethhodDes:[
      { index: '1', content: "根据页面提示至指定使用门店", isShow: true },
      { index: '2', content: "找到优惠券：微信主页下方，点击【发现】-【小程序】-【苏果优选平台】-【我的】", isShow: true },
      { index: '3', content: "购物结算：点击想要使用的优惠券-收银出示，按优惠券说明使用", isShow: true }
    ],
    //弹框盒子
    alertBoxShow:true,
    alertBoxList:{
      title:'可用门店',
      array:[
        {
          url:'',
          text:'',
          type:1
        }
      ]
    },
    //领取开关
    isGetKey:true,
    //pageKey
    pageKey:'',
    //params
    amount : '',
    merchantId : '',
    number : 1,
    payType: 2,
    peopleId : '',
    isPeopleReceive : true,
    //根据系统调整高度
    windowHeightKey:false,
    btnText : '立即领取',
    //上级页面： index activity myIndex
    superiorPage : 'index',
    //按钮事件类型： 1 购买优惠券 2 返回 3 申请退款
    btnType : 1,
    //订单号
    orderId : -1,
    //是否活动中
    isActivity:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.info(options)
    let _this = this;
    let _id = options.id;
    if (options.scene){
      _id = options.scene;
    }
    //来源
    let source = '其他'
    if(options.source){
      source = options.source
    }
    //判断上级页面
    if (options.superiorPage){
      this.setData({
        superiorPage: options.superiorPage
      })
    }

    if (options.orderId) {
      this.setData({
        orderId: options.orderId
      })
    }
    //根据系统调整高度
    _this.setWindowHeight();
    //url传参
    _this.setData({
      couponId: _id
    });
    //初始化key
    _this.pageKeyFunc();
    //显示loading
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    //请求优惠券详情
    let peopleId = -1;
    let peopleName = '';
    if (_app.globalData.userInfo != null) {
      peopleId = _app.globalData.userInfo.peopleId
      peopleName = _app.globalData.userInfo.nickname
    }
    request({
      url:'couponDetailsUrl',
      method:'Get',
      data: {
        couponId: _this.data.couponId,
        peopleId: peopleId
      },
      success:function(data){
        if (data.statusCode == 200 && data.data){
          let _data = data.data.data;
          if(_data){
            let {
              pictures, name, productByMoney, useType, intro, useShop, couponStartTime,
              couponEndTime, useCode, description, ruleInfo, buyMoney, merchantId, merchantIcon,
              isPeopleReceive
            } = _data;
            //上报数据
            wx.reportAnalytics('coupon_detail', {
              couponid: _this.data.couponId,
              couponname: name,
              userid: peopleId,
              nickname: peopleName,
              source: source,
              gotime: util.formatTime(new Date()),
            });
            //数据绑定
            _this.setData({
              bannerList: pictures,
              indexTitle: name,
              isPeopleReceive: isPeopleReceive,
              couponContent:{
                productByMoney: productByMoney||'0',
                useType: _this.couponTypeChange(useType),
                intro: intro || '未知',
                merchantIcon: merchantIcon || imgUrl + 'supermarket.png'
              },
              canUseProd: useCode && useCode.split(',') || '',
              canUseArea: [
                {
                  content: useShop,
                  name: '可用门店: ',
                  type:1
                },
                {
                  content: dateParse(couponStartTime) + '-' + dateParse(couponEndTime),
                  name: '使用时间: ',
                  isHide: true
                },
                {
                  content: useCode && useCode.split(',')[0],
                  name: '适用商品: ',
                  isHidden: useCode ? false : true,
                  type:2
                }
              ],
              amount: buyMoney,
              merchantId: merchantId,
              buyMoneyNum: data.data.data.buyMoney,
              isActivity:data.data.data.isActivity
            });
            if(_this.data.isActivity==1){
              wx.hideShareMenu({
                menus: ['shareAppMessage', 'shareTimeline']
              })
            }
            //优惠券描述
            htmlParse.wxParse('descriptionHtml', 'html', description, _this, 5);
            //使用说明
            htmlParse.wxParse('ruleInfoHtml', 'html', ruleInfo, _this, 5);
            //设置按钮文字
            _this.setBtnText();
          }
        }
      },
      error:function(err){
        console.log(err);
      },
      final:function(res){
        //关闭loading
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
  /**扫码 */
  toScanCode:function(){
    wx.scanCode({
      success:function(data){
        console.log(data);
      },
      fail:function(err){
        console.log(err);
      }
    })
  },
  // 首页
  toIndexPage:function(){
    wx.switchTab({
      url: '/pages/index/index',
    });
  },

  /**
   * 根据状态判断按钮显示
   */
  setBtnText() {
    let _this = this;
    //我的页面
    if (_this.data.superiorPage == "myIndex") {
      if (_this.data.buyMoneyNum == 0) {
        _this.setData({ btnText: '返回',btnType : 2 })

      }
      else {
        _this.setData({ btnText: '申请退款', btnType: 3 })
      }
    }
    //活动页面过来的
    else if (_this.data.superiorPage == "activity") {
      _this.setData({ btnText: '返回', btnType: 2 })
    }
    else {
      if (_this.data.buyMoneyNum == 0) {
        _this.setData({ btnText: '立即领取', btnType: 1 })
      }
      else {
        _this.setData({ btnText: _this.data.buyMoneyNum + '元立抢', btnType: 1 })
      }
    }
  },





  /**
   * 根据类型判断是否退款或者去首页
   */
  refundOrBack:function(){
    if (this.data.btnType == 1){
      return false
    }
    else if (this.data.btnType == 2) {
      //返回
      wx.navigateBack({})
      return true
    }
    //退款
    else if(this.data.btnType == 3) {
      let _this = this
      wx.showModal({
        title: '退款',
        content: '您确定需要退款吗？',
        success: function (res) {
          //取消
          if(res.cancel){
            return
          }
          //TODO : 接入退款
          wx.showLoading({
            title: '正在申请退款...',
            mask: true
          })

          //提交数据
          request({
            url: 'orderPayRefundUrl',
            method: 'get',
            data: {
              peopleId: _app.globalData.userInfo.peopleId,
              orderId: _this.data.orderId
            },
            success: function (res) {
              wx.hideLoading();
              if (res.statusCode == 200 && res.data) {
                let _data = res.data;
                let _msg = _data.message;
                wx.showModal({
                  content: _msg || "点击查看我的优惠券",
                  confirmText: '确定',
                  cancelText: '取消',
                  success: function (res) {
                    if (res.confirm) {
                      wx.navigateBack({})
                    }
                  }
                })
              }
            },
            error: function (err) {
              wx.hideLoading();
              wx.showModal({
                content: "网络状态异常,点击确定领取其他优惠券",
                confirmText: '确定',
                cancelText: '取消',
                success: function (res) {
                  if (res.confirm) {
                    wx.switchTab({
                      url: '/pages/index/index',
                    })
                  }
                }
              })
            },
            final: function () {
              wx.hideLoading();
            }
          });
        }
      })

      return true
    }
    return false
  },

  //领取优惠券
  getCoupon:function(){
    if (_app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    //判断是否退款
    if (this.refundOrBack()) return;

    let _this = this;
    let _id = this.data.couponId;//券id
    let _user = _app.globalData.userInfo;
    let _couponName = _this.data.indexTitle;

    //开关
    if (!this.data.isGetKey){
      return;
    }else{
      _this.setData({
        isGetKey:false
      });
    }
    //params
    let _params = {
      pageKey: _this.data.pageKey,
      amount: _this.data.amount,
      merchantId: _this.data.merchantId,
      payType: _this.data.payType,
      peopleId: _user.peopleId,
      orderItems:[{
        number: _this.data.number,
        couponId: _this.data.couponId
      }]
    };
    if (_id || _id == 0 && _user){
      //show loading
      wx.showLoading({
        title: '领取优惠券中...',
        mask:true
      })
      request({
        url:'submitConponUrl',
        method:'post',
        data:_params,
        success:function(data){
          //hidde loading
          wx.hideLoading();
          console.log(data);
          if(data.statusCode == 200 && data.data){
            let _data = data.data;
            if (_data.flag){
              let _code = _data.code;
              if(_code == 2){
                //支付
                let { nonceStr, package1, paySign, prepayId, signType, timeStamp, orderId} = _data.data;
                wx.requestPayment({
                  timeStamp: timeStamp,
                  nonceStr: nonceStr,
                  package: package1,
                  signType: signType,
                  paySign: paySign,
                  success: function (res){
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
                        //隐藏支付loading
                        wx.hideLoading();
                        console.log(data);
                        //跳转我的优惠券列表
                        wx.showModal({
                          content: "领取成功，点击确定查看我的优惠券！",
                          confirmText: '确定',
                          cancelText: '取消',
                          success: function (res) {
                            if (res.confirm) {
                              wx.switchTab({
                                url: '/pages/myIndex/myIndex',
                              })
                            }
                          }
                        })
                      },
                      error:function(err){
                        //隐藏支付loading
                        wx.hideLoading();
                        console.log(err);
                        //失败消息提示
                        let _msg = err.message
                        if (_msg == undefined) {
                          _msg = "支付失败，点击确定领取其他优惠券"
                        } else {
                          _msg += ",点击确定领取其他优惠券"
                        }
                        wx.showModal({
                          content: _msg,
                          confirmText: '确定',
                          cancelText: '取消',
                          success: function (res) {
                            if (res.confirm) {
                              wx.switchTab({
                                url: '/pages/index/index',
                              })
                            }
                          }
                        })
                      },

                    });
                  },

                  fail: function (err) {
                    wx.hideLoading();
                    console.log(err);
                    //失败消息提示
                    let _msg = err.message
                    if (_msg == undefined) {
                      _msg = "支付失败，点击确定领取其他优惠券"
                    } else {
                      _msg += ",点击确定领取其他优惠券"
                    }
                    wx.showModal({
                      content: _msg,
                      confirmText: '确定',
                      cancelText: '取消',
                      success: function (res) {
                        if (res.confirm) {
                          wx.switchTab({
                            url: '/pages/index/index',
                          })
                        }
                      }
                    })
                  }
                })
              }else{
                //领取成功
                // wx.showToast({
                //   title: '领取成功',
                //   mask: true,
                //   icon: 'none',
                //   complete:function(){
                //     //跳转我的优惠券列表
                //     wx.switchTab({
                //       url: '/pages/myIndex/myIndex',
                //     });
                //   }
                // });
                let _msg = _data.message;
                wx.showModal({
                  content: "领取成功，点击确定查看我的优惠券！",
                  confirmText: '确定',
                  cancelText: '取消',
                  success: function(res){
                    if(res.confirm){
                      wx.navigateTo({
                        url: '/pages/mycoupon/mycoupon',
                      })
                    }
                  }
                })
              }
            }else{
              //领取失败
              let _msg = _data.message;
              //消息提示
              // wx.showToast({
              //   title: _msg,
              //   mask: true,
              //   icon: 'none'
              // })
              wx.showModal({
                content: _msg || "领取失败，点击确定查看其它优惠券！",
                confirmText: '确定',
                cancelText: '取消',
                success: function (res) {
                  if (res.confirm) {
                    wx.switchTab({
                      url: '/pages/index/index',
                    })
                  }
                }
              })
            }
          }
        },

        error:function(error){
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

        final:function(){
          //可以继续点击
          _this.setData({
            isGetKey: true
          });
          //pageKey
          _this.pageKeyFunc();
        }
      });
    }

    _this.getCouponEvent(_id,_couponName);

  },

  //优惠券类型转换
  couponTypeChange : function (type){
    if(type){
      switch(type){
        case 1:
          return '换购券';
        case 2:
          return '满减券';
        case 3:
          return '折扣券';
      }
    }else{
      return '未知券'
    }
  },
  //可用门店&适用商品
  alertBoxFunc:function(res){
    switch (res.target.dataset.type){
      case 1:
        this.setData({
          alertBoxShow: false,
          alertBoxList: {
            title: '可用门店',
            array: [],
            type: 1
          }
        });
        let _this=this;
        //请求门店数据
        wx.showLoading({
          title: '加载中...',
          mask: true
        })
        request({
          url: 'couponShopsUrl',
          method: 'Get',
          data: {
            couponId: _this.data.couponId
          },
          success: function (data) {
            if (data.statusCode == 200 && data.data) {
              let _data = data.data.data;
              if (_data) {
                //数据绑定
                _this.setData({
                  alertBoxList: {
                    title: '可用门店',
                    array: _data,
                    type: 1
                  }
                });
              }
            }
          },
          error: function (err) {
            console.log(err);
          },
          final: function (res) {
            //关闭loading
            wx.hideLoading();
          }
        });
        break;
      case 2:
        this.setData({
          alertBoxShow:false,
          alertBoxList: {
            title: '适用商品',
            array: this.data.canUseProd,
            type:2
          }
        });
        break;
    }
  },
  //隐藏弹框盒子
  alertBoxHidden:function(){
    this.setData({
      alertBoxShow: true
    });
  },
  //分享
  onShareAppMessage:function(res){
    let intro = "";
    let title = "";
    let couponId = "";
    let imgUrl = "";
    if(this.data.isActivity==1){
      wx.showToast({
        title: '此优惠券不能分享',
        icon:'none'
      })
      return false
    }
    if(res.from == 'button'){
      let _target = res.target.dataset;
      //分享来自于底部按钮
      couponId = _target.cid;
      intro = _target.intro + "--" + _target.title;
      imgUrl = _target.url;
      this.shareAppMessage('优惠券分享',"button");

    }else{
      couponId = this.data.couponId;
      intro = this.data.couponContent.intro + "--" + this.data.indexTitle;
      imgUrl = this.data.bannerList[0].url;
      this.shareAppMessage('优惠券详情',"menu");

    }

    return {
      title: intro,
      path: '/pages/coupondetail/coupondetail?id=' + couponId,
      imageUrl: imgUrl,
      success:function(data){
        console.log('分享成功',data);
      },
      fail:function(err){
        console.log('分享失败',err);
      }
    }
  },
  //初始方法 -- key生成
  pageKeyFunc:function(){
    if (_app.globalData.userInfo == undefined) return
    let _date = new Date().getTime(),
      _peopleId = _app.globalData.userInfo.peopleId,
      _id = this.data.couponId;
      let _str = _peopleId +''+ _date +''+ _id;
    if (_peopleId || _peopleId == 0){
      this.setData({
        pageKey : _str
      });
    }else{
      console.log('用户不存在');
    }
  },
  //根据系统调整高度
  setWindowHeight:function(){
    try{
      const res = wx.getSystemInfoSync();
      let _system = res.system,_key=false;
      if (_system){
        let _index = res.system.search(/ios/i);
        _key = _index >= 0 ? true :false;
      }else{
        _key = false;
      }
      //根据系统调整高度
      this.setData({
        windowHeightKey : _key
      });
    }catch(e){

    }
  },

  //有数--领取优惠券(事件get_coupon)
  getCouponEvent(couponId,couponName) {
    _app.TXYouShu.track('get_coupon', {
      "coupon": {
        "coupon_id": couponId,
        "coupon_name": couponName
      },
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": _app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面分享(事件page_share_app_message)
  shareAppMessage(title, fromType){
    _app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": title,
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": _app.globalData.userInfo.wxMinOpenId
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
  }

})
