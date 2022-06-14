/**
 * 我的优享卡列表
 */
let request = require('../../utils/request.js');
let qrcode = require('../../utils/index.js');
const imgUrl = require('../../utils/config.js').httpConfig.imgUrl;
//app对象
let _app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgUrl : imgUrl,
    //优享卡展开开关
    isCardShow:false,
    //优享卡list
    cardDataList:[
      {
        intro: '', //描述
        remainingCount : '', //剩余次数
        couponStartTime : '', // 有效开始时间
        couponEndTime : '', // 有效结束时间
        returnCash : '',  //返现状态
        couponCode : '', //二维码数字
        picture: 'http://sourced.sgsugou.com/coupon/pictures/2494-4.png' //背景图
      }
    ],
    //ids
    ids:'-1',
    //跳转详情页需要的id
    cordId:'',
    //qrcode
    showqrcode:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this;
    let _user = _app.globalData.userInfo;
    //url传参
    _this.setData({
      ids: options.ids || '-1'
    });
    if (_this.ids != '-1'){
      //显示Loading
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      //请求优享卡数据
      request({
        url: 'myCouponCardList',
        data: {
          ids: _this.data.ids,
          peopleId: _user.peopleId
        },
        method: 'get',
        success: function (data) {
          if (data.statusCode == 200 && data.data) {
            let _data = data.data.data;
            if (_data) {
              console.log(_data);
              _data.forEach((item)=>{
                let shopName = item.shopName
                let index = shopName.indexOf('】')
                if(index == -1){
                  index = shopName.indexOf(']')
                }
                if(index > -1){
                  item.shopName = shopName.substring(index+1)
                }
              })

              //赋值
              _this.setData({
                cardDataList: _data
              });
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '卡包',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  //优享卡点击展开事件
  cardClick:function(res){
    let _id = res.currentTarget.dataset.id;
    let _cid = res.currentTarget.dataset.cid;
    if (this.data.isCardShow == _id){
      //赋值
      this.setData({
        isCardShow: false,
        showqrcode: ''
      });
    }else{
      //赋值
      this.setData({
        isCardShow: _id,
        showqrcode: _cid
      });
      //一维码
      qrcode.barcode(_cid, _cid, 694, 135);
    }
  },
  lookDetails:function(res){
    let _cid = res.currentTarget.dataset.couponid;
    wx.showLoading({//开始加载loding
      title: '加载中',
      mask: true
    })
    wx.navigateTo({
      url: "../paycard/paycard?id=" + _cid,
      complete() {
        wx.hideLoading()//关闭loding
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
