Page({
    data: {
        bg: ""
    },
    onLoad() {
        // 获取首页背景图
        wx.cloud.downloadFile({
            fileID: '',
            success: res => {
                this.setData({
                    bg: res.tempFilePath
                })
            }
        })
    },
    chooseArea() {
        wx.navigateTo({
            url: '/pages/area/area',
        })
    }
})