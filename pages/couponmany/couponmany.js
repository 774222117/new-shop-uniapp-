/**
 * 一键领券页面
 */
//请求模块
let util = require('../../utils/util.js')
let request = require('../../utils/request.js');
const imgUrl = require('../../utils/config.js').httpConfig.imgUrl;
//app对象
let _app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: imgUrl,
    //活动Id
    activityId: -1,
    //活动主表数据
    activityInfo: {},
    //活动优惠券数据
    activityCoupons: [],
    //根据系统调整高度
    windowHeightKey: false,
    //pageKey
    pageKey: '',
    //pn 页码 
    pn: 0,
    //领取开关
    isGetKey: true,
    contentHeight: 365,
    categoryItemInfoData: [],
    btnText: '返回',
    //上级页面： index myIndex
    superiorPage: 'index',
    //按钮事件类型： 1 购买优惠券 2 返回 3 申请退款
    btnType: 1,
    //订单号
    orderId: -1,
    source: '其他'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let _id = options.id;
    if (options.scene) {
      _id = options.scene;
    }
    //来源
    if (options.source) {
      this.setData({
        source: options.source
      })
    }

    //判断上级页面
    if (options.superiorPage) {
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
    //记录活动Id
    _this.setData({
      activityId: _id
    });
    //初始化key
    _this.pageKeyFunc();

    //获取活动主表数据
    _this.getActivityInfo(_this.data.activityId);

    //获取活动优惠券数据
    _this.getActivityCoupons(_this.data.activityId)

    // 设置内容的高度
    _this.setContentHeight()
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


    this.shareAppMessage();
    let that = this
    return {
      title: that.data.activityInfo.description,
      // path: urlPath,
      imageUrl: that.data.activityInfo.shareImgUrl,
      success: (res) => {
        console.log("转发成功", res);


      },
      fail: (res) => {
        console.log("转发失败", res);
      }
    }


  },
  //有数--页面分享(事件page_share_app_message)
  shareAppMessage() {
    _app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '一键领券页面',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": _app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  lower: function () {
    // let _this = this;
    // _this.getActivityCoupons(_this.data.activityId)
  },
  /***************************************自定义方法************************************************* */
  //初始方法 -- key生成
  pageKeyFunc: function () {
    if (_app.globalData.userInfo == undefined) return
    let _date = new Date().getTime(),
      _peopleId = _app.globalData.userInfo.peopleId,
      _id = this.data.activityId;
    let _str = _peopleId + '' + _date + '' + _id + 'activity';
    if (_peopleId || _peopleId == 0) {
      this.setData({
        pageKey: _str
      });
    } else {
      console.log('用户不存在');
    }
  },

  //根据系统调整高度
  setWindowHeight: function () {
    try {
      const res = wx.getSystemInfoSync();
      let _system = res.system,
        _key = false;
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

  //获取活动主表数据
  getActivityInfo: function (activityId) {
    let _this = this;
    let peopleId = -1;
    let peopleName = '';
    if (_app.globalData.userInfo != null) {
      peopleId = _app.globalData.userInfo.peopleId
      peopleName = _app.globalData.userInfo.nickname
    }

    request({
      url: 'activityInfoUrl',
      method: 'Get',
      data: {
        activityId: _this.data.activityId
      },
      success: function (res) {
        console.info(res.data.data)
        if (res.data.flag) {
          _this.setData({
            activityInfo: res.data.data
          })
          _this.setBtnText()
          //上传数据分析
          wx.reportAnalytics('coupon_many', {
            activityid: activityId,
            activityname: _this.data.activityInfo.description,
            userid: peopleId,
            nickname: peopleName,
            source: _this.data.source,
            gotime: util.formatTime(new Date()),
          });
        } else {
          wx.showToast({
            title: res.data.message || '获取活动数据出错！',
            mask: true,
            icon: 'none'
          });
        }

      },
      fail: function (err) {
        console.info(err)
      }
    })
  },

  //获取活动优惠券数据
  getActivityCoupons: function (activityId) {
    let _this = this;
    request({
      url: 'activityCouponsUrl',
      method: 'Get',
      data: {
        activityId: _this.data.activityId,
        pn: _this.data.pn
      },
      success: function (res) {
        if (res.data.rows != "") {
          console.info(res.data.rows)
          let newActivityCoupons = _this.data.activityCoupons.concat(res.data.rows);
          let pn = _this.data.pn + 1;
          _this.setData({
            activityCoupons: newActivityCoupons,
            pn: pn
          })
          // console.info(_this.data.activityCoupons)                 
        } else {
          wx.showToast({
            title: '获取优惠券数据出错！',
            mask: true,
            icon: 'none'
          });
        }
      },
      fail: function (err) {
        console.info(err)
      }
    })
  },

  /**
   * 根据状态判断按钮显示
   */
  setBtnText() {
    // return
    //目前按钮都叫返回，tsp 2020年8月20日
    let _this = this;
    //我的页面
    if (_this.data.superiorPage == "myIndex") {
      if (_this.data.activityInfo.buyMoney == 0) {
        _this.setData({
          btnText: '返回',
          btnType: 2
        })

      } else {
        _this.setData({
          btnText: '申请退款',
          btnType: 3
        })
      }
    } else {
      if (_this.data.activityInfo.buyMoney == 0) {
        _this.setData({
          btnText: '一键领券',
          btnType: 1
        })
      } else {
        _this.setData({
          btnText: _this.data.activityInfo.buyMoney + '元立抢',
          btnType: 1
        })
      }
    }
  },

  /**
   * 根据类型判断是否退款或者去首页
   */
  refundOrBack: function () {
    let _this = this
    if (this.data.btnType == 1) {
      return false
    } else if (this.data.btnType == 2) {
      //返回
      wx.navigateBack({})
      return true
    }
    //退款
    else if (this.data.btnType == 3) {
      wx.showModal({
        title: '退款',
        content: '您确定需要退款吗？',
        success: function (res) {
          //取消
          if (res.cancel) {
            return
          }
          //TODO : 接入退款
          wx.showLoading({
            title: '正在申请退款券...',
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

  /**
   * 提交数据 
   */
  submitActivity: function () {

    // wx.navigateBack({
    //   delta: 1
    // })
    // return
    //以下是一键领券实现，目前改成返回上一页 tsp 2020.08.20
    if (_app.globalData.userInfo == null) {
      // 没有登陆跳转login
      wx.navigateTo({
        url: '../login/login'
      })
      return
    }
    if (this.refundOrBack()) return;

    let _this = this;
    //开关
    if (!this.data.isGetKey) {
      return;
    } else {
      _this.setData({
        isGetKey: false
      });
    }
    if (_this.data.activityId == undefined || _this.data.activityId == "") {
      wx.showToast({
        title: '没有活动参数',
        mask: true,
        icon: 'none'
      });
      return;
    }

    if (JSON.stringify(_this.data.activityInfo) == "{}") {
      wx.showToast({
        title: '没有活动数据',
        mask: true,
        icon: 'none'
      });
      return;
    }

    if (JSON.stringify(_this.data.activityCoupons) == "[]") {
      wx.showToast({
        title: '没有活动优惠券数据',
        mask: true,
        icon: 'none'
      });
      return;
    }

    //优惠券数据
    let orderItems = []
    _this.data.activityCoupons.forEach(function (value, i) {
      let coupon = {
        number: 1,
        couponId: value.id
      }
      orderItems.push(coupon)
    })
    //组织参数
    let _params = {
      pageKey: _this.data.pageKey,
      activityId: _this.data.activityId,
      amount: _this.data.activityInfo.buyMoney,
      merchantId: _this.data.activityInfo.merchantId,
      payType: 2,
      peopleId: _app.globalData.userInfo.peopleId,
      orderItems: orderItems
    }

    wx.showLoading({
      title: '正在领取优惠券...',
      mask: true
    })
    //提交数据
    request({
      url: 'submitCouponManyUrl',
      method: 'post',
      data: _params,
      success: function (res) {
        wx.hideLoading();
        if (res.statusCode != 200) {
          wx.showModal({
            content: "服务器状态异常",
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

        if (!res.data) {
          wx.showModal({
            content: "服务器返回数据异常",
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

        let result = res.data;
        if (!result.flag) {
          wx.showModal({
            content: result.message || "领取优惠券失败",
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
          return
        }

        //无需支付
        if (result.code != 2) {
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
          return
        }
        //支付
        else if (result.code == 2) {
          let {
            nonceStr,
            package1,
            paySign,
            prepayId,
            signType,
            timeStamp,
            orderId
          } = result.data;
          wx.requestPayment({
            timeStamp: timeStamp,
            nonceStr: nonceStr,
            package: package1,
            signType: signType,
            paySign: paySign,
            success: function (res) {
              wx.hideLoading();
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
                fail: function (err) {
                  //隐藏支付loading
                  wx.hideLoading();
                  console.log(err);
                  wx.showModal({
                    content: err.message || "支付优惠券失败，点击确定领取其他优惠券",
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
              });
            },
            //支付失败
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
        }

      },

      //request--error
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
        //可以继续点击
        _this.setData({
          isGetKey: true
        });
        //pageKey
        _this.pageKeyFunc();
      }
    })
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
  categoryDefaultItemsClick: function (e) {
    _app.navigateTo(1, "../coupondetail/coupondetail", "?id=" + e.currentTarget.dataset.id + '&superiorPage=activity1')
  },
  // 设置内容高度
  setContentHeight: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (res) {
        const query = wx.createSelectorQuery()
        query
          .selectAll('.topImg,.detail-footer')
          .boundingClientRect((result) => {
            _this.setData({
              contentHeight: res.windowHeight - result[0].height - result[1].height
            });
          })
          .exec();
      }
    })
  },

  //有数--页面浏览
  browseWxappPage() {
    _app.TXYouShu.track('browse_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": _app.globalData.userInfo.wxMinOpenId
      }
    })
  },

  //有数--页面离开
  leaveWxappPage() {
    _app.TXYouShu.track('leave_wxapp_page', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": _app.globalData.userInfo.wxMinOpenId
      }
    })
  },

})