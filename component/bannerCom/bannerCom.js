
const app = getApp()
const util = require('../../utils/util.js')
Component({
  /**
   * 组件的初始数据
   */
  data: {
    imgUrls:[],
    indicatorDots: true,
    autoplay: false,
    interval: 5000,
    duration: 1000,
    isCircular: true,
    autoplay: true
  },
  /**
   * 组件的方法列表
   */
  methods: {
    /**
   * 类型 
   *    1 优惠券详情 
   *    2 品牌优惠券列表 
   *    3 优享卡 
   *    4 活动 
   *    5 个人中心 
   *    6 搜索页  
   *    7 附近门店 
   *    8 扫码 
   *    9 外部URL 
   *    10 打开小程序
   */
    bannerClick:function(e){
      wx.showLoading({//开始加载loding
        title: '加载中',
        mask: true
      })
      if (app.globalData.userInfo == null) {
        // 没有登陆跳转login
        wx.redirectTo({
          url: '../login/login',
          complete() {
            wx.hideLoading()//关闭loding
          }
        })        
        return
      }
      wx.hideLoading()//关闭loding
      console.log(e.currentTarget.dataset.item)
      let bannertype = "优惠券"
      let contentid = ''
      let bannercontent = ''
      let clicktime = util.formatTime(new Date())

      switch (e.currentTarget.dataset.item.bannerType) {
      case 1:
        console.log('1')
        bannertype="优惠券"
        contentid = e.currentTarget.dataset.item.navigateId
        bannercontent = e.currentTarget.dataset.item.bannerText
        wx.navigateTo({
          url: '../coupondetail/coupondetail?source=轮播&id=' + e.currentTarget.dataset.item.navigateId,
          success(){
            console.log('success')
          },
          fail(){
            console.log('fail')
          },
          complete(){
            wx.hideLoading()//关闭loding
          }
        })
      break;
      case 2:
        console.log('2')
        bannertype = "品牌优惠券列表"
        contentid = e.currentTarget.dataset.item.navigateId
        bannercontent = e.currentTarget.dataset.item.bannerText
        wx.navigateTo({
          url: '../couponcenter/couponcenter?tagid=' + e.currentTarget.dataset.item.navigateId,
          success() {
            console.log('success')
          },
          fail() {
            console.log('fail')
          },
          complete() {
            wx.hideLoading()//关闭loding
          }
        })
      break;
      case 3:
        console.log('3')
        bannertype = "优享卡"
        contentid = e.currentTarget.dataset.item.navigateId
        bannercontent = e.currentTarget.dataset.item.bannerText
        wx.navigateTo({
          url: '../paycard/paycard?id=' + e.currentTarget.dataset.item.navigateId,
          success() {
            console.log('success')
          },
          fail() {
            console.log('fail')
          },
          complete() {
            wx.hideLoading()//关闭loding
          }
        })
      break;
      case 4:
        console.log('4')

        //红包雨
        if (e.currentTarget.dataset.item.activity.activeType == 2){
          bannertype = "红包雨"
          contentid = e.currentTarget.dataset.item.activity.id
          bannercontent = e.currentTarget.dataset.item.bannerText
          let activeInfo = JSON.stringify(e.currentTarget.dataset.item.activity);
          wx.navigateTo({
            //url: '../packetRain/index?activeInfo=' + e.currentTarget.dataset.item.activity.id,
            url: '../packetRain/index?activeId=' + e.currentTarget.dataset.item.activity.id,
            success() {
              console.log('success')
            },
            fail() {
              console.log('fail')
            },
            complete() {
              wx.hideLoading()//关闭loding
            }
          })
        }
        //一键领券
        else if (e.currentTarget.dataset.item.activity.activeType == 1){
          bannertype = "一键领券"
          contentid = e.currentTarget.dataset.item.activity.id
          bannercontent = e.currentTarget.dataset.item.bannerText
          wx.navigateTo({
            //url: '../packetRain/index?activeInfo=' + activeInfo,
            url: '../couponmany/couponmany?source=轮播&id=' + e.currentTarget.dataset.item.activity.id,
            success() {
              console.log('success')
            },
            fail() {
              console.log('fail')
            },
            complete() {
              wx.hideLoading()//关闭loding
            }
          })
        }
      break;
      case 7:
        //跳转店铺页面
          bannertype = "团购店铺"
          contentid = -1
          bannercontent = "团购店铺"
          wx.redirectTo({
            url: '../shop/shop',
          })
      break;
        case 8:
          //跳转优惠券首页
          bannertype = "优惠券首页"
          contentid = -1
          bannercontent = "优惠券首页"
          wx.switchTab({
            url: '../index/index',
          })
          break;
      case 9:
        console.log('9')
        bannertype = "外链跳转"
        contentid = e.currentTarget.dataset.item.navigateUrl
        bannercontent = e.currentTarget.dataset.item.bannerText
        wx.navigateTo({
          url: '../webView/webView?path=' + e.currentTarget.dataset.item.navigateUrl,
          success() {
            console.log('success')
          },
          fail() {
            console.log('fail')
          },
          complete() {
            wx.hideLoading()//关闭loding
          }
        })        
      break;
      //跳转小程序
      case 10:
        let _appId = e.currentTarget.dataset.item.navigateName;
        let _path = e.currentTarget.dataset.item.navigateUrl;
        bannertype = "小程序跳转"
        contentid = e.currentTarget.dataset.item.navigateUrl
        bannercontent = e.currentTarget.dataset.item.bannerText
        wx.navigateToMiniProgram({
          appId: _appId,
          path: _path,
          success(res) {
            console.info("navigateToMiniProgram-->sucess")
            console.info(res);
          },
          fail(res){
            console.info("navigateToMiniProgram-->fail")
            console.info(res);
            console.info(res);
          },
          complete() {
            wx.hideLoading()//关闭loding
          }
        })
      break;
      case 11:
        console.log('11')
        bannertype = "团购"
        contentid = e.currentTarget.dataset.item.navigateId
        bannercontent = e.currentTarget.dataset.item.bannerText
        wx.navigateTo({
          url: '../shopadvance/shopadvance?goodsId=' + contentid,
          success() {
            console.log('success')
          },
          fail() {
            console.log('fail')
          },
          complete() {
            wx.hideLoading()//关闭loding
          }
        })
      break
      case 12:
        //品牌优惠图片点击事件          
          bannertype = "内部链接"
          let url = e.currentTarget.dataset.item.navigateUrl
          if(url.indexOf("category/category") != -1){
            wx.switchTab({
              url:e.currentTarget.dataset.item.navigateUrl,
              complete() {
                wx.hideLoading()//关闭loding
              },
              fail(res){
                console.info(res)
              }
            })
          }
          else{
            wx.navigateTo({
              url: url,
              complete() {
                wx.hideLoading()//关闭loding
              },
              fail(res){
                console.info(res)
              }
            })
          }
          
      break
      //供应商活动
      case 13:
        //品牌优惠图片点击事件          
        bannertype = "供应商活动"        
        wx.navigateTo({
          url:  '../jielong/jielong?activityId=' + e.currentTarget.dataset.item.navigateId,
          complete() {
            wx.hideLoading()//关闭loding
          }
        })
      break;
      }
      //上传轮播明细
      wx.reportAnalytics('banner_click', {
        bannertype: bannertype,
        contentid: contentid,
        popcontent: bannercontent,
        userid: app.globalData.userInfo.peopleId,
        nickname: app.globalData.userInfo.nickName,
        clicktime: clicktime,
      })

      //上传首页点击事件

      wx.reportAnalytics('index_click', {
        clickregion: '轮播位',
        userid: app.globalData.userInfo.peopleId,
        nickname: app.globalData.userInfo.nickName,
        clicktime: clicktime,
      });
    }
    
  },
  properties:{
    'imgUrls': {
      type: Array,
    },
    'shopclass':{
      type:Boolean
    }
  }
})
