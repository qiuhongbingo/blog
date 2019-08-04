## 为什么要做这个

项目活动页面越来越多，运营小姐姐需要统计各页面数据时，GA 后台的筛选操作就显得格外繁琐，费时费力

## 有什么解决方案

尝试用 Google 表格插件 Google Analytics Report 每天自动抓取 GA 后台的数据，方便运营小姐姐直接查看，不需要另外登录 GA 后台拿数

## 怎么做

### 创建报告

`插件 - Google Analytics - Greate new report`

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190919.png)

### 关联配置参数

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190928.png)

Start Date 可以固定为页面上线的时间，也可以是相对时间

```
2019-02-12 || 30daysAgo
```

Metrics 则加上需要的数据维度

```javascript
// UV
ga:uniquePageviews
// PV
ga:pageviews
```

Dimensions 一般按日期分组就好

```
ga:date
```

Filters 就是配置每个前端页面的路径

```javascript
// 例如页面链接是 https://www.abc.com/home
ga:pagePath=~/home
```

[全部参数列表](https://developers.google.com/analytics/devguides/reporting/core/dimsmets#mode=api)

### 试着跑一下

`插件 - Google Analytics - Run reports`

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190942.png)

发现可以正常生成数据表格了，需要的维度都抓取正常

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190956.png)

### 关联多个页面

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804191007.png)

### 来个汇总吧

给单元格添加表关联

```
='页面一'!B16
```

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804191020.png)

然后往下拖整列

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804191033.png)

### 每天定时更新

`插件 - Google Analytics - Schedule reports`

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804191043.png)

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804191057.png)

## 完事了

运营小姐姐说我好厉害～

## 相关文档

* [Google Analytics Spreadsheet Add-on](https://developers.google.com/analytics/solutions/google-analytics-spreadsheet-add-on)
* [Core Reporting API](https://developers.google.com/analytics/devguides/reporting/core/v3/reference#q_details)

