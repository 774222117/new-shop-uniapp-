/**
 * 小程序网络配置
 * https://sit99.huaruntong.cn/web/login/#/suguoAuth?memberId=611375&phone=138125687951&shopCode='8S0323'&merchantCode=1651200000001
 * 
 */
// var host = "https://youquan.sgsugou.com";
//var host = "https://test.sgsugou.com";
var host = "https://front.wyouquan.cn";
//var host = "http://localhost:9090";
// var host = "https://admin.sgsugou.com"; 
var oss = "https://sourced.sgsugou.com"
//var huaRunUrl = "https://uat99.huaruntong.cn/web/login/#/suguoAuth"
var huaRunUrl = "https://cloud.huaruntong.cn/web/activity/login/#/suguoAuth"
var httpConfig = {
  host,
  oss,
  huaRunUrl,
  //商户编码
  huarunCode : '1651200000001',

  imgUrl : `${oss}/img-coupon/`,
  PosterParam: `${host}/app/index/getPosterParam`,
  /********************************** 首页接口 *************************************/
  //首页背景图
  // indexBackGroundUrl: `${oss}/sg/background/sg/background/index.png`,
  indexBackGroundUrl: `${oss}/index/index.png`,

  //首页数据接口
  indexDataUrl: `${host}/app/shop/findAllForIndex`,
  
  //首页我的优享卡
  indexMyPrivilegeCardUrl: `${host}/app/mycoupon/getMyCouponCard`,

  //优惠券所有类别
  catalogsAllUrl: `${host}/app/banners/findAllCatalogs`,
  //类别对应优惠券列表
  catalogsListUrl: `${host}/app/banners/findCouponCatalogsForIndex`,

  //优惠券所有品牌
  brandAllUrl: `${host}/app/banners/findAllBrands`,
  //品牌对应优惠券列表
  brandListUrl: `${host}/app/banners/findCouponBrandForIndex`,

  //名称查询优惠券
  nameListUrl: `${host}/app/banners/findCouponNameForIndex`,
  
  //红包立即抢 判断用户是否够格
  immediateSeizure: `${host}/app/order/checkPartakeActivity`,

  //抢完红包后发送得分 
  sendScore: `${host}/app/order/submitActivity`,

  //老虎机抽奖
  submitActivityMachine : `${host}/app/order/submitActivityMachine`,
  /********************************** 用户登录接口 *************************************/
  //用户登录
  loginUrl : `${host}/app/people/v2/loginIn`,

  //注册
  registerUrl : `${host}/app/people/v2/register`,
  //修改用户信息
  modifyPeopleInfoUrl: `${host}/app/people/v2/modifyPeopleInfo`,
  //修改用户信息1
  updatePeopleInfo: `${host}/app/people/modifyPeopleInfo`,
  //获取用户信息
  getPeopleInfoByIdUrl: `${host}/app/people/v2/getPeopleInfoById`,

  /********************************** 我的优惠券接口 *************************************/
  //我的优惠券首页
  myIndexUrl : `${host}/app/mycoupon/getMyunUsedCouponList`, 

  //过期券列表
  myInvalidCouponListUrl : `${host}/app/mycoupon/getMyInvalidCouponList`, 

  //已使用券列表
  myUsedCouponListUrl : `${host}/app/mycoupon/getMyUsedCouponList`, 

  //优享卡核销页面-有效券号等信息
  myCouponCardList: `${host}/app/mycoupon/getMyCouponCardList`,

  myOpenOfflinePayViewParmUrl: `${host}/app/people/getOpenOfflinePayViewParm`,

  /********************************** 优惠券详情页接口 *************************************/
  //优惠券详细信息
  couponDetailsUrl: `${host}/app/mycoupon/getCouponDetails`,

  //优惠券门店列表
  couponShopsUrl: `${host}/app/mycoupon/getCouponShops`,

  //提交优惠券信息
  submitConponUrl: `${host}/app/order/submitConponOrder`,

  /********************************** 支付订单回调************************************/
  payCallBack: `${host}/app/order/payCallback`,

  /********************************** 活动相关 ************************************/
  //活动主表信息
  activityInfoUrl: `${host}/app/activity/getActivityInfo`,
  
  //活动明细数据
  activityCouponsUrl: `${host}/app/activity/getActivityCoupons`,

  submitCouponManyUrl: `${host}/app/order/submitCouponMany`,
  
  /********************************** 退款 ************************************/
  orderPayRefundUrl: `${host}/app/order/orderPayRefund`,

  /********************************** 店铺 ********************************* */
  //附近的门店，门店搜索
  nearbyShopUrl: `${host}/app/shop/getNearbyShops`,

  //根据id获取门店信息
  shopInfoUrl: `${host}/app/shop/getShopInfo`,

  //店铺首页数据(暂时只有轮播)
  shopIndexUrl: `${host}/app/shop/findAllForIndex`,

  //店铺商品数据
  shopGoodsUrl: `${host}/app/shop/getShopGoods`,

  //获取海报数据
  goodsPosterUrl: `${host}/app/shop/getGoodsPoster`,

  //海报
  posterUrl : `${host}/app/index/getPoster`,

  //提货点
  shopCarrierUrl: `${host}/app/shop/getShopCarrierService`,

  //获取预售商品详情 
  goodsInfoUrl: `${host}/app/shop/getGoodsById`,  

  //正常商品详情
  normalgoodsInfoUrl: `${host}/app/index/getGoodsById`,

  //条码获取商品
  goodsByProductsnUrl : `${host}/app/index/getGoodsByProductsn`,
  
  //获取商品分类
  categoryInfoUrl :`${host}/app/shop/getShopCategory`,

  //分类下的商品Id
  goodsCategoryInfoUrl: `${host}/app/shop/getShopCategoryGoods`,

  //提交订单
  submitShopOrderUrl: `${host}/app/shoporder/submitShopOrder`,

  //订单支付
  payOrderUrl: `${host}/app/shoporder/payOrder`,  
  //取消订单支付
  payFaildOrderUrl: `${host}/app/shoporder/payFaildOrder`,
  //支付回调
  payCallbackUrl: `${host}/app/shoporder/payCallback`,
  //取消未支付订单
  cancelOrderUrl: `${host}/app/shoporder/cancelOrder`,
  //确认订单 
  finishOrderUrl: `${host}/app/shoporder/finishOrder`,
  //订单详细信息
  peopleOrderInfoUrl: `${host}/app/shoporder/getPeopleOrderInfo`,

  //根据订单号查询订单
  searchOrderInfoUrl: `${host}/app/shoporder/searchOrderById`,

  //提交售后
  submitAfterOrderUrl : `${host}/app/shoporder/submitAfterOrder`,

  //申请退款
  applyRefundUrl: `${host}/app/shoporder/applyRefund`,
  //我的优惠券列表
  myShopCouponsUrl: `${host}/app/mycoupon/getMyShopCoupons`,
  //获取订单送券详细信息
  getCouponSetInfoUrl : `${host}/app/shoporder/getCouponSetInfo`,
  //获取退货原因
  findRefundReasonUrl : `${host}/app/shoporder/findRefundReason`,
  //供应商社区购活动
  findSupplierActivityInfourl :`${host}/app/Supplier/shop/getSupplierActivityInfo`,
  //店铺供应商社区购活动列表
  findShopActivityInfourl: `${host}/app/Supplier/shop/getShopActivityInfo`,
  //获取接龙数据
  findSupplierActivityOrders: `${host}/app/shoporder/findSupplierActivityOrders`,
  //获取详情接龙数据
  findPeopleGoods: `${host}/app/shoporder/findPeopleGoods`,
  //根据经纬度获取最近门店信息
  getNearbyShopOne: `${host}/app/index/getNearbyShopOne`,
  //获取门店所有商品
  shopGoodsAllUrl: `${host}/app/index/getShopMoreGoods`,
  //获取订单数
  peopleOrderCountUrl : `${host}/app/shoporder/getPeopleOrderCount`,
  //是否分销人员
  isSharePeopleUrl :`${host}/app/people/v2/isSharePeople`,
  //申请成为团长
  applySharePeople: `${host}/app/share/people/apply`,
  //申请团长短信验证码
  sendApplyMsgCodeUrl: `${host}/app/share/people/sendMsgCode`,
  //团长中心数据
  sharePeopleInfo: `${host}/app/share/people/info`,
  //团员订单明细
  sharePeopleOrderInfoUrl: `${host}/app/share/people/order`,
  //团长申请提现
  applyCashOutMoneyUrl: `${host}/app/share/apply/pay`,
  //团长申请提现记录
  applyCashOutRecordsUrl: `${host}/app/share/people/commission`,
  //获取可订阅的模版消息Id
  getSubscribeTempIdsUrl: `${host}/app/subscribe/getSubscribeTempIds`,
  //订阅的模版消息
  subscribeMsgUrl: `${host}/app/subscribe/subscribeMsg`,
  //获取直播列表信息
  getLiveListUrl: `${host}/app/index/getLiveList`,
  //获取回看视频信息
  getLiveVideoDetailInfoUrl: `${host}/app/index/getLiveVideoDetailInfo`,
  //获取回看视频商品列表
  getLiveVideoGoodsListInfoUrl: `${host}/app/index/getLiveVideoGoodsListInfo`,
  //获取门店下的促销活动商品信息
  getSaleActivityGoodsInfoUrl: `${host}/app/index/getSaleActivityGoodsInfo`,
  //获取门店下的促销活动信息
  getSaleActivityInfoUrl: `${host}/app/index/getSaleActivityInfo`,
  //直播活动页面
  getLiveActivityCategoryUrl: `${host}/app/index/getLiveActivityCategory`,
  //快递查询接口
  getOrderExpressInfoUrl: `${host}/app/shoporder/getOrderExpressInfo`,
  //根据id获取门店营业执照信息
  shopBusinessInfoUrl: `${host}/app/shop/getShopBusinessInfoById`,
  //申请团长界面 请求可选择的提货点列表
  getGoodsCarriersUrl: `${host}/app/share/people/getGoodsCarriers`,
  //团长获取待提货订单
  getWaitPickupOrdersUrl: `${host}/app/shoporder/getWaitPickupOrders`,
  //取货
  finishSendUrl: `${host}/app/shoporder/finishSend`,  
  //团长扫码取货
  checkPickCodeUrl: `${host}/app/shoporder/checkPickCode`,  
  //上传图片
  uploadImageUrl : `${host}/app/image/upload`,
  //兑换码
  activityCodeUrl : `${host}/app/order/submitCouponByCode`,
  //获取配送费
  getDeliverFeeUrl : `${host}/app/shoporder/getDeliverFee`,
  //获取配送优惠
  getDeliverFeeDiscountSetByPeopleUrl : `${host}/app/shoporder/getDeliverFeeDiscountSetByPeople`,  
  //获取坐标距离门店的距离
  getShopDistanceUrl : `${host}/app/shop/getShopDistance`,  
  //获取大类数据
  findHeadCategoryUrl : `${host}/app/category/findHeadCategory`,  
  //获取小类类数据
  findMinCategoryUrl : `${host}/app/category/findMinCategory`,
  //获取类别商品
  getShopCategoryGoodsUrl : `${host}/app/category/getShopCategoryGoods`,
  //获取配送时间可选择列表
  findShopDeliverTimeIntervalUrl:`${host}/app/shoporder/findShopDeliverTimeInterval`,
  //获取门店收费社群自提点列表
  getCommunityCarriersUrl:`${host}/app/share/people/getCommunityCarriers`,
  //申请收费提货点
  applyCarrierUrl:`${host}/app/share/people/applyCarrier`,
  //优惠券列表
  couponListsUrl : `${host}/app/mycoupon/getCouponList`,
  //查询订单 提货时间
  getOrderTakeTimeUrl : `${host}/app/shoporder/getOrderTakeTime`,  
  //获取商品 可领取的优惠券列表
  getGoodsCanReceivedCouponByIdUrl: `${host}/app/index/getGoodsCanReceivedCouponById`,  
  //获取已经领取未使用优惠券总数
  getPeopleCouponUnusedCountUrl: `${host}/app/mycoupon/getPeopleCouponUnusedCount`, 
  //搜索页根据商品条码获取商品数据
  getShopGoodsDtoByProductSnUrl: `${host}/app/index/getShopGoodsDtoByProductSn`,
  //查询订单是否满足换购，如果有换购返回换购商品
  getExchangeActivityUrl: `${host}/app/exchangeActivity/getExchangeActivity`,
  //获取二级页信息
  getSecondBannerInfoUrl: `${host}/app/secondBanner/findAllForIndex`,
  getSecondBannerInfoNewUrl: `${host}/app/secondBanner/findAllForIndexNew`,
  getSecondModuleGoodsListUrl:`${host}/app/secondBanner/getSecondModuleGoodsList`,
  getSecondModuleCouponListUrl:`${host}/app/secondBanner/getSecondModuleCouponList`,
  //附近的团长提货点
  nearbyGroupBuyCarrierUrl: `${host}/app/carrier/getNearbyGroupBuyCarrier`,
  //根据id获取自提货点信息
  getCarrierByIdUrl: `${host}/app/carrier/getCarrierById`,
  //根据id获取自提货点信息，包含距离信息
  getCarrierDistanceByIdUrl: `${host}/app/carrier/getCarrierDistanceById`,
  //根据经纬度获取最近的团长
  getNearByCarrierOneUrl: `${host}/app/carrier/getNearByCarrierOne`,
  //根据门店获取最近的团长
  getShopNearByCarrierOneUrl: `${host}/app/carrier/getShopNearByCarrierOne`,
  //根据门店业态获取一条团购活动
  getGroupBuyActivityByShopFormIdUrl: `${host}/app/secondBanner/getGroupBuyActivityByShopFormId`,
  //团管理订单列表
  groupManageUrl:`${host}/app/share/people/getMyGroupBuyActivity`,
  //切换是否营业
  updateIsBusinessUrl:`${host}/app/share/people/updateIsBusiness`,
  //凑运费提示
  getIsDeliveryFee:`${host}/app/shoporder/getIsDeliveryFee`,
}

/**
 * 缓存key
 */
var cachKey = {
  userInfo : 'userInfo'
}
module.exports = { httpConfig, cachKey }
