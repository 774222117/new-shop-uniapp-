const app = getApp()

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    'item': {
      type: Object
    },
    // 'seckillCountObj': {
    //   type: Object
    // },
  },
  ready: function () { this.seckillCount(this.data.item.shopGoodsListDto.advanceEndTime) },
  /**
   * 组件的初始数据
   */
  data: {
    item: {},
    seckillCountObj: {
      yy: '00',
      mm: '00',
      dd: '00',
      hh: '00',
      mm: '00',
      ss: '00'
    },//秒杀倒计时对象
  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 秒杀倒计时
    seckillCount: function (times) {
      var that = this
      var endTime = +new Date(times)
      var nowTime = endTime - +new Date()
      var add0 = function (m) { return m < 10 ? '0' + m : m }
      if (nowTime > 1000) {
        var time = new Date(nowTime);
        // let seckillCountObjs = {
        //   yy: add0(time.getFullYear()),
        //   mm: add0(time.getMonth() + 1),
        //   dd: add0(time.getDate()),
        //   hh: add0(time.getHours()),
        //   mm: add0(time.getMinutes()),
        //   ss: add0(time.getSeconds())
        // }
        let seckillCountObjs = {
          yy: Math.floor(nowTime/ 1000 / 60 / 60 / 24),
          mm: add0(time.getMonth() + 1),
          dd: add0(time.getDate()),
          hh: add0(Math.floor(nowTime / 1000 / 60 / 60)),
          mm: add0(Math.floor(nowTime / 1000 / 60 % 60)),
          ss: add0(Math.floor(nowTime / 1000 % 60))
        }
         
        that.setData({
          seckillCountObj: seckillCountObjs
        })
        setTimeout(function () {
          that.seckillCount(endTime)
        }, 1000)
      } else {
        return
      }
    },
    //社区购 立即参团跳转
    jumpToDetail: function (e) {
      wx.showLoading({//开始加载loding
        title: '加载中'
      })
      if (app.globalData.userInfo == null) {
        wx.navigateTo({
          url: '../login/login',
          complete() { wx.hideLoading() }//关闭loding
        })
        return
      }
      let activityId = e.currentTarget.dataset.activityid
      wx.navigateTo({
        url: '../advancegoods/advancegoods?goodsId=' + activityId
        // url: '../jielong/jielong?activityId=' + activityId
      })
    },
  }
})
