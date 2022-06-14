let config = require('./config.js');
let http_domain={
  params:{}  //附加参数 没有为空对象
};
function request (obj){
  let { url, method, data, success, error, final} = obj;
  if(!!url && !!method){
    data = data?data:{};
    let re_url = config.httpConfig[url];
    let re_data = Object.assign(data, http_domain.params, config.cachKey);
    let re_method = method ? method : 'GET';
    wx.request({
      url: re_url,
      method : re_method,
      data : re_data,
      success : function(data){
        //dosome thing
        success && success(data);
      },
      fail : function(err){
        //dosome thing
        error && error(err);
      },
      complete:function(res){
        //dosom thing
        final && final(res);
      }
    });
  }else{
    console.log('request请求参数缺失')
  }
}

module.exports=request;