## 组件长这样

主要有标题、内容、按钮个数、按钮颜色、按钮文案这些可配置项

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190346.jpeg)

![](https://raw.githubusercontent.com/qhbhq/image/master/20190804190402.jpeg)

## 期望的调用方式一

不需要等待用户二次确认

```javascript
import Modal from 'common/components/modal'

handleModal() {
  Modal({
    title: '赚取收益？',
    content: '根据您的授权金额和计息天数计算得出(还未到账)。实际以到账金额为准。',
    confirmText: '我知道了'
  })
}
```

## 期望的调用方式二

需要等待用户二次确认

```javascript
import Modal from 'common/components/modal'

async handleModal() {
  await Modal({
    title: '确定现在申请结束吗？',
    content: '申请后预计1-5个工作日可退出',
    cancelColor: '#ff7400',
    confirmColor: '#000',
    showCancel: true
  })
}
```

## 模板长这样

`common/components/modal/modal.vue`

这里用 transition 来包裹动画，填好配置参数就行了

> handleConfirm() 二次确认事件我们不放这里实现，具体原因后面会讲

```html
<template>
  <transition name="modal-pop">
    <div class="wrap"
         v-show="visible">
      <div class="modal">
        <h3>{{ title }}</h3>
        <p>{{ content }}</p>
        <div class="btns">
          <span v-if="showCancel"
                @click="visible = false"
                :style="`color: ${cancelColor}`">{{ cancelText }}</span>
          <span @click="handleConfirm()"
                :style="`color: ${confirmColor}`">{{ confirmText }}</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<style lang="less">
@import './modal.less';
</style>
```

定义好 props 参数列表，visible 作为组件内部状态控制弹框打开关闭

```javascript
export default {
  props: [
    'title',
    'content',
    'showCancel',
    'cancelColor',
    'cancelText',
    'confirmText',
    'confirmColor'
  ],

  data() {
    return {
      visible: false
    }
  }
}
```

## 组件包装

`common/components/modal/index.js`

先利用 vue 的 extend 拿到刚编写的模板

```javascript
import Vue from 'vue'

const ModalConstructor = Vue.extend(require('./modal.vue'))

const Modal = (opts = {}) => {
  let _m = new ModalConstructor({ el: document.createElement('div') })
}

export default Modal
```

配置好默认参数，并将 visible 状态打开以显示弹框，最终插入页面

```javascript
import Vue from 'vue'

const ModalConstructor = Vue.extend(require('./modal.vue'))

const Modal = (opts = {}) => {
  let _m = new ModalConstructor({ el: document.createElement('div') })

  _m.title = opts.title || '提示'
  _m.content = opts.content || ''
  _m.showCancel = opts.showCancel || false
  _m.cancelText = opts.cancelText || '取消'
  _m.cancelColor = opts.cancelColor || '#000'
  _m.confirmText = opts.confirmText || '确定'
  _m.confirmColor = opts.confirmColor || '#ff7400'
  _m.visible = true

  document.body.appendChild(_m.$el)
}

export default Modal
```

用户点击二次确认事件后，为了方便组件外部捕捉，这里使用 Promise 包装回调事件

> 这样 handleConfirm() 放在这里实现是不是就方便很多了

```javascript
import Vue from 'vue'

const ModalConstructor = Vue.extend(require('./modal.vue'))

const Modal = (opts = {}) => {
  let _m = new ModalConstructor({ el: document.createElement('div') })

  _m.title = opts.title || '提示'
  _m.content = opts.content || ''
  _m.showCancel = opts.showCancel || false
  _m.cancelText = opts.cancelText || '取消'
  _m.cancelColor = opts.cancelColor || '#000'
  _m.confirmText = opts.confirmText || '确定'
  _m.confirmColor = opts.confirmColor || '#ff7400'
  _m.visible = true

  document.body.appendChild(_m.$el)

  return new Promise(resolve => {
    return (_m.handleConfirm = () => {
      _m.visible = false
      resolve()
    })
  })
}

export default Modal
```

## 最终长这样

```javascript
import Modal from 'common/components/modal'

async handleModal() {
  await Modal({
    title: '确定现在申请结束吗？',
    content: '申请后预计1-5个工作日可退出',
    cancelColor: '#ff7400',
    confirmColor: '#000',
    showCancel: true
  })

  console.log('用户确认了！')
}
```
