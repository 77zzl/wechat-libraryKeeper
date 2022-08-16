const app = getApp()
// 前往高德下载微信小程序插件
var amapFile = require('');
Page({
    data: {
        seatArr: 0,
        selectArr: 0,
        showSeat: 0,
        surplus: 30,
        area: '',
        free: 60,
        used: 0,
        arrive: false,
        showSelect: false,
        showCancel: false,
        confirmAp: false,
        showTime: false,
        showBack: false
    },
    onLoad: function (e) {
        var arrive = JSON.parse(e.arrive)
        var showData = JSON.parse(e.showData)
        var area = Number(e.area[0]) + 1
        area = area + ' - ' + e.area[1]
        var seatArr = JSON.parse(e.seatArr)
        var selectArr = JSON.parse(e.selectArr)
        var showSeat = JSON.parse(e.showSeat)
        var confirmAp = false
        var selectArea = e.selectArea
        var floor = Number(selectArea[0]) + 1
        selectArea = floor + '-' + selectArea[1]
        var surplus = 30
        var time = e.time
        if (e.selectArr != '{}') {
            confirmAp = true
            surplus = 30 - Math.ceil((Date.now() - time) / 60000)
        } else {
            selectArr = 0
            showSeat = 0
        }
        this.setData({
            area: area,
            seatArr: seatArr,
            selectArr: selectArr,
            showSeat: showSeat,
            free: showData['空闲座位'],
            used: showData['有人在卷'],
            confirmAp: confirmAp,
            selectArea: selectArea,
            surplus: surplus,
            arrive: arrive
        })
    },
    onShow() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        this.getSeatOnArea()
    },
    // 获取该区域的座位信息
    getSeatOnArea() {
        var that = this
        var areaId = this.data.area
        areaId = (Number(areaId[0]) - 1) + areaId[4]
        wx.cloud.callFunction({
            name: 'getSeatOnArea',
            data: {
                areaId: areaId
            },
            success(res) {
                var seatArr = res.result.data[0].seatArr
                var free = 0
                var arrive = that.data.arrive
                for (var i in seatArr) {
                    var row = seatArr[i]
                    for (var j in row) {
                        if (row[j].src == 'unselect.png') {
                            free++
                        }
                        if (row[j].openId == app.globalData.openId) {
                            if (row[j].src == 'selected.png') {
                                arrive = true
                                seatArr[i][j].src = 'mySeat.png'
                            } else {
                                seatArr[i][j].src = 'myAp.png'
                            }
                        }
                    }
                }
                that.setData({
                    seatArr,
                    free,
                    arrive,
                    used: 60 - free
                })
                wx.hideLoading({
                    success: (res) => {},
                })
            }
        })
    },
    // 点击座位
    bindGetLocation: function (e) {
        var that = this;
        var seatsrc = e.currentTarget.dataset.src;
        var select = {
            x: e.currentTarget.dataset.x,
            y: e.currentTarget.dataset.y,
        }
        if (seatsrc == "unselect.png") {
            if (that.data.selectArr == 0) {
                var showSeat = {}
                showSeat.x = select.x + 1
                showSeat.y = that.data.seatArr[select.x][select.y].index - 10 * select.x + 1
                that.setData({
                    selectArr: select,
                    showSeat: showSeat,
                    showSelect: true
                })
            } else {
                wx.showToast({
                    title: '仅限选择一个位置！',
                    icon: 'none'
                })
            }
        } else if (seatsrc == "myAp.png" || seatsrc == "mySeat.png") {
            that.setData({
                showCancel: true
            })
        } else if (seatsrc == 'othersAp.png') {
            that.showTime(select)
        } else {
            wx.showToast({
                title: "换个座位试试吧",
                icon: "none"
            })
        }
    },
    // 查看别人的预约
    showTime(e) {
        var time = this.data.seatArr[e.x][e.y].time
        time = 30 - Math.ceil((Date.now() - time) / 60000)
        this.setData({
            showTime: true,
            content: `该预约还剩${time}分钟`
        })
    },
    // 不选择此位置
    exitChoose() {
        this.setData({
            selectArr: 0,
            showSeat: 0,
            showSelect: false,
            showCancel: false
        })
    },
    // 不取消预约/位置
    exitCancel() {
        this.setData({
            showCancel: false,
            showSelect: false,
            showBack: false
        })
    },
    // 选择此位置
    confirmSeat() {
        // 解决并发问题
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        this.getSeatOnArea()
        var that = this
        setTimeout(
            function () {
                if (that.data.seatArr[that.data.selectArr.x][that.data.selectArr.y].src != 'unselect.png') {
                    wx.showToast({
                        title: "换个座位试试吧",
                        icon: "none"
                    })
                } else {
                    var seatArr = that.data.seatArr
                    seatArr[that.data.selectArr.x][that.data.selectArr.y].src = 'myAp.png'
                    seatArr[that.data.selectArr.x][that.data.selectArr.y].openId = app.globalData.openId
                    seatArr[that.data.selectArr.x][that.data.selectArr.y].time = Date.now()
                    var surplus = 30 - Math.ceil((Date.now() - seatArr[that.data.selectArr.x][that.data.selectArr.y].time) / 60000)
                    var selectArea = that.data.area
                    selectArea = selectArea[0] + selectArea[2] + selectArea[4]
                    that.setData({
                        seatArr,
                        surplus,
                        selectArea,
                        confirmAp: true
                    })
                    seatArr[that.data.selectArr.x][that.data.selectArr.y].src = 'othersAp.png'
                    var area = that.data.area
                    var floor = Number(area[0]) - 1
                    area = floor + area[4]
                    wx.cloud.callFunction({
                        name: 'changeSeat',
                        data: {
                            areaId: area,
                            seatArr: seatArr
                        },
                        success(res) {
                            console.log(res);
                        }
                    })
                }
            }, 1000)

    },
    // 取消选座
    cancelSeat() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        var that = this
        var area = this.data.area
        area = area[0] + area[4]
        var selectArea = this.data.selectArea
        selectArea = selectArea[0] + selectArea[2]
        if (area == selectArea) {
            var seatArr = this.data.seatArr
            seatArr[this.data.selectArr.x][this.data.selectArr.y].src = 'unselect.png'
            seatArr[this.data.selectArr.x][this.data.selectArr.y].openId = ""
            seatArr[this.data.selectArr.x][this.data.selectArr.y].time = 0
            this.setData({
                seatArr,
                confirmAp: false,
                selectArr: 0,
                showSeat: 0,
                arrive: false
            })
            var area = this.data.area
            var floor = Number(area[0]) - 1
            area = floor + area[4]
            wx.cloud.callFunction({
                name: 'changeSeat',
                data: {
                    areaId: area,
                    seatArr: seatArr
                },
                success(res) {
                    console.log(res);
                    that.getSeatOnArea()
                }
            })
        } else {
            wx.hideLoading({
                success: () => {},
            })
            this.setData({
                showBack: true
            })
        }
    },
    //通过两点经纬度计算距离（M）  
    distance: function (la1, lo1, la2, lo2) {
        var La1 = la1 * Math.PI / 180.0;
        var La2 = la2 * Math.PI / 180.0;
        var La3 = La1 - La2;
        var Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
        s = s * 6378.137; //地球半径
        s = Math.round(s * 10000) / 10;
        console.log("计算结果", s);
        return s;
    },
    // 检查是否到达图书馆附近
    checkArrive() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        })
        var area = this.data.area
        area = area[0] + area[4]
        var selectArea = this.data.selectArea
        selectArea = selectArea[0] + selectArea[2]
        if (area == selectArea) {
            var that = this
            var myAmapFun = new amapFile.AMapWX({
                // 注册高德开发者账号获取
                key: ''
            });
            myAmapFun.getRegeo({
                success: (res) => {
                    console.log(res);
                    //计算两个经纬度距离(m)，此坐标为虚构坐标
                    var d = that.distance(13, 103, res[0].latitude, res[0].longitude);
                    if (d < 200) {
                        var seatArr = that.data.seatArr
                        seatArr[that.data.selectArr.x][that.data.selectArr.y].time = 0
                        seatArr[that.data.selectArr.x][that.data.selectArr.y].src = "selected.png"
                        var area = that.data.area
                        var floor = Number(area[0]) - 1
                        area = floor + area[4]
                        wx.cloud.callFunction({
                            name: 'changeSeat',
                            data: {
                                seatArr: seatArr,
                                areaId: area
                            },
                            success() {
                                that.getSeatOnArea()
                            }
                        })
                    } else {
                        wx.showToast({
                            title: '请先到达图书馆！',
                            icon: 'none'
                        })
                    }
                },
                fail() {
                    wx.hideLoading({
                        success: () => {
                            that.choiceAddress()
                        },
                    })
                }
            })
        } else {
            wx.hideLoading({
                success: () => {},
            })
            this.setData({
                showBack: true
            })
        }
    },
    // 返回上一个栈
    back() {
        wx.navigateBack({
            delta: 1
        })
    },
    // 离开
    leave() {
        this.setData({
            showCancel: true
        })
    },
    // 用户拒绝授权
    choiceAddress() {
        wx.getSetting({
            success: (res) => {
                if (res.authSetting['scope.userLocation'] != undefined &&
                    res.authSetting['scope.userLocation'] != true) {
                    wx.showModal({
                        title: '请求授权当前位置',
                        content: '需要获取您的地理位置，请确认授权',
                        success: function (res) {
                            if (res.cancel) {
                                wx.showToast({
                                    title: '拒绝授权',
                                    icon: 'none',
                                    duration: 1000
                                })
                            } else if (res.confirm) {
                                wx.openSetting({
                                    success: function (res) {
                                        if (res.authSetting["scope.userLocation"] == true) {
                                            wx.showToast({
                                                title: '授权成功',
                                                icon: 'none',
                                                duration: 1000
                                            })
                                        } else {
                                            wx.showToast({
                                                title: '授权失败',
                                                icon: 'none',
                                                duration: 1000
                                            })
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    }
})