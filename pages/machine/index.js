// pages/machine/index.js
const app = getApp()
let request = require('../../utils/request.js');
//购物车工具
let shopcartUtil = require('../../utils/shopcart')

//商品详细信息
const goodsInfoUrl = require('../../utils/config.js').httpConfig.goodsInfoUrl;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    title : "恭喜你已中奖",
    content : '优惠券',
    spinDisabled: false,
    isFinish : false,
    orderId : -1,
    modalName: '',
    backgroupImag : 'https://sourced.sgsugou.com/activityBanners/53/3a547115-9269-4bae-86ae-2552b8b9cc53.png',
    //汇总数据
    advanceCartTotal : {
      sumPrice : 0,
      sumProductPrice : 0,
      buyCount : 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.info(app.globalData.systemInfo.windowWidth)
    // console.info(app.globalData.systemInfo.windowHeight)    
    let activeId = options.activeId    
    if(options.orderId){
      this.setData({orderId : options.orderId})
    }    
    wx.showLoading({//开始加载loding
      title: "加载中",
      mask: true
    })   
    this.setData({ activeId: activeId})

    let that = this
    request({
      url: 'activityInfoUrl',
      method: 'Get',
      data: {
        activityId: activeId
      },
      success: function (res){
        if (res.statusCode == 200 && res.data) {
          let _data = res.data.data
          that.setData({ 
            _activeInfo:_data,
            backgroupImag : res.data.data.imgUrl
          })    
          //如果订单抽奖，直接抽取
          if(that.data.orderId != -1){
            that.checkActive()
            //that.getGoodsInfo(424403,-1)
          }
        }
      },
      error: function (err){
        console.log(err)
        wx.hideLoading()
      },
      final: function (res){
        wx.hideLoading()
      },
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
    this.browseWxappPage()
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
   * 判断活动，是否可以开始
   */
  checkActive(){
    // this.goodsToShopCart()
    // return
    var that = this;
    if(that.data.isFinish) {
      wx.showToast({
        title: '您已经参与过游戏，下次再来拉~~~',
        icon : "none"
      })
      return
    }
    if(that.data.modalName != '') return
    if(this.data.isCheck) return
    this.setData({isCheck : true})

    wx.showLoading({//开始加载loding
      title: "加载中",
      mask: true
    })
    let activityId = that.data._activeInfo.id
    request({
      url: 'immediateSeizure',
      method: 'post',
      data: { "peopleId": app.globalData.userInfo.peopleId, "activityId": activityId },//目前写死为1
      success: function (data) {
        if (data.data.flag){
          wx.hideLoading()//关闭loding
          that.setData({
            visible: true //  隐藏界面
          })
          console.log('弹出抽奖窗体')
          that.showModal('Modal')                     
          that.setData({isCheck : false})
        }else{
          that.setData({
            title: data.data.message
          })
          wx.hideLoading()//关闭loding          
          wx.showToast({
            title: that.data.title,
            mask: true,
            icon: 'none',
            duration: 2000
          })
          that.setData({isCheck : false})
        }
      },
      error: function (err) {
        wx.hideLoading()//关闭loding
        console.log(err);
        that.setData({isCheck : false})
      }
    })   
  },  

  /**
   * 开始游戏
   */
  start: function(){
    const { spinDisabled } = this.data
    // 点击开始后不可点击
    if (spinDisabled) return false
    // 随机设置奖项 该数据应该从后台接口获取
    let result = []
    for (var i = 0; i < 3; i++) {
        result.push(Math.floor(Math.random() * 6 + 1))
    }
    this.setData({ spinDisabled: true, result: result })
    // 触发组件开始方法
    this.selectComponent('#sol-slot-machine').start()
  },

  // 结束
  doFinish() {   
    let that = this 
    this.setData({
        spinDisabled: false,
        isFinish : true
    })
    // this.hideModal();
    // this.showModal('DialogModal')

    wx.showLoading({//开始加载loding
      title: "加载中",
      mask: true
    })
    request({
      url: 'submitActivityMachine',
      method: 'post',
      data: {
        "peopleId": app.globalData.userInfo.peopleId,
        "activityId": that.data.activeId, //目前写死为1
        "pageKey": app.globalData.userInfo.peopleId + '' + +new Date,
        "orderId" : this.data.orderId,
        "shopId" : app.globalData.shopInfo.id
      },
      success(data) {
        if (data.data.flag) {
          wx.hideLoading()//关闭loding  
          if(data.data.code == 1){
            wx.showModal({
              title: '提示',
              content: "很遗憾，没有中奖，谢谢参与!",
              confirmText: '确定',
              showCancel : false,
              success: function(res){
                if(res.confirm){
                  wx.switchTab({
                    url: '../index/index',
                  })
                }
              }                  
            })
            return
          }
          //赠送商品
          if(data.data.data.goodssn){
            //没有库存，提示谢谢参与
            let goodsInfo = data.data.data            
            that.setData({
              title : "恭喜你已中奖",
              content :  goodsInfo.title,    
              btnName : "前往查看",
              goodsInfo : goodsInfo
            })                     
          }else{
            that.setData({
              title : "恭喜你已中奖",
              content :  data.data.data.name + '-' + data.data.data.intro,
              btnName : "前往查看"
            })
          }
          
          that.hideModal();
          that.showModal('DialogModal')
        } 
        else {
          wx.hideLoading()//关闭loding
          that.hideModal();
          wx.showLoading({//开始加载loding
            title: data.data.message,
            mask: true
          })
          setTimeout(function () {
            wx.hideLoading()//关闭loding
            that.finish()
          }, 2000)
        }
      },
      error: function (err) {
        wx.hideLoading()//关闭loding
        that.hideModal();
        console.log(err);
      }
    })
    
    
  },

  toMyIndex(){
    this.hideModal()
    //如果赠送商品，生成订单
    if(this.data.goodsInfo){
      this.goodsToShopCart()
    }else{
      wx.navigateTo({
        url: '/pages/mycoupon/mycoupon',
      })      
    }
    
  },
  
  goodsToShopCart(){
    //清空购物车
    shopcartUtil.clearShopCart(shopcartUtil.cartType.Advance)
    shopcartUtil.addShopCart(this.data.goodsInfo,shopcartUtil.cartType.Advance,true)
    wx.redirectTo({
      url: '../shoppay/shoppay?cartTypeName='+shopcartUtil.cartType.Advance+
      '&source=1&deliveryWay='+this.data.goodsInfo.deliveryWay +
      '&originalOrderId=' + this.data.orderId
    })
  },
  showModal(name) {
    this.setData({
      modalName: name
    })
  },

  hideModal(e) {
    this.setData({
      modalName: ''
    })
  },

  /**
   * **********************测试用
   */
  getGoodsInfo: function (goodsId,shopId){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    if(!shopId){
      shopId = -1
    }
    let that = this
    wx.request({
      url: goodsInfoUrl,
      data: {
        goodsId: goodsId,
        peopleId: app.globalData.userInfo.peopleId,
        shopId : shopId
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取商品数据出错',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取门商品据出错',
            icon: 'none'
          });
          return
        }
       
        that.setData({           
          goodsInfo: res.data.data,
          goodsId : res.data.data.id
        })                        
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    this.shareAppMessage()
  },
  //有数--页面分享(事件page_share_app_message)
  shareAppMessage(){
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '老虎机',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d", 
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  }

})