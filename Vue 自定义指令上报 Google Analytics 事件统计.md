## 发现问题

一般前端开发离不开数据统计，我们经常需要接入统计服务以方便运营，例如现在需要统计一个按钮

```html
<template>
  <button @click="handleClick" />
</template>

<script>
export default {
  methods: {
    handleClick() {
      window.alert('button click')
    }
  }
}
</script>
```

引入 ga 后是这样上报的

```javascript
handleClick() {
  window.alert('button click')

  const params = {
    hitType: 'event',
    eventCategory: 'button',
    eventAction: 'click',
    eventLabel: 'click label'
  }

  window.ga('send', params)
}
```

很简单！

但当页面的按钮增加，我们几乎要在所有 handle 事件里侵入统计代码，和业务逻辑混在一起

不够优雅！

## 怎么优雅

我们尝试利用 Vue 的指令来自定义统计，这是我最终想要的统计方式

只需要在 template 里声明好统计参数，用户点击则触发上报

```html
<template>
  <button @click="handleClick"
          v-ga="{
            eventCategory: 'button',
            eventLabel: 'button click'
          }" />
</template>
```

## 抽离统计

将上报统计代码单独个方法出来

`./services/analyst.js`

```js
export function send(data = {}) {
  const params = {
    hitType: 'event',
    eventCategory: 'button',
    eventAction: 'click',
    eventLabel: 'click label'
  }

  window.ga('send', Object.assign({}, params, data))
}
```

## 编写指令

监听带有 v-ga 指令的元素，统一处理上报

`./plugins/analyst.js`

```js
import * as analyst from './services/analyst'

const plugin = Vue => {
  Vue.directive('ga', {
    bind(el, binding) {
      el.addEventListener('click', () => {
        // binding.value 拿到 v-ga 指令的参数
        analyst.send(binding.value)
      })
    },

    unbind(el) {
      el.removeEventListener('click', () => {})
    }
  })
}

export default plugin
```

## 最终调用

```js
import Vue from 'vue'
import GaPlugin from './plugins/analyst'

Vue.use(GaPlugin)
```

