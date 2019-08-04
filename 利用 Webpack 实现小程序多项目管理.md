## 故事是这样的

产品小姐姐：“我要做一堆小程序，一周上线一到两个没问题吧”

码畜小哥哥：“你他喵是不是傻，做那么多干什么”

产品小姐姐：“蹭些流量呀，用户量多了就可以考虑转化流量给公司的 APP”

码畜小哥哥：“~~fuxk~~ 好的”

## 码畜小哥开始架构

* 小程序杂，放一个项目方便管理
* 小程序多，代码要能够复用
* 团队开发，代码风格要统一

## 码畜小哥开始建项目

这是单个小程序的基本目录结构，没问题

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190725.jpeg)

当一个项目有多个小程序的时候，好像也没问题

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190736.jpeg)

当多个小程序都用到同一个组件 com3 时，小哥发现代码没法复用，需要复制黏贴

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190746.jpeg)

思考了一下，那么把组件目录移到外面，这样不就可以复用了吗

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190802.jpeg)

感觉很好，小哥这时在微信开发者工具打开 demo1，发现报错了

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190811.jpeg)

原来小程序是以当前项目作为根目录，components 目录已经不在 demo1 目录范围内，所以是引用不到的

## 小哥想到了 Webpack

### 1. 整理目录

* apps/：存放全部小程序
* build/：存放构建脚本
* common/：存放公共方法
* components/：存放公共组件
* styles/：存放公共样式
* templates/：存放公共模板

大概长这样

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190822.jpeg)

### 2. 编写构建脚本

package.json

```javascript
script: {
  "dev": "webpack --config build/webpack.config.js"
}
```

build/webpack.config.js

> 思路就是利用 CopyWebpackPlugin 同步指定的文件到小程序目录下

```javascript
const CopyWebpackPlugin = require('copy-webpack-plugin')
const utils = require('./utils')

// 获取 apps 目录下的小程序并指定公共文件目录命名
function copyToApps(dir) {
  let r = []

  utils
    .exec(`cd ${utils.resolve('apps')} && ls`)
    .split('\n')
    .map(app => {
      r.push({
        from: utils.resolve(dir),
        to: utils.resolve(`apps/${app}/_${dir}`)
      })
    })

  return r
}

module.exports = {
  watch: true,

  // 监听入口文件，保存便会刷新
  entry: utils.resolve('index.js'),

  output: {
    path: utils.resolve('.tmp'),
    filename: 'bundle.js'
  },

  plugins: [
    // 同步指定的公共文件到所有小程序目录下
    new CopyWebpackPlugin([
      ...copyToApps('styles'),
      ...copyToApps('common'),
      ...copyToApps('templates'),
      ...copyToApps('components')
    ])
  ]
}
```

### 3. 启动本地开发

```javascript
npm run dev
```

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190839.jpeg)

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190852.jpeg)

现在公用的代码已经自动同步到小程序目录下，以下划线开头，当改动公共代码也会自动同步给小程序调用

调用方式长这样

```javascript
import utils from './_common/utils'
import com3 from './_components/com3'
```

```css
@import './_styles/index.wxss';
```

```html
<import src="./_templates/index.wxml" />
```

## 代码风格校验

package.json

```javascript
script: {
  "lint": "eslint apps/"
}
```

.eslintrc.js

```javascript
module.exports = {
  extends: 'standard',

  // 将小程序特有的全局变量排除下
  globals: {
    Page: true,
    Component: true,
    App: true,
    getApp: true,
    wx: true
  },

  rules: {
    'space-before-function-paren': ['error', 'never'],
    'no-unused-vars': [
      'error',
      {
        // 小程序还没支持 ES7，这个是用来兼容 async/await
        varsIgnorePattern: 'regeneratorRuntime'
      }
    ]
  }
}
```

然后借助 [husky](https://github.com/typicode/husky) 在每次 git commit 前执行校验

```javascript
script: {
  "precommit": "npm run lint"
},

devDependencies: {
  "husky": "^0.14.3"
}
```

## 清理

最后小哥还加了个清理命令，便于重新生成公共代码

package.json

```javascript
script: {
  "clean": "node build/clean.js"
}
```

build/clean.js

```javascript
const rimraf = require('rimraf')
const utils = require('./utils')

function log(dir) {
  console.log(`cleaning ${dir}`)
}

rimraf(utils.resolve('.tmp'), () => log('.tmp'))

utils
  .exec(`cd ${utils.resolve('apps')} && ls`)
  .split('\n')
  .map(app => {
    ;[
      `${app}/_styles`,
      `${app}/_common`,
      `${app}/_templates`,
      `${app}/_components`
    ].map(m => {
      rimraf(utils.resolve(`apps/${m}`), () => log(m))
    })
  })
```

## 码畜小哥心满意足

> “可以少加班了”

