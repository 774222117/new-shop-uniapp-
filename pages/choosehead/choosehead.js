const app = getApp()
//根据自提点Id获取自提点信息
const getCarrierDistanceByIdUrl = require('../../utils/config.js').httpConfig.getCarrierDistanceByIdUrl;
const nearbyGroupBuyCarrierUrl = require('../../utils/config.js').httpConfig.nearbyGroupBuyCarrierUrl;
const chooseLocation = requirePlugin('chooseLocation');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //
    carrierId:null,
    //当前团团长信息
    curCarrierInfo:null,
    nearbyCarrierInfos:[],
    bannerId:0,
    currentPage:0,
    curAddress:'',
    latitude:0,
    longitude:0,
    hasData:true,
    isFirstIn:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取门店信息
    let that = this
    if(options.carrierId){
      this.setData({
        carrierId: options.carrierId
      })
    }
    if(options.bannerId){
      this.setData({
        bannerId:options.bannerId
      })
      that.setData({
        latitude:options.latitude,
        longitude:options.longitude
      })
    // wx.getLocation({
    //   success: function (res) {
    //     that.setData({
    //       latitude:res.latitude,
    //       longitude:res.longitude
    //     })
    //     // wx.serviceMarket.invokeService({
    //     //   service: 'wxc1c68623b7bdea7b',
    //     //     api: 'rgeoc',
    //     //     data: {
    //     //       location:(res.latitude+',' + res.longitude),
    //     //       // get_poi:1,
    //     //       poi_options:'policy=1'
    //     //     }
    //     // }).then(resAddr=>{
    //     //   if(resAddr.data.status==0){
    //     //     that.setData({
    //     //       curAddress:resAddr.data.result.address
    //     //     })
    //     //   }else{
    //     //     console.log("逆解析地址出错")
    //     //     console.log(resAddr)
    //     //   }
    //     // }).catch(err=>{
    //     //   console.log("resAddrerr")
    //     //   console.error(err)
    //     // })
    //     if(that.data.carrierId!=null&&that.data.carrierId>0){
    //       //获取团长自提点
    //       that.getCarrierById()
    //     }
    //     that.getNearbyCarrier()
    //     console.log('invokeService')

    //     //that.getNearShopOne()
    //   },
    // })
    if(that.data.carrierId!=null&&that.data.carrierId>0){
      //获取团长自提点
      that.getCarrierById()
    }
    that.getNearbyCarrier()
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
    const location = chooseLocation.getLocation(); // 如果点击确认选点按钮，则返回选点结果对象，否则返回null
    if(location!=null){
      this.setData({
        curAddress:location.address,
        latitude:location.latitude,
        longitude:location.longitude,
        currentPage:0,
        nearbyCarrierInfos:[]
      })
      this.getCarrierById()
      this.getNearbyCarrier()
    }
    let that = this
    if(this.data.isFirstIn){
      wx.serviceMarket.invokeService({
        service: 'wxc1c68623b7bdea7b',
          api: 'rgeoc',
          data: {
            location:(that.data.latitude+',' + that.data.longitude),
            // get_poi:1,
            poi_options:'policy=1'
          }
      }).then(resAddr=>{
        console.log(resAddr)
        if(resAddr.data.status==0){
          that.setData({
            curAddress:resAddr.data.result.address
          })
        }else{
          console.log("逆解析地址出错")
          console.log(resAddr)
        }
      }).catch(err=>{
        console.log(err)
        console.error(err)
      })
    }
    this.setData({
      isFirstIn:false
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

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
    let current = this.data.currentPage
    if(this.data.hasData){
      current+=1
      this.setData({
        currentPage:current
      })
    }
    else{
      return
    }
    this.getNearbyCarrier()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    app.TXYouShu.track('page_share_app_message', {
      "from_type": "menu",
      "share_title": '选择团长',
      "wx_user": {
        "app_id": "wxd45dffdd4692d69d",
        "open_id": app.globalData.userInfo.wxMinOpenId
      }
    })
  },
  /************自定义方法************* */
  /**
   * 根据自提点Id获取自提点团长信息
   */
  getCarrierById: function () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    wx.request({
      url: getCarrierDistanceByIdUrl,
      data: {
        carrierId: that.data.carrierId,
        longitude:that.data.longitude,
        latitude:that.data.latitude
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取自提点数据出错',
          icon: 'none'
        });
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取自提点数据出错',
            icon: 'none'
          });
          return
        }
        that.setData({
          curCarrierInfo:res.data.data
        })
      }
    })
  },

  /**
   * 获取附近的团
   */
  getNearbyCarrier:function(){
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let that = this
    let carrierInfos = this.data.nearbyCarrierInfos
    wx.request({
      url:nearbyGroupBuyCarrierUrl,
      data:{
        longitude:that.data.longitude,
        latitude:that.data.latitude,
        bannerId:that.data.bannerId,
        pn: that.data.currentPage
      },
      fail: function (err) {
        wx.hideLoading()
        wx.showToast({
          title: '获取附近团数据出错',
          icon: 'none'
        });
      },
      success:function(res){
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取附近团数据出错',
            icon: 'none'
          });
          return
        }
        if(res.data.data.length>0){
          carrierInfos = carrierInfos.concat(res.data.data)
          that.setData({
            nearbyCarrierInfos:carrierInfos
          })
        }
        else{
          that.setData({
            hasData:false
          })
        }
      }
    })
  },
  toChooseAddress:function(){
    const key = '55GBZ-3C63U-I2KVE-BTRUV-VYBZ6-TKBNW'; //使用在腾讯位置服务申请的key
    const referer = '苏果优选'; //调用插件的app的名称
    const location = JSON.stringify({
      latitude: this.data.latitude,
      longitude: this.data.longitude
    });
    const category = '购物中心,超市,便利店';

    wx.navigateTo({
      url: `plugin://chooseLocation/index?key=${key}&referer=${referer}&location=${location}&category=${category}`
    });
  },
  //选择团长
  choseCarrierOne:function(e){//选择一个分类
    var that=this;
    let pages = getCurrentPages();// 当前页的数据，
    let prevPage = pages[pages.length - 2];// 上一页的数据，
    prevPage.setData({
      paramsCarrierId: e.currentTarget.dataset.id
    })
    wx.navigateBack({//返回上一页
         delta: 1,
    })
  }
})
