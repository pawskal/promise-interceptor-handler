### Promise Interceptor Handler

Handle promises set when errored and repeat failed sequence after refresh function

### Dirty example

``` typescript
import RequestsInterceptor from '../index'

const interceptor = new RequestsInterceptor(
  () => new Promise(r => setTimeout(r, 10000)),
  () => true
)

const reqs: any[] = []

const fn = (arg: any) => { 
  return new Promise((rs, rj) => {
    setTimeout(() => {
        if(arg % 4 == 0 && !reqs.includes(arg)) {
            reqs.push(arg);
            (rj({ status: false }), console.log('fail', arg))
        } else {
          (rs(arg), console.log('success', arg))
        }
    }, Math.random() * 2000)
  })
}

Promise.all(
  Array.from({ length: 17 }).map((_, i) => interceptor.exec(fn.bind(null, i)))
).then(data => console.log(data))
.catch(() => console.log('&&&&&&&&&&&&&'))

setTimeout(() => {
  Promise.all(
    Array.from({ length: 17 }).map((_, i) => interceptor.exec(fn.bind(null, i * 2)).then(( data ) => (console.log({i, data}), data)))
    ).then(data => console.log(data))
  .catch(() => console.log('&&&&&&&&&&&&&'))
}, 7000)

setTimeout(() => {
  Promise.all(
    Array.from({ length: 17 }).map((_, i) => interceptor.exec(fn.bind(null, i * 3)))
  ).then(data => console.log(data))
  .catch(() => console.log('&&&&&&&&&&&&&'))
}, 15000)

```