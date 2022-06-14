//获取应用实例
const app = getApp()
const registerUrl = require('../../utils/config.js').httpConfig.registerUrl;
const loginUrl = require('../../utils/config.js').httpConfig.loginUrl;
const userKey = require('../../utils/config.js').cachKey.userInfo;
const div = require('../../utils/util.js').div;
Page({
  data: {
    unAuthorized: true,
    unBindPhone: false,
    getPhontNumError: false,
    disableds: false,
    //以下注册所需要的信息
    openId: "",
    sessionkey: "",
    userData: {},
    encryptedData: "",
    iv: "",
    canIUseGetUserProfile: false,
    isShow: true, //是否勾选协议
  },
  onLoad: function () {
    // 判断用户信息存在与否
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    }
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },
  unAuthorizeds: function (e) {
    var that = this;
    console.log('unAuthorized');
    that.setData({
      unAuthorized: false
    });
    that.setData({
      unBindPhone: true
    });
    that.setData({
      getPhontNumError: false
    });
  },
  unBindPhones: function (e) {
    var that = this;
    console.log('unBindPhone');
    that.setData({
      unAuthorized: false
    });
    that.setData({
      unBindPhone: false
    });
    that.setData({
      getPhontNumError: true
    });
  },
  getPhontNumErrors: function (e) {
    var that = this;
    console.log('getPhontNumError');
    that.setData({
      unAuthorized: true
    });
    that.setData({
      unBindPhone: false
    });
    that.setData({
      getPhontNumError: false
    });
  },
  /**
   * 后台登录
   */
  loginBySystem: function () {
    wx.showLoading({ //开始加载loding
      title: '加载中',
      mask: true
    })
    var that = this
    let bankToken = app.globalData.bankToken
    wx.login({
      success: res => {
        wx.request({
          url: loginUrl,
          data: {
            code: res.code,
            bankToken: bankToken,
            icon: that.data.userData.avatarUrl
          },
          header: {
            'content-type': 'application/json'
          },
          success: function (res) {
            console.log(res)
            if (!!res.data.data.phone) {
              res.data.data.phone = Math.round(div(res.data.data.phone, res.data.data.peopleId));
            }
            if (res.data.code == 1) {
              //记录openID，和 sessionkey
              that.setData({
                openId: res.data.data.openId,
                sessionkey: res.data.data.sessionKey,
              })
              console.info("openId:" + that.data.openId)
              console.info("sessionkey:" + that.data.sessionkey)
              //按钮可见
              that.setData({
                disableds: false
              });
              //修改文字
              that.unAuthorizeds()
            } //获取到了信息
            else if (res.data.code == 2) {
              that.setData({
                userInfo: res.data.data,
                hasUserInfo: true,
              });
              that.data.userInfo.icon = that.data.userData.avatarUrl
              app.setUserInfo(that.data.userInfo)
              let redirectUrlStr = that.redirectUrlFun();
              wx.redirectTo({
                url: redirectUrlStr,
                success: function () {
                  console.info("success")
                },
                fail: function () {
                  wx.switchTab({
                    url: redirectUrlStr,
                  })
                }
              })
            }
            //服务器错误
            else if (res.data.code == 0) {
              console.info(res.data.message)
              //按钮可见
              that.setData({
                disableds: false
              });
            }

            that.loginWxapp();

          }
        })
        wx.hideLoading() //关闭loding
      }
    })
  },

  registerUser: function () {
    var that = this
    that.setData({
      disableds: true
    });

    wx.request({
      url: registerUrl,
      method: 'POST',
      data: {
        bankToken: app.globalData.bankToken,
        nickName: this.data.userData.nickName,
        avatarUrl: this.data.userData.avatarUrl,
        openId: this.data.openId,
        sessionKey: this.data.sessionkey,
        encryptedData: this.data.encryptedData,
        iv: this.data.iv,
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.flag) {
          if (!!res.data.data.phone) {
            res.data.data.phone = Math.round(div(res.data.data.phone, res.data.data.peopleId));
          }
          that.setData({
            userInfo: res.data.data,
            hasUserInfo: true
          })
          app.setUserInfo(that.data.userInfo)
          console.info(res);
          that.setData({
            disableds: false
          });
          let redirectUrlStr = that.redirectUrlFun();
          wx.redirectTo({
            url: redirectUrlStr,
            success: function () {
              console.info("success")
            },
            fail: function () {
              wx.switchTab({
                url: redirectUrlStr,
              })
            }
          })
        } else {
          that.setData({
            disableds: false
          });
          wx.showToast({
            title: "注册出错：" + res.data.message,
          })
          console.info("注册出错：" + res.data.message)
        }

        that.registerWxapp();
      }
    })
  },
  getUserProfile(e) {

    let that = this
    if (!that.data.isShow) {
      wx.showToast({
        title: '请先阅读并同意协议',
        icon: 'none'
      })
      return
    }
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        that.loginBySystem()
        that.setData({
          userData: res.userInfo
        })
      }
    })
  },
  /**
   * 获取用户信息
   */
  getUserInfo: function (e) {
    var that = this;
    if (!that.data.isShow) {
      wx.showToast({
        title: '请先阅读并同意协议',
        icon: 'none'
      })
      return
    }
    that.setData({
      disableds: true
    });
    if (e.detail.encryptedData) {
      that.loginBySystem()
      that.setData({
        userData: e.detail.userInfo
      });
    } else {
      that.setData({
        disableds: false
      });
    }
    // that.unAuthorizeds()     
  },

  /**
   * 获取手机号
   */
  getPhoneNumber(e) {
    if (!this.data.isShow) {
      wx.showToast({
        title: '请先阅读并同意协议',
        icon: 'none'
      })
      return
    }
    if (e.detail.encryptedData) {
      this.setData({
        iv: e.detail.iv,
        encryptedData: e.detail.encryptedData
      })
      this.registerUser()
      console.info("iv:" + this.data.iv)
      console.info("encryptedData:" + this.data.encryptedData)
    }
  },
  //拼接参数方法
  redirectUrlFun: function () {
    var redirectUrl = '/' + app.data.path;
    var parameter = '';
    if (app.data.query != '') {
      for (var key in app.data.query) {
        if (parameter != "") parameter += "&"
        parameter += key + "=" + app.data.query[key];
      }
      if (parameter != "")
        redirectUrl += "?" + parameter;
    }
    return redirectUrl
  },
  //拒绝授权
  refuseJurisdiction: function () {
    var pages = getCurrentPages();
    var optionsid = '';
    if (!!pages[pages.length - 2]) {
      optionsid = pages[pages.length - 2].options.id;
      pages = pages[pages.length - 2].route;
    } else {
      pages = '';
    }


    if (pages.indexOf('myIndex') > 0) {
      wx.switchTab({
        url: '../../pages/index/index'
      })
    } else if (pages.indexOf('index') > 0) {
      wx.switchTab({
        url: '../../pages/index/index'
      })
    } else if (pages == '') {
      wx.switchTab({
        url: '../../pages/index/index'
      })
    } else if (pages.indexOf('category') > 0) {
      wx.switchTab({
        url: '../../pages/category/category'
      })
    } else {
      wx.navigateTo({
        url: '../../' + pages + '?id=' + optionsid
      })

    }

  },

  //有数--用户登录(事件login_wxapp)
  loginWxapp() {
    app.TXYouShu.track('login_wxapp', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  /**
   * 切换勾选协议
   */
  changeCheck: function () {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  //有数--用户注册（事件register_wxapp）
  registerWxapp() {
    app.TXYouShu.track('register_wxapp', {
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  /**
   * 页面跳转
   */
  jumpPage(e) {
    let url = e.currentTarget.dataset.url
    wx.navigateTo({
      url
    })
  }
})