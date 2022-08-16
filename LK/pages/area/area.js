const app = getApp()
Page({
    data: {
        navi: {
            one: [{
                cnt: 80,
                title: '一楼A区',
                index: '0A'
            }],
            two: [{
                    cnt: 0,
                    title: '二楼A区',
                    index: '1A'
                },
                {
                    cnt: 0,
                    title: '二楼B区',
                    index: '1B'
                },
                {
                    cnt: 0,
                    title: '二楼C区',
                    index: '1C'
                },
                {
                    cnt: 0,
                    title: '二楼D区',
                    index: '1D'
                }
            ]
        },
        floor: ['一', '二'],
        select: {
            floor: '',
            area: 0
        },
        show: false,
        showData: {
            '空闲座位': 0,
            '有人在卷': 0
        },
        seatArr: 0,
        free: 0,
        selectArr: 0,
        showSeat: 0,
        selectArea: '',
        time: 0,
        arrive: false
    },
    onLoad() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        var that = this
        wx.cloud.callFunction({
            name: 'getSeat',
            success(res) {
                var area = res.result.data
                that.setData({
                    seatArr: area
                })
                // 循环馆区
                var free = {}
                var cnt = 0
                var selectArr = {}
                var showSeat = {}
                var selectArea = ''
                var time = 0
                var arrive = false
                for (var i in area) {
                    var row = area[i].seatArr
                    for (var j in row) {
                        var col = row[j]
                        for (var z in col) {
                            if (col[z].src == 'othersAp.png' & Math.ceil((Date.now() - col[z].time) / 60000) > 30) {
                                row[j][z].openId = ''
                                row[j][z].src = 'unselect.png'
                                row[j][z].time = 0
                                wx.cloud.callFunction({
                                    name: 'changeSeat',
                                    data: {
                                        areaId: area[i].areaId,
                                        seatArr: row
                                    },
                                    success(res) {
                                        console.log(res);
                                    }
                                })
                            }
                            if (col[z].src == 'unselect.png') {
                                cnt++
                            }
                            if (col[z].openId == app.globalData.openId) {
                                selectArr['x'] = j
                                selectArr['y'] = z
                                selectArea = area[i].areaId
                                area[i].seatArr
                                showSeat['x'] = Number(j) + 1
                                showSeat['y'] = area[i].seatArr[j][z].index - 10 * Number(j) + 1
                                time = col[z].time
                                if (col[z].src == 'selected.png') {
                                    arrive = true
                                    row[j][z].src = 'mySeat.png'
                                } else {
                                    row[j][z].src = 'myAp.png'
                                }
                            }
                        }
                    }
                    area[i].seatArr = row
                    free[area[i].areaId] = cnt
                    cnt = 0
                }
                var navi = that.data.navi
                for (var i in navi) {
                    var floor = navi[i]
                    for (var j in floor) {
                        var pre = Math.ceil(free[floor[j].index] / 60 * 100)
                        floor[j].cnt = pre
                    }
                }
                that.setData({
                    free,
                    navi,
                    selectArr,
                    showSeat,
                    selectArea,
                    time,
                    arrive
                })
                wx.hideLoading({
                    success: (res) => {},
                })
            }
        })
    },
    onShow() {
        this.setData({
            show: false
        })
        this.onLoad()
    },
    // 下拉刷新
    onPullDownRefresh() {
        this.onLoad()
        setTimeout(function () {
            wx.stopPullDownRefresh();
        }, 500)
    },
    // 点击区域
    onArea(e) {
        var select = {}
        select.floor = Number(e.currentTarget.dataset.floor)
        select.area = String.fromCharCode(65 + e.currentTarget.dataset.area)
        var showData = this.data.showData
        showData['空闲座位'] = this.data.free[select.floor + select.area]
        showData['有人在卷'] = 60 - showData['空闲座位']
        this.setData({
            select: select,
            show: true,
            showData: showData
        })
    },
    // 前往区域选座
    chooseArea() {
        var area = this.data.select.floor + this.data.select.area
        var arr = this.data.seatArr
        for (var i in arr) {
            if (arr[i].areaId == area) {
                arr = arr[i]
                break
            }
        }
        wx.navigateTo({
            url: `/pages/seat/seat?area=${area}&seatArr=${JSON.stringify(arr.seatArr)}&showData=${JSON.stringify(this.data.showData)}&selectArr=${JSON.stringify(this.data.selectArr)}&selectArea=${this.data.selectArea}&time=${this.data.time}&arrive=${JSON.stringify(this.data.arrive)}&showSeat=${JSON.stringify(this.data.showSeat)}`,
        })
    }
})