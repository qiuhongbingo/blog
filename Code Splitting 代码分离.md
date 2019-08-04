## 发现问题

这是一个基于 vue-cli 的管理后台项目，由于依赖较多，打包结果如下

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190539.png)

## 查找原因

> 为什么 vendor 体积这么大？

借助 Webpack 的分析工具，看了下各个依赖的体积分布

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190554.png)

看起来是 Highcharts 和 Element-UI 占了较大体积，那就想办法优化呗

> 这两个库都提供了按需加载的功能，能有效减小体积，只是刚好这个管理后台项目依赖较多

## 解决方法

### CDN 外链

先把 Highcharts 和 Lodash 通过外链引入

```html
<script src="//cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.5/lodash.min.js" />
<script src="//cdnjs.cloudflare.com/ajax/libs/highcharts/6.0.7/highstock.js" />
<script src="//cdnjs.cloudflare.com/ajax/libs/highcharts/6.0.7/js/highcharts-more.js" />
<script src="//cdnjs.cloudflare.com/ajax/libs/highcharts/6.0.7/js/modules/treemap.js" />
```

外链引入的资源就不能直接通过 import 来使用，但可以通过 Webpack 的 externals 特性来兼容

```javascript
import _ from 'lodash'
import Highcharts from 'highcharts'

console.log([_, Highcharts])
```

这样配置 Webpack 就知道这两个依赖是外链全局的，不需要打包

```javascript
externals: {
  lodash: '_',
  highcharts: 'Highcharts'
}
```

先看看去掉 Highcharts 和 Lodash 的效果

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190606.png)

vendor 也避免打包了这两个库

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190617.png)

这种方式适用于不常更新的第三方依赖，采用外链，Element-UI 由于常有新特性更新，我会保持最新版本，所以还是通过 npm 来管理

### 但是，内网部署咋办

直到有一天，这个管理后台项目要部署到一个内网机器，访问不了外网，那这种方式就走不通了

### 拆开 vendor

> Webpack 默认是将依赖打包成一个文件，这样优点是减少资源请求数，但当依赖增多，体积增大，一个资源的加载速度就会减慢

所以我开始尝试去拆包

```javascript
new webpack.optimize.CommonsChunkPlugin({
  name: 'charts',
  chunks: ['vendor'],
  minChunks: module => module.resource.indexOf('highcharts') > -1
}),

new webpack.optimize.CommonsChunkPlugin({
  name: 'utils',
  chunks: ['vendor'],
  minChunks: module => module.resource.indexOf('lodash') > -1
}),

new webpack.optimize.CommonsChunkPlugin({
  name: 'ui',
  chunks: ['vendor'],
  minChunks: module => module.resource.indexOf('element-ui') > -1
})
```

拆包后的打包结果

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190632.png)

看看分析工具

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190653.png)

## 总结

外链简单粗暴，而拆包可以配合浏览器缓存，每次发布最小化更新资源

