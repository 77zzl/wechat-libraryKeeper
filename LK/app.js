// app.js
App({
  onLaunch() {
    wx.cloud.init({
      env: ""
    })
    // 先检查缓存是否保留用户信息
    if (wx.getStorageSync('openId')) {
      this.globalData.openId = wx.getStorageSync('openId')
    }
    // 若缓存无则从云函数中调取
    var that = this;
    if (this.globalData.openId == null) {
      wx.cloud.callFunction({
        name: "getUserOpenid",
        success(res) {
          that.globalData.openId = res.result.openid
          wx.setStorageSync('openId', res.result.openid)
        }
      })
    }
  },
  globalData: {
    openId: null
  }
})