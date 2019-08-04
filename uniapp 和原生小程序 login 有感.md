## 想当年

> 18 年开始用原生写小程序的时候，曾经因为小程序登录而感到郁闷，请听我细细道来

## 首先大家都知道小程序是这样登录

简单看其实也就是用 code 换取 openid

```js
const login = await wx.login()
const openid = await wx.request({ url: 'https://url', code: login.code })
```

很简单，没什么问题，郁闷的是这段代码应该放在哪里执行呢？

## 先看看小程序的页面执行过程是怎样的

这是入口文件 app.js

```js
App({
  onLaunch() {}
})
```

这是首页

```js
Page({
  onLoad() {}
})
```

毕竟当年还是个单纯的男孩子，以为会先执行完 App.onLaunch 再执行 Page.onLoad

。。。

结果嘛

。。。

App.onLaunch 确实会先执行，但 Page.onLoad 也会同步紧跟着执行，不会等 App.onLaunch 执行完成

## 那么问题就来了

如果登录代码放在 App.onLaunch 里

```js
App({
  globalData: {
    openid: null
  },

  async onLaunch() {
    const login = await wx.login()
    const openid = await wx.request({ url: 'https://url', code: login.code })
    this.globalData.openid = openid
  }
})
```

那么我在 Page.onLoad 很大可能拿不到 openid，毕竟都是同步执行的嘛

```js
const app = getApp()

Page({
  async onLoad() {
    console.log(app.globalData.openid) // null
  }
})
```

嗯，问题很大啊

## 官方提供的解决方案

微信官方提供的小程序模版有如下的代码，给 App 挂载一个回调，用来给页面监听

```js
App({
  globalData: {
    openid: null
  },

  async onLaunch() {
    const login = await wx.login()
    const openid = await wx.request({ url: 'https://url', code: login.code })
    this.globalData.openid = openid
    getApp().userInfoReadyCallback && getApp().userInfoReadyCallback()
  }
})
```

那么 Page 就可以这么监听

```js
const app = getApp()

Page({
  onLoad() {
    app.userInfoReadyCallback = () => console.log(app.globalData.openid)
  }
})
```

嗯，看起来还行，但是这样还是有点问题

。。。

app.userInfoReadyCallback 在这里只会执行一次，而实际交互中，页面可能被多次切换，Page.onLoad 虽然会正常执行，但里面的回调就不会执行了

。。。

好，那就加个判断兼容下

```js
const app = getApp()

Page({
  onLoad() {
    if (app.globalData.openid) {
      console.log(app.globalData.openid)
    } else {
      app.userInfoReadyCallback = () => console.log(app.globalData.openid)
    }
  }
})
```

嗯，还是能解决的嘛

## 官方解决方案的缺点

如果用目前的解决方案，那么当你页面很多，需要 openid 的页面都需要添加判断和监听回调的代码，所以最好是将其抽成方法，以便复用

```js
const app = getApp()

function userInfoReady(cb) {
  if (app.globalData.openid) {
    cb(app.globalData.openid)
  } else {
    app.userInfoReadyCallback = () => cb(app.globalData.openid)
  }
}
```

```js
import { userInfoReady } from './utils'

Page({
  onLoad() {
    userInfoReady(openid => console.log(openid))
  }
})
```

## 另外一种解决方案

慢慢长大后，开始习惯不在 App 的生命周期里做一些异步操作了，除了一些不依赖用户登录的，将登录操作交给每个 Page 各自处理

```js
const app = getApp()

async function login() {
  const login = await wx.login()
  const openid = await wx.request({ url: 'https://url', code: login.code })
  app.globalData.openid = openid
  return openid
}
```

```js
App({
  globalData: {
    openid: null
  }
})
```

```js
import { login } from './utils'

Page({
  async onLoad() {
    await login()
  }
})
```

这种方案相对就简化了 App 里的逻辑

## 当下 uniapp 的解决方案

>  随着多端小程序的出现，如今写原生的机会越来越少了

uniapp 当然也存在一样的问题，毕竟底层也是一样

结合原生的经验，同样习惯不在 App.vue 里做异步逻辑

```vue
<script>
export default {}
</script>
```

不要怀疑，很多时候，App.vue 都不太需要有逻辑

将 openid 等状态和异步操作交给 store 去管理，而不是放 App.globalData

```js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    openid: null
  },

  actions: {
    async login() {
      if (state.openid) return
      const login = await uni.login({ provider: 'weixin' })
      const openid = await uni.request({ url: 'https://url', code: login.code })
      state.openid = r.openid
    }
  }
})
```

最后 Page 的逻辑跟原生也是大同小异啦

```js
export default {
  async onLoad() {
    await this.$store.dispatch('login')
  }
}
```

如果还不满意，还有最后一招

uniapp 也提供了事件的广播和订阅

```js
uni.$emit('login', { openid })
uni.$on('login', ({ openid }) => console.log(openid))
```

大同小异，各取所需
