const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/**
 * @description 除法函数，用来得到精确的除法结果, 该函数已扩展到Math对象中
 * @param {Float/Int} arg1  数值1
 * @param {Float/Int} arg2  数值2
 * @returns {float/Int}
 **/
const div = (arg1, arg2) => {
  var t1 = 0, t2 = 0, r1, r2;
  try {
    t1 = arg1.toString().split(".")[1].length;
  }
  catch (e) {
  }
  try {
    t2 = arg2.toString().split(".")[1].length;
  }
  catch (e) {
  }
  r1 = Number(arg1.toString().replace(".", ""));
  r2 = Number(arg2.toString().replace(".", ""));
  return (r1 / r2) * Math.pow(10, t2 - t1);
}

const GetSceneParam = (url, options,callback) => {
  let paramId = options.scene
  if(paramId) {
    wx.request({
      url: url,
      data: {
        paramId: paramId
      },
      success: function (res) {
        wx.hideLoading();
        if (!res.data.flag) {
          wx.showToast({
            title: res.data.message || '获取参数失败',
            icon: 'none'
          });
        } else {
          //对象合并
          options = Object.assign(options, res.data.data);
        }
        callback(options)
      }
    })
  }else{
    callback(options)
  }
}
/**
 * 页面跳转工具
 * @param url 本地页面路径
 * @param param 携带对象参数
 */
const PageGo = {
  jump:(url, param) => {
    wx.navigateTo({
      url: url + DoGetParam(param),
    })
  },
  cacheSearch:(title) => {
    let newHistories = new Set();
    newHistories.add(title);
    let histories = wx.getStorageSync('histories') || [];
    histories.forEach((history) => {
      if(!newHistories.has(history) && newHistories.size < 5) {
        newHistories.add(history);
      }
    });
    histories = Array.from(newHistories);
    wx.setStorageSync('histories', histories);
  },
  getSearchCache:() => {
    return wx.getStorageSync('histories') || [];
  },
  switchTo:(url) => {
    wx.switchTab({
      url: url,
      complete() {
        wx.hideLoading();
      },
      fail(res) {
        console.info(res);
      }
    })
  },
}
/*-----------------------------跳转页面工具-END------------------------------*/
module.exports = {
  formatTime: formatTime,
  div: div,
  GetSceneParam:GetSceneParam,
  PageGo,
}
