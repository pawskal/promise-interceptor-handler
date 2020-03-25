import { ISubscriptionContainer, RefreshFn, ComparatorFn, SubscriptionFn } from "./types";


export class PromiseInterceptorHandler {
  subscriptions: Array<ISubscriptionContainer> = []
  refreshPromise!: Promise<unknown>;
  constructor(public refreshFn: RefreshFn, public comparator: ComparatorFn) {}
  protected invokeRefresh() {
    if(!this.refreshPromise) {
      this.refreshPromise = this.refreshFn()
      this.refreshPromise
        .then(() => {
          this.subscriptions.forEach((item) => item.fn()
            .then((data: unknown) => item.subscription(data))
            .catch((err: Error) => item.subscription(err, false))
            .finally(() => {
              const index = this.subscriptions.indexOf(item)
              index !== -1 && this.subscriptions.splice(index, 1)
            }))
        }).catch(() => {
          this.subscriptions.forEach(({ err, subscription }) => subscription(err, false))
          this.subscriptions = []
        }).finally(() => {
          delete this.refreshPromise
        })
        
    }
  } 

  protected intercept(err: Error, fn: Function, subscription: SubscriptionFn) {
    const shouldHndle = this.comparator(err)
    if(shouldHndle) {
      this.subscriptions.push({
        err,
        fn,
        subscription
      })
      this.invokeRefresh()
    } else {
      subscription(err, false)
    }
  }

  exec(fn: Function) {
    let resolve: (value?: unknown | PromiseLike<unknown>) => void, reject: (reason?: any) => void;
     
    const promise = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    })

    const subscription: SubscriptionFn = function (data, success = true) {
      success 
        ? resolve(data)
        : reject(data)
    }
    fn()
      .then(subscription)
      .catch((err: Error) => this.intercept(err, fn, subscription))
    
    return promise
  }
}
