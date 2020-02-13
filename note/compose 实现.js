// const compose = function(...funcs) {
//   return funcs.reduce(function(a, b) {
//     return function(...arg) {
//       return a(b(...arg))
//     }
//   })
// }
// 等于
// const compose = function(...funcs) {
//   return funcs.reduce(function(a, b) {
//     return function(...arg) {
//       return a.call(this, b.apply(this, arg))
//     }
//   })
// }
// 等于
// const compose = function(...funcs) {
//   return funcs.reduce(function(a, b) {
//     return function(...arg) {
//       return a(b.apply(this, arg))
//     }
//   })
// }

// const compose = function(...args) {
//   let length = args.length
//   let count = args.length - 1
//   let result
//   return function func(...arg) {
//     // 这里 ...arg 展开导致 'hello world' => ['hello world']
//     // 所以 args[count](arg) 等于 args[count](['hello world'])，因此会出现隐式转换的 bug，类型变了
//     console.log(arg)
//     console.log(args[count])
//     // result = args[count].apply(this, arg) 所以 apply 只是为了还原参数，this/null 都可以
//     result = args[count](...arg) // 这样写也行
//     if (count <= 0) {
//       count = length - 1
//       return result
//     }
//     count--
//     // 用 call 是表明这里没有用到 this，参考上面我注释的 reduce 实现，this/null 都可以
//     return func(result)
//   }
// }

const compose = function(...args) {
  let init = args.pop()
  return function(...arg) {
    return args.reverse().reduce(function(sequence, func) {
      return sequence.then(function(result) {
        return func(result)
      })
    }, Promise.resolve(init(...arg)))
  }
}

let toUpperCase = x => x.toUpperCase()
let exclaim = x => x + '!'
let shout = compose(toUpperCase, exclaim)
console.log(shout('hello world'))
// shout('hello world').then(r => console.log(r)) // promise
