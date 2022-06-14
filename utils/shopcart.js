/**
 * 购物车一些方法
 */
const app = getApp()
//商品详细信息
const normalgoodsInfoUrl = require('config.js').httpConfig.normalgoodsInfoUrl;

/**
 * 购物车类型
 */
var cartType = {
  OTO : "OTO",
  GroupBuy : "GroupBuy",
  Advance : "Adavnce",
  ShopRecommend:"ShopRecommend",
  //二级页购物车
  SecondPage:"SecondPage"
}

/**
 * 初始化社群购购物车
 */
function initCartInfo(cartTypeName){
  let shopCarList = app.globalData.shopCarList
  let count = shopCarList.length
  let isExists = false
  let cartInfo;
  for(let i = 0; i < count; i++){
    if(shopCarList[i].name == cartTypeName){      
      isExists = true
      cartInfo = shopCarList[i] 
      break;
    }    
  }
  if(isExists){
    return cartInfo
  }

  cartInfo = {
    name : cartTypeName,
    carts : [],
    cartTotal : {}
  }
  app.globalData.shopCarList.push(cartInfo)
  return cartInfo
}

/**
 * 根据类型获取购物车
 * @param {购物车类型名称} cartTypeName 
 */
function getShopCart(cartTypeName){
  // let carts = []  
  // if(cartTypeName == cartType.OTO){
  //   carts = app.globalData.cartShop
  // }
  // else if(cartTypeName == cartType.GroupBuy){
  //   carts = app.globalData.cartBuy
  // }
  // else if(cartTypeName == cartType.Advance){
  //   carts = app.globalData.advanceCart
  // }
  // return carts    
  let carts = []  
  let shopCarList = app.globalData.shopCarList
  shopCarList.forEach((item)=>{
    if(item.name == cartTypeName){
      carts = item.carts
      return carts
    }
  });
  return carts
}

/**
 * 获取购物车汇总数据
 * @param {购物车类型} cartTypeName 
 */
function getShopCartTotal(cartTypeName){
  // let cartTotal = {}
  // if(cartTypeName == cartType.OTO){
  //   cartTotal = app.globalData.cartShopTotal
  // }
  // else if(cartTypeName == cartType.GroupBuy){
  //   cartTotal = app.globalData.cartBuyTotal
  // }
  // else if(cartTypeName == cartType.Advance){
  //   cartTotal = app.globalData.advanceCartTotal
  // }  
  // return cartTotal
  let cartTotal = {}
  let shopCarList = app.globalData.shopCarList
  shopCarList.forEach((item)=>{
    if(item.name == cartTypeName){
      cartTotal = item.cartTotal
      return cartTotal
    }
  });
  return cartTotal
}
/**
 * 获取购车所有类型总商品数量
 * @param {购物车类型} cartTypeName 
 */
function getTotalBuyCount() {
  let cartTotal = {}
  let totalBuyCount = 0
  //cartTotal = app.globalData.cartShopTotal
  cartTotal = getShopCartTotal(cartType.OTO)
  if (cartTotal.buyCount != undefined) {
    totalBuyCount += cartTotal.buyCount
  }
  //  购物车合计数，暂时只计算oto
  // cartTotal = app.globalData.cartBuyTotal
  // if (cartTotal.buyCount != undefined) {
  //   totalBuyCount += cartTotal.buyCount
  // }
  // cartTotal = app.globalData.advanceCartTotal
  // if (cartTotal.buyCount != undefined) {
  //   totalBuyCount += cartTotal.buyCount
  // }
  return totalBuyCount
}
/**
 * 购物车添加商品
 * @param {购物车数据} carts
 * @param {购物车类型} cartTypeName 
 */
function setShopCart(carts,cartTypeName){
  // if(cartTypeName == cartType.OTO){
  //   app.setCartShop(carts)
  // }
  // else if(cartTypeName == cartType.GroupBuy){
  //   app.setCartBuy(carts)
  // }
  // else if(cartTypeName == cartType.Advance){
  //   app.setAdvanceCart(carts)
  // }
  let shopCarList = app.globalData.shopCarList
  let count = shopCarList.length
  let isExists = false
  for(let i = 0; i < count; i++){
    if(shopCarList[i].name == cartTypeName){
      shopCarList[i].carts = carts
      isExists = true
      break;
    }    
  }
  //不存在廷加一条数据
  if(!isExists){
    let shopCartInfo = {
      name : cartTypeName,
      carts: carts
    }
    app.globalData.shopCarList.push(shopCartInfo)
  }
  //计算购物车合计数据
  caulTotal(cartTypeName)
}

/**
 * 设置购物车汇总数据
 * @param {购物车汇总数据} cartTotal 
 * @param {购物车类型} cartTypeName 
 */
function setShopCartTotal(cartTotal,cartTypeName){
  // if(cartTypeName == cartType.OTO){
  //   app.setCartShopTotal(cartTotal)
  // }
  // else if(cartTypeName == cartType.GroupBuy){
  //   app.setCartBuyTotal(cartTotal)
  // }
  // else if(cartTypeName == cartType.advanceCart){
  //   app.setCartBuyTotal(cartTotal)
  // }
  //判断列表中是否存在
  let shopCarList = app.globalData.shopCarList
  let count = shopCarList.length
  let isExists = false
  for(let i = 0; i < count; i++){
    if(shopCarList[i].name == cartTypeName){
      shopCarList[i].cartTotal = cartTotal
      isExists = true
      break
    }    
  }
  //不存在廷加一条数据
  if(!isExists){
    let shopCartInfo = {
      name : cartTypeName,
      carts: cartTotal
    }
    app.globalData.shopCarList.push(shopCartInfo)
  }
}

/**
 * 根据商品Id获取购物车数据
 * @param {商品ID} goodsId 
 * @param {购物车类型名称} cartTypeName 
 */
function getShopCartGoods(goodsId,cartTypeName){
  let cart = null
  let carts = getShopCart(cartTypeName)
  if(carts == null) return cart;
  //循环获取数据
  carts.forEach((item) => {
    if (item.goodsId == goodsId) {
      cart = item
      return cart
    }
  })
  return cart;
}

/**
 * 根据商品Id获取位置
 * @param {商品ID} goodsId 
 * @param {购物车类型} cartTypeName 
 */
function shopCartIndex(goodsId,carts){ 
  let count = carts.length;
  if(count == 0) return -1
  for(let i = 0; i < count; i++){
    if(carts[i].goodsId == goodsId){
      return i
    }
  }
  return -1;
}

/**
 * 增加购物车
 * @param {购物车单个商品} cart 
 * @param {购物车名称} cartTypeName 
 */
function pushCarts(cart,cartTypeName){
  let carts = getShopCart(cartTypeName)
  carts.push(cart)
  setShopCart(carts, cartTypeName)
  return carts;
}

/**
 * 清空购物车
 * @param {购物车类型} cartTypeName 
 */
function clearShopCart(cartTypeName){
  let carts = getShopCart(cartTypeName)
  carts.length = 0
  setShopCart(carts, cartTypeName) 
}
/**
 * 清空购所有物车
 */
function clearShopCartList(){
  app.globalData.shopCarList.forEach((item)=>{
    item.carts = []
    item.cartTotal = {}    
  });
}
/**
 * 更新商品列表
 * @param {商品列表} goodsInfoList 
 * @param {商品信息} goods 
 */
function modifyGoodsList(goodsInfoList,goods){
  if(goodsInfoList == null && goodsInfoList == undefined) return
  goodsInfoList.forEach((item)=>{
    if (item.id == goods.id) {
      item.buyCount = goods.buyCount
    }
  })
  return goodsInfoList
}

/**
 * 计算汇总数据
 */
function caulTotal(cartTypeName){
  let sumPrice = 0, sumProductPrice = 0, buyCount = 0
  let carts = getShopCart(cartTypeName)
  carts.forEach((item) => {
    if(item.realPrice){
      sumPrice += item.realPrice
    }else{
      sumPrice += item.price
    }
    if(item.realProductPrice){
      sumProductPrice += item.realProductPrice
    }else{
      sumProductPrice += item.productPrice
    }
    
    buyCount += item.total
  })
  let cartTotal = getShopCartTotal(cartTypeName)
  cartTotal.sumPrice = parseFloat(sumPrice.toFixed(2))
  cartTotal.sumProductPrice = parseFloat(sumProductPrice.toFixed(2))
  cartTotal.buyCount = buyCount
  setShopCartTotal(cartTotal, cartTypeName)
}

/**
 * 增加购物车
 * @param {商品信息} goods 
 * @param {购物车类型} cartType 
 */
function addShopCart(goods,cartTypeName,isGift){
  if(!goods.buyCount){
    goods.buyCount=0
  }
  //判断登录
  if (app.globalData.userInfo == null) {
    wx.navigateTo({
      url: '../login/login'
    })
    return goods
  }
  //赠品允许加入购物车
  if(goods.marketPrice == 0){
    if(!isGift){
      wx.showToast({
        title: '赠品不允许购买！',
        icon: 'none'
      });
      return goods
    }
  }
  
  let shopCart = getShopCart(cartTypeName)
  //获取购物车数据
  let cart = getShopCartGoods(goods.id,cartTypeName)

  //最小起订量
  let addTotal = goods.minBuyCount;
  if(addTotal == undefined || addTotal == null || addTotal ==0) {
    goods.minBuyCount = 1
    addTotal = 1
  }

  //用户购买量
  if(goods.userBuy == null || goods.userBuy == undefined)
    goods.userBuy = 0
  
  let peopleBuyCount = goods.userBuy
  let peopleTotal = 0
  //如果购物车不为空，需要加入购物车中的数量
  if(cart != null){
    peopleBuyCount += cart.total + addTotal
    peopleTotal = cart.total
  }
  else{
    peopleBuyCount += addTotal
  }
  if(goods.userMaxBuy == null || goods.userMaxBuy == undefined) {
    goods.userMaxBuy = 0
  }
  //用户购买数量是否大于最大购买数
  if(goods.userMaxBuy > 0 && goods.userMaxBuy < peopleBuyCount){
    wx.showToast({
      title: '该商品已经超过最大购买数！',
      icon: 'none'
    });
    return goods
  }
  
  
  //判断库存
  if (goods.total < addTotal + peopleTotal){
    wx.showToast({
      title: '该商品已经没有库存不能添加！',
      icon: 'none'
    });
    return goods
  }
  //如果没有就添加
  if(cart == null){    
    cart = {}
    cart.goodsId = goods.id;
    //名称
    cart.title = goods.title;
    //图片
    cart.goodsThumb = goods.thumb
    //数量
    cart.total = addTotal;
    //购买价格
    cart.price = goods.marketPrice;
    //原价
    cart.productPrice = goods.productPrice;  
    //营销类型 0 正常售卖 1 团购  2 砍价
    cart.marketType = goods.marketType
    //门店，还是总部
    cart.isPlatform = goods.isPlatform
    //商户id
    cart.merchantId= goods.merchantId
    //供应商ID
    cart.supplierId= goods.supplierId
    //最大购买量
    cart.userMaxBuy = goods.userMaxBuy
    //最小起订量
    cart.minBuyCount = goods.minBuyCount
    //
    cart.userBuy = goods.userBuy
    //商品库存
    cart.goodsTotal = goods.total
    //购买数据    
    goods.buyCount = cart.total
    //是否显示原价
    cart.showProductPrice = goods.showProductPrice
    //放入缓存
    shopCart = pushCarts(cart,cartTypeName)
    //是否赠品
    if(goods.isGift){
      cart.isGift = goods.isGift
    }else{
      cart.isGift = false
    }
    //促销类型
    cart.saleType = 0
    if(goods.saleType){
      cart.saleType = goods.saleType
    }
  }
  else{
    //增加数量    
    cart.total += addTotal;          
    //商品已购数量
    goods.buyCount = cart.total
    let index = shopCartIndex(goods.id,shopCart)
    shopCart[index] = cart;
  }  
  // cart.realPrice = cart.total * cart.price
  // cart.realPrice = parseFloat(cart.realPrice.toFixed(2));
  //计算价格
  cart = caulCartRealPrice(goods,cart,shopCart)
  //原价金额
  cart.realProductPrice = cart.total * cart.productPrice
  cart.realProductPrice = parseFloat(cart.realProductPrice.toFixed(2));
  

  //计算汇总
  setShopCart(shopCart,cartTypeName)
  caulTotal(cartTypeName)    
  return goods
}

/**
 * 减少购物车
 * @param {商品数据} goods 
 * @param {购物车类型} cartTypeName 
 */
function delShopCart(goods,cartTypeName){
  if (goods.buyCount == 0){
    return goods
  }
  let cart = getShopCartGoods(goods.id,cartTypeName)
  if(cart == null) return;
  //获取购物车所有数据
  let shopCart = getShopCart(cartTypeName)

  let addTotal = goods.minBuyCount;
  if(addTotal == undefined || addTotal == null) {
    goods.minBuyCount = 1
    addTotal = 1;
  }

  //删除这条数据
  if(cart.total - addTotal < 1){
    cart.total = 0    
    let index = -1;
    for(let i = 0; i < shopCart.length; i++){        
      if (shopCart[i].goodsId == cart.goodsId){
        index = i;
        break;
      }
    }
    shopCart.splice(index,1)
    goods.buyCount = 0
    caulCartRealPrice(goods,cart,shopCart)
  }else{
    cart.total -= addTotal;
    if(cart.total < cart.minBuyCount){
      cart.total = addTotal
    }
    
    goods.buyCount = cart.total;
    
    //计算价格       
    cart = caulCartRealPrice(goods,cart,shopCart)
    let index = shopCartIndex(goods.id,shopCart)
    shopCart[index] = cart;
  }       


  //计算总数
  setShopCart(shopCart,cartTypeName)
  caulTotal(cartTypeName)     
  return goods
}

/**
 * 
 * @param {商品数据} goods 
 * @param {数量} setTotal 
 * @param {购物车类型} cartTypeName 
 */
function setShopCartNum(goods,setTotal,cartTypeName,isGift){
  if(!goods.buyCount){
    goods.buyCount=0
  }
  //赠品允许加入购物车
  if(goods.marketPrice == 0){
    if(!isGift){
      wx.showToast({
        title: '赠品不允许购买！',
        icon: 'none'
      });
      return goods
    }
  }
  setTotal = parseInt(setTotal)
  let shopCart = getShopCart(cartTypeName)
  //获取购物车数据
  let cart = getShopCartGoods(goods.id,cartTypeName)

  //最小起订量
  let addTotal = goods.minBuyCount;
  if(addTotal == undefined || addTotal == null) addTotal = 1;
  if(setTotal <  addTotal){
    setTotal = addTotal
  }
  //用户购买量
  if(goods.userBuy == null || goods.userBuy == undefined)
    goods.userBuy = 0

  if(goods.userMaxBuy == null || goods.userMaxBuy == undefined) {
    goods.userMaxBuy = 0
  }  
  
  //判断已购
  if(goods.userMaxBuy > 0 && goods.userMaxBuy <= goods.userBuy){        
    wx.showToast({
      title: '该商品已经超过最大购买数！',
      icon: 'none'
    });
    goods.buyCount = 0
    return goods
  }
  //用户购买数量是否大于最大购买数  
  if(goods.userMaxBuy > 0 && goods.userMaxBuy < setTotal){        
    wx.showToast({
      title: '该商品已经超过最大购买数！',
      icon: 'none'
    });
    setTotal = goods.userMaxBuy - goods.userBuy
  }
  
  
  //判断库存
  if (goods.total < setTotal){
    wx.showToast({
      title: '该商品已经没有库存不能添加！',
      icon: 'none'
    });
    setTotal = goods.total
  }
  
  if(setTotal == 0){
    goods.buyCount = 0
    return goods
  }
  if(cart == null){
    cart = {}
    cart.goodsId = goods.id;
    //名称
    cart.title = goods.title;
    //图片
    cart.goodsThumb = goods.thumb
    //数量
    cart.total = setTotal;
    //购买价格
    cart.price = goods.marketPrice;
    //原价
    cart.productPrice = goods.productPrice;  
    //营销类型 0 正常售卖 1 团购  2 砍价
    cart.marketType = goods.marketType
    //门店，还是总部
    cart.isPlatform = goods.isPlatform
    //商户id
    cart.merchantId= goods.merchantId
    //供应商ID
    cart.supplierId= goods.supplierId
    //最大购买量
    cart.userMaxBuy = goods.userMaxBuy
    //
    cart.userBuy = goods.userBuy
    //商品库存
    cart.goodsTotal = goods.total
    //购买数据    
    goods.buyCount = cart.total
    //放入缓存
    shopCart = pushCarts(cart,cartTypeName)
    cart.saleType = 0
    if(goods.saleType){
      cart.saleType == goods.saleType
    }
  }
  else{
    //增加数量
    cart.total = setTotal;      
    //商品已购数量
    goods.buyCount = cart.total
    let index = shopCartIndex(goods.id,shopCart)
    shopCart[index] = cart;
  }    
  //计算优惠
  caulCartRealPrice(goods,cart,shopCart)
  //是否赠品
  if(goods.isGift){
    cart.isGift = goods.isGift
  }else{
    cart.isGift = false
  }

  //计算汇总
  setShopCart(shopCart,cartTypeName)
  caulTotal(cartTypeName)      
  return goods
}

/**
 * 计算商品价格
 * @param {商品信息} goods 
 */
function caulCartRealPrice(goods,cart,shopCart){
  //计算价格
  cart.realPrice = cart.total * cart.price
  cart.realPrice = cart.realPrice  

  //原价金额
  cart.realProductPrice = cart.total * cart.productPrice
  cart.realProductPrice = parseFloat(cart.realProductPrice.toFixed(2));
  //是否有促销
  if(goods.middleGoodsPromotion == undefined){
    return cart    
  }
  cart.middleGoodsPromotion = goods.middleGoodsPromotion

  //原价金额
  cart.realProductPrice = cart.total * cart.price
  cart.realProductPrice = parseFloat(cart.realProductPrice.toFixed(2))

  //满减
  if(cart.middleGoodsPromotion.promotionType == "o"){    
    let price=0
    let goodsPromotionCarts = []
    shopCart.forEach((item) =>{
      if(item.middleGoodsPromotion != undefined) {
        if(item.middleGoodsPromotion.middlePromotionId == goods.middleGoodsPromotion.middlePromotionId){
          let itemRealPrice = item.total * item.price
          price +=  itemRealPrice
          item.realPrice = itemRealPrice
          goodsPromotionCarts.push(item)
        }  
      }         
    });  
    //达到满减
    if(price >= cart.middleGoodsPromotion.x){
      //倍数
      let multiple = parseInt(price / cart.middleGoodsPromotion.x)
      //优惠金额
      let disPrice = parseFloat(cart.middleGoodsPromotion.y)*multiple
      //已优惠  
      let alreadyPrice = 0    
      //分摊
      for(let i=0;i<goodsPromotionCarts.length;i++){
        //计算比率
        let rato = goodsPromotionCarts[i].realPrice / price;
        let goodsDiscountPrice = 0
        if(i == goodsPromotionCarts.length -1){
          goodsDiscountPrice = disPrice - alreadyPrice
        }
        else{
          goodsDiscountPrice = parseFloat((disPrice * rato).toFixed(2))
          alreadyPrice += goodsDiscountPrice
        }
        goodsPromotionCarts[i].realPrice -=  goodsDiscountPrice     
        goodsPromotionCarts[i].realPrice = parseFloat(goodsPromotionCarts[i].realPrice.toFixed(2))
        //优惠金额
        goodsPromotionCarts[i].promotionDiscountPrice = goodsDiscountPrice
      }
    }else{
      //满足金额后，减少购买件数，当低于满减门槛是，重置分摊优惠
      for(let i=0;i<goodsPromotionCarts.length;i++){
        //优惠金额
        goodsPromotionCarts[i].promotionDiscountPrice = 0
      }
    }   
  }
  //数量促销
  else if(cart.middleGoodsPromotion.promotionType == "q" ){
     let realPrice = 0
     for(let i = 1; i <= cart.total;i++){
        if(i % cart.middleGoodsPromotion.y == 0){
          //倍数
          let multiple = i / cart.middleGoodsPromotion.y
          realPrice =  parseFloat(cart.middleGoodsPromotion.x) * multiple
        }else{
          realPrice +=  cart.price
        }
     }
     if(cart.realPrice - realPrice > 0){
      cart.promotionDiscountPrice = cart.realPrice - realPrice
      cart.realPrice =  realPrice

      cart.promotionDiscountPrice = parseFloat(cart.promotionDiscountPrice.toFixed(2))
      cart.realPrice = parseFloat(cart.realPrice.toFixed(2))
     }else{
      cart.promotionDiscountPrice = 0
     }          
  }
  //特价
  else{
    cart.realProductPrice = cart.total * cart.productPrice
    cart.promotionDiscountPrice = cart.realProductPrice - cart.realPrice
    cart.realPrice = parseFloat(cart.realPrice.toFixed(2))  
    cart.realProductPrice = parseFloat(cart.realProductPrice.toFixed(2))
  }
  

  return cart
}


module.exports = {
  cartType : cartType,
  getShopCart : getShopCart,
  getShopCartTotal : getShopCartTotal,
  setShopCart : setShopCart,
  setShopCartTotal : setShopCartTotal,
  getShopCartGoods : getShopCartGoods,
  shopCartIndex : shopCartIndex,
  pushCarts : pushCarts,
  modifyGoodsList : modifyGoodsList,
  caulTotal : caulTotal,
  addShopCart : addShopCart,
  delShopCart : delShopCart,
  setShopCartNum : setShopCartNum,
  clearShopCart : clearShopCart,
  getTotalBuyCount: getTotalBuyCount,
  clearShopCartList : clearShopCartList,
  initCartInfo : initCartInfo,
  caulCartRealPrice : caulCartRealPrice,
}

