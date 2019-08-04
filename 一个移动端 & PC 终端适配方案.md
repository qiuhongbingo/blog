## 这次我们采用最常见的 rem 适配方案

> 别废话，先看最终的适配效果：

Mobile 长这样：

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190427.jpeg)

PC 长这样：

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190439.jpeg)

> 嗯，还行，能看。

## 开搞，先安装 ##

当然还是先安装 [amfe-flexible](https://github.com/amfe/lib-flexible)，建议用 npm

```
npm i amfe-flexible -S
```
然后在项目入口引入

```js
import 'amfe-flexible'
```

如果不想使用 npm，那就用这个 script 引入

```html
<script src="http://g.tbcdn.cn/mtb/lib-flexible/0.3.4/??flexible_css.js,flexible.js" />
```

## 单位转换

为了与设计稿 px 单位一致，还需要一个 px 转 rem 的工具来帮忙

```
npm i postcss-pxtorem -D
```

配置好 webpack 的 postcss 插件

```json
"postcss": {
  "plugins": {
    "postcss-pxtorem": {
      // 这里根据设计稿宽度自定义，常见 37.5 或 75
      "rootValue": 37.5,
      "propList": [
        "*"
      ]
    }
  }
}
```

这样就可以直接用 px 单位，省去换算 rem

## 小适配

移动端虽然正常，但浏览器看发现比例偏大，所以我们还得让 PC 给我缩回去

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190452.jpeg)

思路比较简单，用媒体查询，大屏幕就重置根字体，给个最大缩放宽度

```css
@media screen and (min-width: 750px) {
  html {
    // 这里加权重是因为 amfe-flexible 通过行内样式设置了根字体
    font-size: 100px !important;
  }

  body {
    // 顺带提下，这里也可以小写 px，大写 PX 可以让 postcss-pxtorem 忽略转成 rem
    max-width: 500PX;
    margin: 0 auto;
  }
}
```

> 就这样吧

