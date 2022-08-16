# “馆家”——基于微信小程序的图书馆预约系统

本项目用于个人大创，使用微信小程序的云开发作为后端提供查询数据库等服务，旨在帮助用户在足不出户的情况下查看图书馆的使用情况并提供预约功能。

<br>

## 获取代码

```
git clone git@github.com:77zzl/wechat-libraryKeeper.git
```

<br>

## 快速上手

- `/LK`目录下`project.config.json`第48行填写自己的`appid`
- `/LK`目录下`app.js`第五行填写云开发的环境`env`，云开发技术详情参见[官网教程](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/quick-start/miniprogram.html)
- 本项目不提供首页背景图，请开发者自行设置（为了提高代码质量最好将背景图放在云存储中）
- 注意在本项目中因为对定位精确度有较高需求因此使用了高德地图的插件，参见[大佬分享](https://blog.csdn.net/fshj1106/article/details/106685096?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522166057168416782184665850%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=166057168416782184665850&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-6-106685096-null-null.142^v40^new_blog_pos_by_title,185^v2^control&utm_term=%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F%E8%8E%B7%E5%8F%96%E7%BB%8F%E7%BA%AC%E5%BA%A6%E4%B8%8D%E5%87%86&spm=1018.2226.3001.4187)

:warning: 本项目中用到的云函数并未开源

完成以上步骤即可愉快使用本项目啦 :)

<br>

## 本项目使用了以下组件，在此鸣谢

[lin-ui 林间有风](https://github.com/TaleLin/lin-ui)
