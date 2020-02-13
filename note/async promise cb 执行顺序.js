async function async1() {
  console.log('async1 start') // 2
  await async2() // 返回的是 promise，中断执行
  console.log('async1 end') // 6
}

async function async2() {
  console.log('async2') // 3 async2 函数内并没有 await，按顺序执行，async2 函数仍然返回一个 promise
}

console.log('script start') // 1

setTimeout(function() {
  console.log('setTimeout') // 8
}, 0)

async1()

new Promise(function(resolve) {
  console.log('promise1') // 4
  resolve()
}).then(function() {
  console.log('promise2') // 7
})

console.log('script end') // 5
