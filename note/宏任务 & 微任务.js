console.log('start here') // 1

const foo = () =>
  new Promise((resolve, reject) => {
    console.log('first promise constructor') // 2

    let promise1 = new Promise((resolve, reject) => {
      console.log('second promise constructor') // 3

      setTimeout(() => {
        console.log('setTimeout here') // 7 宏任务
        resolve()
      }, 0)

      resolve('promise1') // 微任务优先
    })

    resolve('promise0') // 微任务优先

    promise1.then(arg => {
      console.log(arg) // 5
    })
  })

foo().then(arg => {
  console.log(arg) // 6
})

console.log('end here') // 4
